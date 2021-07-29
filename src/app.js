import React from 'react';
import ReactDOM from 'react-dom';
import Main from './components/Main';

// Load library
H5P = H5P || {};
H5P.TextGrouping = (() => {
  function TextGrouping(params, contentId, extras) {
    // Initialize event inheritance
    H5P.EventDispatcher.call(this);
    H5P.Question.call(this, 'textgrouping');

    let randomizedTextItems = [];

    // Construct text item elements for categorized words
    params.textGroups.forEach((category, i) => {
      category.textElements.forEach((element, j) => {
        randomizedTextItems.push([`${i}${j}`, element, false]);
      });
    });

    // Construct text item elements for distractor words
    params.distractorGroup.forEach((element, i) => {
      randomizedTextItems.push([`${params.textGroups.length}${i}`, element, false]);
    });

    // Randomize order of text items
    for (let i = randomizedTextItems.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [randomizedTextItems[i], randomizedTextItems[j]] = [
        randomizedTextItems[j], randomizedTextItems[i]
      ];
    }

    const context = {
      params: params,
      l10n: params.l10n,
      instance: this,
      contentId: contentId,
      randomizedTextItems: randomizedTextItems
    };

    this.contentId = contentId;
    this.params = params;
    this.extras = extras || {};

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
  }

  TextGrouping.prototype = Object.create(H5P.Question.prototype);
  TextGrouping.prototype.constructor = TextGrouping;

  return TextGrouping;
})();
