import React, { useState, useContext, useRef, useLayoutEffect } from 'react';
import PropTypes from 'prop-types';

import { H5PContext } from '../../context/H5PContext';
import belongsToCategory from '../../helpers/belongsToCategory';
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
  showSwapIcon,
  removeAnimations,
  setContainerHeight,
  draggingStartedHandler,
  narrowScreen
}) {
  const {
    instance,
    l10n,
    showSelectedSolutions,
    showUnselectedSolutions,
    focusedTextItem,
    setFocusedTextItem,
    setDragState
  } = useContext(H5PContext);
  const [dropdownSelectOpen, setDropdownSelectOpen] = useState(false);

  const textItemRef = useRef(null);
  const buttonRef = useRef(null);

  // Booleans for displaying solution states
  const uncategorizedId = categories.length - 1;
  const isNotUncategorized = uncategorizedId !== currentCategoryId;
  const shouldShowSolution = showSelectedSolutions && !isShowSolutionItem && isNotUncategorized; // Always show unless when in uncategorized
  const correctlyPlaced = belongsToCategory(textItemId, currentCategoryId);
  const shouldShowUnselectedSolution = showSelectedSolutions && isShowSolutionItem;
  const shouldShowShowSwapIcon = showUnselectedSolutions && (!correctlyPlaced || showSwapIcon); // Wrong answers as well as uncategorized showSolutionItems gets the swap icon

  // Sets focus to the button
  useLayoutEffect(() => {
    if (focusedTextItem === textItemId) {
      buttonRef.current.focus();
      setFocusedTextItem(null);
    }
  }, [focusedTextItem]);

  /**
   * Opens the dropdown
   */
  const handleDropdownSelectOpen = () => {
    setDropdownSelectOpen(true);
    instance.trigger('resize');
  };

  /**
   * Move the text item to the selected category
   * @param {number} categoryId The id of the category that has been chosen
   */
  const handleDropdownSelectAction = (categoryId = null) => {
    if (categoryId !== null) {
      moveTextItems(
        [{ textItemId: textItemId, newCategoryId: categoryId, prevCategoryId: currentCategoryId }],
        true
      );
    }
    setDropdownSelectOpen(false);
    setContainerHeight(0);
    instance.trigger('resize');
  };

  /**
   * Inform the container of which height is needed to show the text item (with dropdown)
   * @param {number} height The height needed for the dropdown
   */
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
   * @param {MouseEvent} event MouseDown event
   */
  const mouseDownHandler = (event) => {
    if (
      dropdownSelectOpen ||
      showSelectedSolutions ||
      narrowScreen ||
      event.button !== 0 ||
      event.target === buttonRef.current
    ) {
      return;
    }

    // Set drag state and position of mouse, width of text element
    let itemPos = textItemRef.current.getBoundingClientRect();
    let mousePos = { x: event.clientX, y: event.clientY };
    let currentPos = { x: mousePos.x - itemPos.x, y: mousePos.y - itemPos.y };
    let itemWidth = textItemRef.current.offsetWidth;

    setDragState({
      textItemId: textItemId,
      categoryId: currentCategoryId,
      textItemRef: textItemRef,
      dragging: true,
      rel: currentPos
    });

    // Make text item visually draggable
    textItemRef.current.style.position = 'fixed';
    textItemRef.current.style.width = `${itemWidth}px`;
    textItemRef.current.style.zIndex = 1;
    draggingStartedHandler();
    event.preventDefault();
  };

  return (
    <li
      className={getClassNames({
        'text-item-wrapper': true,
        animate: shouldAnimate,
        correct: shouldShowSolution && correctlyPlaced,
        wrong: shouldShowSolution && !correctlyPlaced,
        'show-correct': shouldShowUnselectedSolution
      })}
      ref={textItemRef}
      onAnimationEnd={removeAnimations}
    >
      <div
        className={`text-item-border ${showSelectedSolutions ? 'show-solution' : ''}`}
        onMouseDown={(event) => mouseDownHandler(event)}
      >
        <div className="text-item">
          <div className="text-item-content" dangerouslySetInnerHTML={{ __html: textElement }} />
          {showSelectedSolutions ? (
            <>
              {shouldShowShowSwapIcon ? (
                <TipButton tip={'Wrong category'}>
                  <div aria-hidden="true" className="swap-icon" />
                </TipButton>
              ) : null}
              <div aria-hidden="true" className="solution-icon" />
              <span className="offscreen">
                {isShowSolutionItem
                  ? l10n.shouldHaveBeenPlacedInCategory
                  : correctlyPlaced
                    ? l10n.correctCategory
                    : l10n.wrongCategory}
              </span>
            </>
          ) : (
            <Button
              className="button-move-to-category"
              iconName={getClassNames({
                'icon-move-to-category': true,
                'icon-move-to-category-expanded': dropdownSelectOpen
              })}
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
  showSwapIcon: PropTypes.bool.isRequired,
  removeAnimations: PropTypes.func.isRequired,
  setContainerHeight: PropTypes.func.isRequired,
  draggingStartedHandler: PropTypes.func.isRequired,
  narrowScreen: PropTypes.bool.isRequired
};
