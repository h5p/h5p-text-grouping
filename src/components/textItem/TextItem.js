import React, { useState, useContext, useRef } from 'react';
import PropTypes from 'prop-types';

import { H5PContext } from '../../context/H5PContext';
import isCorrectlyPlaced from '../../helpers/isCorrectlyPlaced';
import Button from '../commons/Button';
import SingleDropdownSelect from '../commons/SingleDropdownSelect';
import getClassNames from '../../helpers/getClassNames';

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
  removeAnimations,
  setContainerHeight,
  resetContainerHeight,
  setDraggedTextItem
}) {
  const { instance, l10n, showSelectedSolutions } = useContext(H5PContext);
  const [dropdownSelectOpen, setDropdownSelectOpen] = useState(false);
  const textItemRef = useRef(null);

  const uncategorizedId = categories.length - 1;
  const showSolution = showSelectedSolutions && uncategorizedId !== currentCategoryId;
  const correctlyPlaced = isCorrectlyPlaced(textItemId, currentCategoryId);

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
    moveTextItem(textItemId, categoryId, currentCategoryId);
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

  /**
   * Start dragging text item
   * @param {*} event MouseDown event
   * @param {*} textItemId Id of text item being dragged
   * @param {*} currentCategoryId ID of current category of text item
   */
  const mouseDownHandler = (event) => {
    if (
      dropdownSelectOpen ||
      showSelectedSolutions ||
      event.button !== 0 ||
      event.target.className.includes('button-move-to-category')
    ) {
      return;
    }
    event.preventDefault();
    setDraggedTextItem({ textItemId: textItemId, categoryId: currentCategoryId });
  };

  return (
    <li
      className={getClassNames({
        'text-item-wrapper': true,
        animate: shouldAnimate,
        correct: showSolution && correctlyPlaced,
        wrong: showSolution && !correctlyPlaced
      })}
      ref={textItemRef}
      onAnimationEnd={removeAnimations}
      onMouseDown={(event) => mouseDownHandler(event)}
    >
      <div className="text-item-border">
        <div className="text-item">
          <div dangerouslySetInnerHTML={{ __html: textElement }} />
          {showSelectedSolutions ? (
            <>
              <div aria-hidden="true" className="solution-icon" />
              <span className="offscreen">
                {correctlyPlaced ? l10n.correctAnswer : l10n.wrongAnswer}
              </span>
            </>
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
  ).isRequired,
  moveTextItem: PropTypes.func.isRequired,
  applyAssignment: PropTypes.func.isRequired,
  textElement: PropTypes.string.isRequired,
  shouldAnimate: PropTypes.bool.isRequired,
  removeAnimations: PropTypes.func.isRequired,
  setContainerHeight: PropTypes.func.isRequired,
  resetContainerHeight: PropTypes.func.isRequired,
  setDraggedTextItem: PropTypes.func.isRequired
};
