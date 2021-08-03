import React, { useState, useContext, useRef } from 'react';
import PropTypes from 'prop-types';

import { H5PContext } from '../../context/H5PContext';
import Button from '../commons/Button';
import SingleDropdownSelect from '../commons/SingleDropdownSelect';
import './TextItem.scss';
import getClassNames from '../../helpers/getClassNames';
import isCorrectlyPlaced from '../../helpers/isCorrectlyPlaced';

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
  removeAnimations,
  setContainerHeight,
  resetContainerHeight
}) {
  const { instance, l10n, showSelectedSolutions } = useContext(H5PContext);
  const [dropdownSelectOpen, setDropdownSelectOpen] = useState(false);
  const textItemRef = useRef(null);

  const handleDropdownSelectOpen = () => {
    setDropdownSelectOpen(true);
    instance.trigger('resize');
  };

  const handleDropdownSelectClose = () => {
    applyAssignment();
    setDropdownSelectOpen(false);
    resetContainerHeight();
    instance.trigger('resize');
  };

  const selectCategory = (categoryId) => {
    moveTextItem(textItemId, categoryId);
    handleDropdownSelectClose();
  };

  const setHeight = (height) => {
    // If the dropdown can't fit in the textitem
    if (height > textItemRef.current.offsetHeight / 2) {
      const offset =
        textItemRef.current.offsetTop +
        textItemRef.current.offsetHeight +
        (height - textItemRef.current.offsetHeight / 2);
      setContainerHeight(offset);
    }
  };

  return (
    <li
      className={getClassNames({
        'text-item-wrapper': true,
        animate: shouldAnimate,
        correct: showSelectedSolutions && isCorrectlyPlaced(textItemId, currentCategoryId),
        wrong: showSelectedSolutions && !isCorrectlyPlaced(textItemId, currentCategoryId)
      })}
      ref={textItemRef}
      onAnimationEnd={removeAnimations}
    >
      <div className="text-item-border">
        <div className="text-item">
          <div dangerouslySetInnerHTML={{ __html: textElement }} />
          {showSelectedSolutions ? (
            <div className="solution-icon" />
          ) : (
            <Button
              iconName="icon-move-to-category"
              className="button-move-to-category"
              ariaLabel={l10n.ariaMoveToCategory}
              hoverText={l10n.hoverMoveToCategory}
              onClick={handleDropdownSelectOpen}
            />
          )}
          {dropdownSelectOpen ? (
            <div className="dropdown-wrapper">
              <SingleDropdownSelect
                label={l10n.moveItemsHelpText}
                setContainerHeight={setHeight}
                resetContainerHeight={resetContainerHeight}
                onChange={(categoryId) => selectCategory(categoryId)}
                onClose={handleDropdownSelectClose}
                options={categories}
                currentlySelectedId={currentCategoryId}
              />
            </div>
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
  removeAnimations: PropTypes.func.isRequired,
  setContainerHeight: PropTypes.func.isRequired,
  resetContainerHeight: PropTypes.func.isRequired
};
