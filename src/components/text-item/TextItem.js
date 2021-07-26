import React from 'react';
import PropTypes from 'prop-types';

import './TextItem.scss';
import PropTypes from 'prop-types';
import Button from '../commons/Button';

/**
 * A TextItem represents what the user is trying to
 * place in the correct category.
 * It renders the text received through parameters,
 * and a button to move to a different category.
 * @param {String} displayedText the text to be displayed
 */
export default function TextItem({displayedText}) {

  let moveToCategory = () => {
    // TODO: Dummy function
    console.log('Move to category button pressed');
  }

  //TODO: get aria and hover text from l10n instead of hard code
  return (
    <div className='text-item-border'>
      <div className='text-item'>
        {displayedText}
        <Button iconName='icon-move-to-category' className='button-move-to-category'
        ariaLabel={'Move to category'} hoverText='Move to category' onClick={moveToCategory}/>
      </div>
    </div>
    );
}

TextItem.propTypes = {
  displayedText: PropTypes.string.isRequired
};
