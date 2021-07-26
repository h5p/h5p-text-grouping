import React from 'react';
import PropTypes from 'prop-types';

import Button from '../commons/Button';
import './TextItem.scss';

/**
 * A TextItem represents what the user is trying to
 * place in the correct category.
 * It renders the text received through parameters,
 * and a button to move to a different category.
 * @param {object} props Props object
 * @returns {JSX.Element} A single text item with button
 */
export default function TextItem({ displayedText, buttonAriaLabel, buttonHoverText }) {
  let moveToCategory = () => {
    // TODO: Dummy function
    console.log('Move to category button pressed');
  };

  return (
    <div className="text-item-border">
      <div className="text-item">
        <div dangerouslySetInnerHTML={{ __html: displayedText }} />
        <Button
          iconName="icon-move-to-category"
          className="button-move-to-category"
          ariaLabel={buttonAriaLabel}
          hoverText={buttonHoverText}
          onClick={moveToCategory}
        />
      </div>
    </div>
  );
}

TextItem.propTypes = {
  displayedText: PropTypes.string.isRequired,
  buttonAriaLabel: PropTypes.string,
  buttonHoverText: PropTypes.string
};
