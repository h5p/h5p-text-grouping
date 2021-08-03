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

    // Randomize order of text items
    for (let i = randomizedTextItems.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [randomizedTextItems[i], randomizedTextItems[j]] = [
        randomizedTextItems[j],
        randomizedTextItems[i]
      ];
    }

    let categoryState = null;

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
    const triggerAnswered = (currentCategoryState) => {
      categoryState = currentCategoryState;
      this.trigger(
        getAnsweredXAPIEvent(
          this,
          this.params.question,
          this.params.textGroups,
          this.getScore(),
          this.getMaxScore(),
          this.isPassed(),
          categoryState
        )
      );
    };

    const context = {
      params: params,
      l10n: params.l10n,
      instance: this,
      contentId: contentId,
      randomizedTextItems: randomizedTextItems,
      triggerInteracted: triggerInteracted,
      triggerAnswered: triggerAnswered,
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
     * Get latest score
     * @return {number} latest score
     * @see contract at {@link https://h5p.org/documentation/developers/contracts#guides-header-2}
     */
    this.getScore = () => {
      // TODO: Dummy metod
      return 5;
    };

    /**
     * Get maximum possible score
     * @return {number} Score necessary for mastering
     * @see contract at {@link https://h5p.org/documentation/developers/contracts#guides-header-3}
     */
    this.getMaxScore = () => {
      // TODO: Dummy metod
      return 10;
    };

    /**
     * Get whether the user has achieved a passing score or not
     * @return {boolean} True if passed, false if not
     */
    this.isPassed = () => {
      // TODO: Dummy metod
      return true;
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
      return getXAPIData(
        this,
        this.params.question,
        this.params.textGroups,
        this.getScore(),
        this.getMaxScore(),
        this.isSuccess(),
        categoryState,
      );
    };
  }

  // /**
  //  * Check answer.
  //  */
  // this.checkAnswer = () => {
  //   this.content.disableSelectables();

  //   const score = this.getScore();
  //   const maxScore = this.getMaxScore();
  //   const textScore = H5P.Question.determineOverallFeedback(
  //     this.params.overallFeedback,
  //     score / maxScore
  //   );

  //   this.setFeedback(textScore, score, maxScore, this.params.l10n.result);

  //   if (this.params.behaviour.enableSolutionsButton && score !== maxScore) {
  //     this.showButton('show-solution');
  //   }

  //   if (this.params.behaviour.enableRetry && score !== maxScore) {
  //     this.showButton('try-again');
  //   }

  //   this.hideButton('check-answer');

  //   this.content.showSelectedSolutions();
  // };

  TextGrouping.prototype = Object.create(H5P.Question.prototype);
  TextGrouping.prototype.constructor = TextGrouping;

  return TextGrouping;
})();
