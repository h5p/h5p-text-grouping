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
export default function TextItem({ id, moveTextItem, displayedText, buttonAriaLabel, buttonHoverText, animate }) {
  const moveToCategory = () => {
    // TODO: Dummy function
    moveTextItem(id, 0); // TODO: change to category id from dropdown
  };

  return (
    <li className={`text-item-wrapper${animate ? ' animate' : ''}`}>
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
    </li>
  );
}

TextItem.propTypes = {
  id: PropTypes.string.isRequired,
  moveTextItem: PropTypes.func.isRequired,
  displayedText: PropTypes.string.isRequired,
  buttonAriaLabel: PropTypes.string,
  buttonHoverText: PropTypes.string
};
