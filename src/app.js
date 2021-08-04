import React from 'react';
import ReactDOM from 'react-dom';
import Main from './components/Main';
import { getXAPIData, getCurrentState, getAnsweredXAPIEvent } from './helpers/xAPI';

// Load library
H5P = H5P || {};
H5P.TextGrouping = (() => {
  function TextGrouping(params, contentId, extras) {
    // Initialize event inheritance
    H5P.EventDispatcher.call(this);
    H5P.Question.call(this, 'textgrouping');

    this.contentId = contentId;
    this.params = params;
    this.extras = extras || {};
    this.showSelectedSolutions = false;

    let categoryState = null;
    const initiateCategoryState = () => {
      categoryState = [...this.params.textGroups.map(() => []), randomizedTextItems.slice()];
    };

    const createTextItem = (id, content, shouldAnimate) => ({
      id,
      content,
      shouldAnimate
    });
    let randomizedTextItems = [];

    // Construct text item elements for categorized words
    params.textGroups.forEach((category, i) => {
      category.textElements.forEach((element, j) => {
        randomizedTextItems.push(createTextItem(`${i}${j}`, element, false));
      });
    });

    // Construct text item elements for distractor words
    params.distractorGroup.forEach((element, i) => {
      randomizedTextItems.push(createTextItem(`${params.textGroups.length}${i}`, element, false));
    });

    let reset = true;

    /**
     * Randomizes the order of text items, if reset has been set
     * since last time they were randomized.
     *
     * @return {object[]} An array of text item objects
     */
    const getRandomizedTextItems = () => {
      if (reset) {
        for (let i = randomizedTextItems.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [randomizedTextItems[i], randomizedTextItems[j]] = [
            randomizedTextItems[j],
            randomizedTextItems[i]
          ];
        }
        initiateCategoryState();
        reset = false;
      }
      return randomizedTextItems;
    };

    initiateCategoryState();

    /**
     * Updates the state and triggers xAPI interacted event
     *
     * @param {Object[][]} currentCategoryAssignement Array describing which text items are in each category
     */
    const triggerInteracted = (currentCategoryState) => {
      categoryState = currentCategoryState;
      this.triggerXAPI('interacted');
    };

    /**
     * Updates the state and triggers xAPI answered event
     *
     * @param {Object[][]} currentCategoryAssignement Array describing which text items are in each category
     */
    const triggerAnswered = () => {
      const score = this.getScore();
      const maxScore = this.getMaxScore();
      this.trigger(
        getAnsweredXAPIEvent(
          this,
          this.params.question,
          this.params.textGroups,
          score,
          maxScore,
          this.isPassed(score, maxScore),
          categoryState
        )
      );
    };

    const context = {
      params: params,
      l10n: params.l10n,
      instance: this,
      contentId: contentId,
      getRandomizedTextItems: getRandomizedTextItems,
      triggerInteracted: triggerInteracted,
      showSelectedSolutions: this.showSelectedSolutions
    };

    // Register task media
    if (context.params.media && context.params.media.type && context.params.media.type.library) {
      const media = context.params.media.type;

      // Register task image
      if (media.library.includes('H5P.Image')) {
        if (media.params.file) {
          this.setImage(media.params.file.path, {
            disableImageZooming: params.media.disableImageZooming || false,
            alt: media.params.alt,
            title: media.params.title
          });
        }
      }
      else if (media.library.includes('H5P.Video')) {
        if (media.params.sources) {
          // Register task video
          this.setVideo(media);
        }
      }
    }

    // Register task introduction text
    if (context.params.question) {
      this.introduction = document.createElement('div');
      this.introduction.innerHTML = context.params.question;
      this.introduction.setAttribute('id', `h5p-text-grouping${contentId}`);
      this.setIntroduction(this.introduction);
    }

    const wrapper = document.createElement('div');
    const main = (
      <div>
        <Main context={context} />
      </div>
    );
    this.setContent(ReactDOM.render(main, wrapper));

    /**
     * Get whether the user has achieved a passing score or not
     * @return {boolean} True if passed, false if not
     */
    this.isPassed = (score, maxScore) => {
      return (score / maxScore) * 100 >= this.params.behaviour.passPercentage;
    };

    /**
     * Calculates the maximum possible score,
     * but does not take into account the singlePoint setting
     * @returns {number} max score possible without singlePoint
     */
    this.calculateMaxScore = () => {
      let maxScore = 0;
      this.params.textGroups.forEach((category) => {
        maxScore += category.textElements.length;
      });
      if (!this.params.behaviour.penalties) {
        maxScore += this.params.distractorGroup.length;
      }
      return maxScore;
    };

    /**
     * Get latest score
     *
     * Text items in the correct category are worth 1 point.
     * Text items in the incorrect category are worth -1 point.
     * Text items Uncategorized are not counted.
     * The score cannot be lower than 0.
     *
     * If singlePoint is enabled, the score is either 1 or 0,
     * depending on isPassed()
     *
     * @return {number} latest score
     * @see contract at {@link https://h5p.org/documentation/developers/contracts#guides-header-2}
     */
    this.getScore = () => {
      let score = 0;
      const penalties = this.params.behaviour.penalties;

      categoryState.forEach((category, categoryIndex) => {
        // If penalties is selected, words in uncategorized should not be counted
        if (!penalties || categoryIndex !== categoryState.length - 1) {
          category.forEach((textItem) => {
            if (textItem.id.substring(0, 1) == categoryIndex) {
              score++;
            }
            else if (penalties) {
              score--;
            }
          });
        }
      });

      if (this.params.behaviour.singlePoint) {
        return this.isPassed(score, this.calculateMaxScore()) ? 1 : 0;
      }

      return score >= 0 ? score : 0;
    };

    /**
     * Get maximum possible score
     *
     * Distractor words do not contribute to scoring.
     * If singlePoint is enabled, the max score is 1.
     *
     * @return {number} Max score achievable for this task
     * @see contract at {@link https://h5p.org/documentation/developers/contracts#guides-header-3}
     */
    this.getMaxScore = () => {
      return this.params.behaviour.singlePoint ? 1 : this.calculateMaxScore();
    };

    /**
     * Packs the current state of the users interactivity into a
     * serializable object.
     * @public
     */
    this.getCurrentState = () => {
      return getCurrentState(categoryState);
    };

    /**
     * Retrieves the xAPI data necessary for generating result reports
     * @see contract at {@link https://h5p.org/documentation/developers/contracts#guides-header-6}
     */
    this.getXAPIData = () => {
      const score = this.getScore();
      const maxScore = this.getMaxScore();

      return getXAPIData(
        this,
        this.params.question,
        this.params.textGroups,
        score,
        maxScore,
        this.isPassed(score, maxScore),
        categoryState
      );
    };

    // Add H5P buttons
    this.addButton(
      'check-answer',
      this.params.l10n.checkAnswerButtonText,
      () => {
        this.checkAnswer();
      },
      true,
      { 'aria-label': this.params.l10n.checkAnswer },
      {
        confirmationDialog: {
          enable: this.params.behaviour.confirmCheckDialog,
          l10n: this.params.l10n.confirmCheck,
          instance: this
        }
      }
    );
    this.addButton(
      'try-again',
      this.params.l10n.retryText,
      () => {
        this.resetTask();
      },
      false,
      { 'aria-label': this.params.l10n.retry },
      {
        confirmationDialog: {
          enable: this.params.behaviour.confirmRetryDialog,
          l10n: this.params.l10n.confirmRetry,
          instance: this
        }
      }
    );

    /**
     * Check answer.
     */
    this.checkAnswer = () => {
      // this.content.disableSelectables();

      const score = this.getScore();
      const maxScore = this.getMaxScore();
      const textScore = H5P.Question.determineOverallFeedback(
        this.params.overallFeedback,
        score / maxScore
      );

      this.setFeedback(textScore, score, maxScore, this.params.l10n.result);

      // if (this.params.behaviour.enableSolutionsButton && score !== maxScore) {
      //   this.showButton('show-solution');
      // }

      // if (this.params.behaviour.enableRetry && score !== maxScore) {
      //   this.showButton('try-again');
      // }

      this.hideButton('check-answer');

      if (this.params.behaviour.enableRetry && this.getScore() !== this.getMaxScore()) {
        this.showButton('try-again');
      }

      this.showSelectedSolutions = true;
      this.trigger('resize');

      triggerAnswered();
    };

    /**
     * Resets buttons, solutions and positions of the text items
     *
     * @see contract at {@link https://h5p.org/documentation/developers/contracts#guides-header-5}
     */
    this.resetTask = () => {
      reset = true;
      this.trigger('reset-task');

      //resetSelections();
      this.showButton('check-answer');
      this.hideButton('try-again');
      this.hideButton('show-solution');
      //hideSolutions();
      this.removeFeedback();
    };
  }

  TextGrouping.prototype = Object.create(H5P.Question.prototype);
  TextGrouping.prototype.constructor = TextGrouping;

  return TextGrouping;
})();
