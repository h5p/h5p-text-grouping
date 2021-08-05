import React, { useState, useContext, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

import { H5PContext } from '../../context/H5PContext';
import isCorrectlyPlaced from '../../helpers/isCorrectlyPlaced';
import Button from '../commons/Button';
import SingleDropdownSelect from '../commons/SingleDropdownSelect';
import TipButton from '../commons/TipButton';
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
  moveTextItems,
  textElement,
  shouldAnimate,
  isShowSolutionItem,
  removeAnimations,
  setContainerHeight,
  resetContainerHeight,
  setDraggedTextItem
}) {
  const { instance, l10n, params, showSelectedSolutions, focusedTextItem, setFocusedTextItem } = useContext(H5PContext);
  const [dropdownSelectOpen, setDropdownSelectOpen] = useState(false);
  const textItemRef = useRef(null);
  const buttonRef = useRef(null);

  // Booleans for displaying solution states
  const uncategorizedId = categories.length - 1;
  const isNotUncategorized = uncategorizedId !== currentCategoryId;
  const shouldShowCorrectSolution =
    showSelectedSolutions &&
    !isShowSolutionItem &&
    (isNotUncategorized || !params.behaviour.penalties); // Always show unless when in uncategorized penalties is enabled
  const shouldShowWrongSolution =
    showSelectedSolutions && !isShowSolutionItem && isNotUncategorized; // Never show wrong in uncategorized
  const correctlyPlaced = isCorrectlyPlaced(textItemId, currentCategoryId);
  const shouldShowUnselectedSolution = showSelectedSolutions && isShowSolutionItem;

  // Sets focus to the button
  useEffect(() => {
    if (focusedTextItem === textItemId) {
      buttonRef.current.focus();
      setFocusedTextItem(null);
    }
  }, [focusedTextItem]);

  const handleDropdownSelectOpen = () => {
    setDropdownSelectOpen(true);
    instance.trigger('resize');
  };

  const handleDropdownSelectAction = (categoryId = null) => {
    if (categoryId !== null) {
      moveTextItems([{textItemId: textItemId, newCategoryId: categoryId, prevCategoryId: currentCategoryId}]);
      setFocusedTextItem(textItemId);
    }
    setDropdownSelectOpen(false);
    resetContainerHeight();
    instance.trigger('resize');
  };

  const setHeight = (height) => {
    // If the dropdown can't fit in the textItem
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
      event.target === buttonRef.current
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
        correct: shouldShowCorrectSolution && correctlyPlaced,
        wrong: shouldShowWrongSolution && !correctlyPlaced,
        'show-correct': shouldShowUnselectedSolution
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
              {shouldShowUnselectedSolution || shouldShowWrongSolution ? (
                <TipButton tip={'Wrong category'}>
                  <div aria-hidden="true" className="swap-icon" />
                </TipButton>
              ) : null}
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
              ref={buttonRef}
            />
          )}
          {dropdownSelectOpen ? (
            <div className="dropdown-wrapper">
              <SingleDropdownSelect
                label={l10n.moveItemsHelpText}
                setContainerHeight={setHeight}
                resetContainerHeight={resetContainerHeight}
                onChange={(categoryId) => handleDropdownSelectAction(categoryId)}
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
  moveTextItems: PropTypes.func.isRequired,
  textElement: PropTypes.string.isRequired,
  shouldAnimate: PropTypes.bool.isRequired,
  isShowSolutionItem: PropTypes.bool.isRequired,
  removeAnimations: PropTypes.func.isRequired,
  resetContainerHeight: PropTypes.func.isRequired,
  setDraggedTextItem: PropTypes.func.isRequired,
};
