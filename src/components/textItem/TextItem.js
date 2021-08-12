import React, { useState, useContext, useRef, useLayoutEffect, useEffect } from 'react';
import PropTypes from 'prop-types';

import { H5PContext } from '../../context/H5PContext';
import belongsToCategory from '../../helpers/belongsToCategory';
import getClassNames from '../../helpers/getClassNames';
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
  moveTextItems,
  textElement,
  shouldAnimate,
  isShowSolutionItem,
  removeAnimations,
  setContainerHeight,
  draggedInfo
}) {
  const {
    instance,
    l10n,
    showSelectedSolutions,
    focusedTextItem,
    setFocusedTextItem,
    setDragState,
    dragState
  } = useContext(H5PContext);
  const [dropdownSelectOpen, setDropdownSelectOpen] = useState(false);
  const [offsetTop, setOffsetTop] = useState(null);

  const isDragged = dragState.textItemId === textItemId;
  const textItemRef = useRef(null);
  const buttonRef = useRef(null);

  // Booleans for displaying solution states
  const uncategorized = currentCategoryId === 0;
  const shouldShowSolution = showSelectedSolutions && !isShowSolutionItem && !uncategorized; // Always show unless when in uncategorized
  const correctlyPlaced = belongsToCategory(textItemId, currentCategoryId);
  const shouldShowUnselectedSolution = showSelectedSolutions && isShowSolutionItem;

  // Set focus to the button
  useLayoutEffect(() => {
    if (focusedTextItem === textItemId) {
      buttonRef.current.focus();
      setFocusedTextItem(null);
    }
  }, [focusedTextItem]);

  // Trigger resize when the dropdown opens or closes
  useEffect(() => {
    instance.trigger('resize');
  }, [dropdownSelectOpen]);

  /**
   * Opens the dropdown
   */
  const handleDropdownSelectOpen = () => {
    const newOffsetTop = textItemRef.current.offsetTop;
    setOffsetTop(newOffsetTop);

    // Set uncategorized maxHeight
    if (uncategorized) {
      setContainerHeight(newOffsetTop + textItemRef.current.offsetHeight, textItemId, false);
    }

    setDropdownSelectOpen(true);
  };

  /**
   * Move the text item to the selected category
   * @param {number} categoryId The id of the category that has been chosen
   */
  const handleDropdownSelectAction = (categoryId = null) => {
    if (categoryId !== null) {
      // Converts the received categoryId from the way it is displayed in dropdown, to the datastructure used in the rest of the code
      // (Dropdown displays Uncategorized at the bottom, while Uncategorized is at index 0 everywhere else)
      const newCategoryId = categoryId !== categories.length - 1 ? categoryId + 1 : 0;

      moveTextItems(
        [
          {
            textItemId: textItemId,
            newCategoryId: newCategoryId,
            prevCategoryId: currentCategoryId
          }
        ],
        true
      );
    }
    setDropdownSelectOpen(false);
    setContainerHeight(0, textItemId);
  };

  /**
   * Inform the container of which height is needed to show the text item (with dropdown)
   * @param {number} height The height needed for the dropdown
   */
  const setHeight = (height) => {
    // If the dropdown can't fit in the textItem
    if (height > textItemRef.current.offsetHeight / 2) {
      // Set container minHeight
      const offset =
        offsetTop +
        textItemRef.current.offsetHeight +
        (height - textItemRef.current.offsetHeight / 2);
      setContainerHeight(offset, textItemId, true);
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
      mouseHasBeenMoved: false,
      dragging: true,
      offset: currentPos,
      width: `${itemWidth}px`
    });

    event.preventDefault();
  };
  /**
   * Prevent MouseEvents from firing on touch
   * Does not cancel the event if swiping has been initiated
   * @param {event} event touchend-event
   * @param {boolean} applyToChildren True if method should prevent mouseevents for children element as well as this element 
   */
  const handleTouch = (event, applyToChildren) => {
    if ((event.target === event.currentTarget || applyToChildren) && event.nativeEvent.cancelable) {
      event.preventDefault();
    }
  };

  return (
    <li
      className={getClassNames({
        'text-item-wrapper': true,
        animate: shouldAnimate,
        correct: shouldShowSolution && correctlyPlaced,
        wrong: shouldShowSolution && !correctlyPlaced,
        'show-correct': shouldShowUnselectedSolution,
        dropDownOpen: dropdownSelectOpen,
        dragged: isDragged
      })}
      ref={textItemRef}
      onAnimationEnd={removeAnimations}
      style={isDragged ? { width: dragState.width, ...draggedInfo.style } : {}}
    >
      <div
        className={getClassNames({
          'text-item-border': true,
          'show-solution': showSelectedSolutions,
          'text-item-selected': isDragged,
          'drag-over-category': isDragged && draggedInfo.itemOverCategory !== -1
        })}
        // Prevent dragging when touching the display
        onTouchEnd={(event) => handleTouch(event, false)}
        onMouseDown={(event) => mouseDownHandler(event)}
      >
        <div className="text-item" onTouchEnd={(event) => handleTouch(event, false)}>
          <div
            className="text-item-content"
            dangerouslySetInnerHTML={{ __html: textElement }}
            onTouchEnd={(event) => handleTouch(event, true)}
          />
          {showSelectedSolutions ? (
            <>
              <div aria-hidden="true" className="solution-icon" />
              <span className="offscreen">
                {isShowSolutionItem
                  ? l10n.shouldHaveBeenPlacedInCategory
                  : correctlyPlaced
                    ? l10n.correctCategory
                    : l10n.wrongCategory}
              </span>
            </>
          ) : null}
          {!showSelectedSolutions && !isDragged ? (
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
          ) : null}
          {dropdownSelectOpen ? (
            <div className="dropdown-wrapper">
              <SingleDropdownSelect
                label={l10n.moveItemsHelpText}
                setContainerHeight={setHeight}
                onChange={(categoryId) => handleDropdownSelectAction(categoryId)}
                options={categories}
                currentlySelectedId={uncategorized ? categories.length - 1 : currentCategoryId - 1}
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
  setContainerHeight: PropTypes.func.isRequired,
  draggedInfo: PropTypes.shape({
    style: PropTypes.object.isRequired,
    itemOverCategory: PropTypes.number.isRequired
  }).isRequired
};
