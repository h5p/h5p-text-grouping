import React, { useState, useContext } from 'react';
import PropTypes from 'prop-types';

import { H5PContext } from '../../context/H5PContext';
import Button from '../commons/Button';
import SingleDropdownSelect from '../commons/SingleDropdownSelect';
import './TextItem.scss';

/**
 * A TextItem represents what the user is trying to
 * place in the correct category.
 * It renders the text received through parameters,
 * and a button to move to a different category.
 * @param {object} props Props object
 * @returns {JSX.Element} A single text item with button
 */
export default function TextItem({
  textItemId,
  currentCategoryId,
  categories,
  moveTextItem,
  applyAssignment,
  textElement,
  shouldAnimate,
  removeAnimations
}) {
  const { instance, l10n } = useContext(H5PContext);
  const [dropdownSelectOpen, setDropdownSelectOpen] = useState(false);

  const handleDropdownSelectOpen = () => {
    setDropdownSelectOpen(true);
    instance.trigger('resize');
  };

  const handleDropdownSelectClose = () => {
    applyAssignment();
    setDropdownSelectOpen(false);
    instance.trigger('resize');
  };

  const selectCategory = (categoryId) => {
    moveTextItem(textItemId, categoryId);
    handleDropdownSelectClose();
  };

  return (
    <li
      className={`text-item-wrapper${shouldAnimate ? ' animate' : ''}`}
      onAnimationEnd={removeAnimations}
    >
      <div className="text-item-border">
        <div className="text-item">
          <div dangerouslySetInnerHTML={{ __html: textElement }} />
          <Button
            iconName="icon-move-to-category"
            className="button-move-to-category"
            ariaLabel={l10n.ariaMoveToCategory}
            hoverText={l10n.hoverMoveToCategory}
            onClick={handleDropdownSelectOpen}
          />
          {dropdownSelectOpen ? (
            <SingleDropdownSelect
              label={l10n.moveItemsHelpText}
              onChange={(categoryId) => selectCategory(categoryId)}
              onClose={handleDropdownSelectClose}
              options={categories}
              currentlySelectedId={currentCategoryId}
            />
          ) : null}
        </div>
      </div>
    </li>
  );
}

TextItem.propTypes = {
  textItemId: PropTypes.string.isRequired,
  currentCategoryId: PropTypes.number.isRequired,
  categories: PropTypes.arrayOf(
    PropTypes.shape({
      groupName: PropTypes.string.isRequired
    })
  ),
  moveTextItem: PropTypes.func.isRequired,
  applyAssignment: PropTypes.func.isRequired,
  textElement: PropTypes.string.isRequired,
  shouldAnimate: PropTypes.bool.isRequired,
  removeAnimations: PropTypes.func.isRequired
};
