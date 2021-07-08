import React from 'react';
import ReactDOM from 'react-dom';
import Main from './components/Main';

// Load library
H5P = H5P || {};
H5P.TextGrouping = (() => {
  function TextGrouping(params, contentId, extras) {
    extras = extras || {};

    // Initialize event inheritance
    H5P.EventDispatcher.call(this);
    H5P.Question.call(this, 'textgroupimg');

    const context = {
      params: params,
      l10n: params.l10n,
      instance: this,
      contentId: contentId
    };

    const wrapper = document.createElement('div');
    const main = (<div><Main/></div>)

    this.setContent(ReactDOM.render(
      main,
      wrapper
    ));
  }

  TextGrouping.prototype = Object.create(H5P.Question.prototype);
  TextGrouping.prototype.constructor = TextGrouping;

  return TextGrouping;
})();
