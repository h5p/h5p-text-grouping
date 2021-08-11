import React from 'react';
import ReactDOM from 'react-dom';

import { getXAPIData, getCurrentState, getAnsweredXAPIEvent } from './helpers/xAPI';
import createPlaceholdersIfMissing from './helpers/createPlaceholdersIfMissing';
import belongsToCategory from './helpers/belongsToCategory';
import randomizeArray from './helpers/randomizeArray';
import Main from './components/Main';

// Load library
H5P = H5P || {};
H5P.TextGrouping = (() => {
  function TextGrouping(params, contentId, extras) {
    // Initialize event inheritance
    H5P.EventDispatcher.call(this);
    H5P.Question.call(this, 'text-grouping');

    this.contentId = contentId;
    this.params = params;
    this.extras = extras || {};
    this.params.textGroups = createPlaceholdersIfMissing(this.params.textGroups, this.params.l10n);

    // Builder for a textItem object
    const createTextItem = (id, content, shouldAnimate) => ({
      id,
      content,
      shouldAnimate
    });

    // Construct text item elements for categorized words
    this.randomizedTextItems = randomizeArray(
      this.params.textGroups.flatMap((category, i) =>
        category.textElements.map((element, j) => createTextItem(`${i + 1}${j}`, element, false))
      )
    );

    this.maxScore = this.randomizedTextItems.length;

    this.categoryState = [[...this.randomizedTextItems], ...this.params.textGroups.map(() => [])];

    /**
     * Updates the state and triggers xAPI interacted event
     * @param {object[][]} currentCategoryState Array describing which text items are assigned to which category
     */
    const triggerInteracted = (currentCategoryState) => {
      this.categoryState = currentCategoryState;
      this.triggerXAPI('interacted');
    };

    /**
     * Triggers xAPI answered event
     * @param {object[][]} score score achieved by user
     * @param {object[][]} maxScore max possible score achievable
     */
    const triggerAnswered = (score, maxScore) => {
      this.trigger(
        getAnsweredXAPIEvent(
          this,
          this.params.question,
          this.params.textGroups,
          score,
          maxScore,
          this.isPassed(score, maxScore),
          this.categoryState
        )
      );
    };

    const context = {
      params: params,
      l10n: params.l10n,
      instance: this,
      contentId: contentId,
      getRandomizedTextItems: () => [...this.randomizedTextItems],
      triggerInteracted: triggerInteracted
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

    /**
     * Checks if any items has been assigned to a category
     * @returns {boolean} true if there are no assigned items, false otherwise
     */
    this.hasNotAnswered = () => {
      const currentlyUncategorizedItems = this.categoryState[0];

      // If all items are uncategorized, then there has been no change
      return this.randomizedTextItems.length === currentlyUncategorizedItems.length;
    };

    /**
     * Get whether the user has achieved a passing score or not
     * @return {boolean} True if passed, false if not
     */
    this.isPassed = (score, maxScore) => {
      return (score / maxScore) * 100 >= this.params.behaviour.passPercentage;
    };

    /**
     * Get latest score unnecessary
     *
     * Text items in the correct category are worth 1 point.
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

      this.categoryState.forEach((category, categoryId) => {
        // Words in uncategorized should not be counted
        if (categoryId !== 0) {
          category.forEach((textItem) => {
            if (belongsToCategory(textItem.id, categoryId)) {
              score++;
            }
          });
        }
      });

      if (this.params.behaviour.singlePoint) {
        return this.isPassed(score, this.maxScore) ? 1 : 0;
      }

      return score;
    };

    /**
     * Get maximum possible score
     * If singlePoint is enabled, the max score is 1.
     *
     * @return {number} Max score achievable for this task
     * @see contract at {@link https://h5p.org/documentation/developers/contracts#guides-header-3}
     */
    this.getMaxScore = () => {
      return this.params.behaviour.singlePoint ? 1 : this.maxScore;
    };

    /**
     * Packs the current state of the users interactivity into a
     * serializable object.
     * @public
     */
    this.getCurrentState = () => {
      return getCurrentState(this.categoryState);
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
        this.categoryState
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
      'show-solution',
      this.params.l10n.showSolutionButtonText,
      () => {
        this.showSolutions();
      },
      false,
      { 'aria-label': this.params.l10n.showSolution },
      {}
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
     * Check answer and show appropriate feedback.
     * Changes the visible buttons according to editor settings and
     * if the maximum score is achieved.
     */
    this.checkAnswer = () => {
      this.hideButton('check-answer');

      const score = this.getScore();
      const maxScore = this.getMaxScore();
      const textScore = H5P.Question.determineOverallFeedback(
        this.params.overallFeedback,
        score / maxScore
      );

      this.setFeedback(textScore, score, maxScore, this.params.l10n.result);
      triggerAnswered(score, maxScore);

      if (this.params.behaviour.enableSolutionsButton && score !== maxScore) {
        this.showButton('show-solution');
      }

      if (this.params.behaviour.enableRetry && score !== maxScore) {
        this.showButton('try-again');
      }

      this.trigger('resize');
    };

    /**
     * Show solutions.
     * If show solution requires an answer and none has been given
     * a "no answer given" text will be shown instead.
     * @see contract at {@link https://h5p.org/documentation/developers/contracts#guides-header-4}
     */
    this.showSolutions = () => {
      this.hideButton('check-answer');
      this.hideButton('show-solution');

      if (this.params.behaviour.showSolutionsRequiresInput && this.hasNotAnswered()) {
        // Require answer before solution can be viewed
        this.updateFeedbackContent(this.params.l10n.noAnswer);
        this.read(this.params.l10n.noAnswer);
      }
      else {
        this.trigger('show-solution');
      }

      this.trigger('resize');
    };

    /**
     * Resets buttons, solutions, scrambles the initial order of the
     * text items and puts them in uncategorized.
     * @see contract at {@link https://h5p.org/documentation/developers/contracts#guides-header-5}
     */
    this.resetTask = () => {
      this.randomizedTextItems = randomizeArray(this.randomizedTextItems);
      this.categoryState = [[...this.randomizedTextItems], ...this.params.textGroups.map(() => [])];
      this.trigger('reset-task');

      this.showButton('check-answer');
      this.hideButton('try-again');
      this.hideButton('show-solution');
      this.removeFeedback();
    };

    // Render react part of application
    const wrapper = document.createElement('div');
    const main = (
      <div>
        <Main context={context} />
      </div>
    );
    this.setContent(ReactDOM.render(main, wrapper));
  }

  // Inheritance & instantiation
  TextGrouping.prototype = Object.create(H5P.Question.prototype);
  TextGrouping.prototype.constructor = TextGrouping;

  return TextGrouping;
})();
