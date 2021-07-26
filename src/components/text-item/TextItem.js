import React from 'react';
import PropTypes from 'prop-types';
import './TextItem.scss';
import Button from '../commons/Button';

/**
 * A TextItem represents what the user is trying to
 * place in the correct category.
 * It renders the text received through parameters,
 * and a button to move to a different category.
 * @param {String} displayedText the text to be displayed
 */
export default function TextItem({displayedText, buttonAriaLabel, buttonHoverText}) {

  let moveToCategory = () => {
    // TODO: Dummy function
    console.log('Move to category button pressed');
  }

  return (
    <div className='text-item-border'>
      <div className='text-item'>
        <div dangerouslySetInnerHTML={{__html: displayedText}}/>
        <Button iconName='icon-move-to-category' className='button-move-to-category'
        ariaLabel={buttonAriaLabel} hoverText={buttonHoverText} onClick={moveToCategory}/>
      </div>
    </div>
    );
}

TextItem.propTypes = {
  displayedText: PropTypes.string.isRequired
};
