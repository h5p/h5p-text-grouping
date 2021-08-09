import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import { H5PContext } from '../context/H5PContext';
import Category from './category/Category';
import CategoryList from './categoryList/CategoryList';

import './Main.scss';
import deepCopy from '../helpers/deepCopy';

/**
 * A component that defines the top-level layout and
 * functionality.
 * @param {object} props Props object
 * @returns {JSX.Element} the main content to be displayed
 */
export default function Main({ context }) {
  const {
    params: { textGroups },
    instance,
    getRandomizedTextItems,
    triggerInteracted
  } = context;

  const [showSelectedSolutions, setShowSelectedSolutions] = useState(false);
  const [focusedTextItem, setFocusedTextItem] = useState(null);
  const [categoryDimensions, setCategoryDimensions] = useState({});
  const [dropzoneVisible, setDropzoneVisible] = useState(-1);
  const [dragState, setDragState] = useState({
    textItemId: null,
    categoryId: null,
    textItemRef: null,
    dragging: false,
    rel: { x: 0, y: 0 }
  });
  const [showUnselectedSolutions, setShowUnselectedSolutions] = useState(false);

  const [categoryAssignment, setCategoryAssignment] = useState([
    ...textGroups.map(() => []),
    getRandomizedTextItems().slice()
  ]);

  /**
   * Shows the solutions of which text items where placed correctly or wrongly
   */
  useEffect(() => {
    instance.on('xAPI', function (event) {
      if (event.getVerb() === 'answered') {
        setShowSelectedSolutions(true);
      }
    });
  }, []);

  /**
   * Shows the solutions of where text items should have been placed
   */
  useEffect(() => {
    instance.on('show-solution', function () {
      setShowUnselectedSolutions(true);
    });
  }, []);

  /**
   * Hides solutions and resets TextItem placement
   */
  useEffect(() => {
    instance.on('reset-task', () => {
      setShowSelectedSolutions(false);
      setShowUnselectedSolutions(false);
      setCategoryAssignment([...textGroups.map(() => []), getRandomizedTextItems().slice()]);
    });
  }, []);

  const uncategorizedId = textGroups.length;

  /**
   * Handle mouse moved when item is being dragged
   * @param {MouseEvent} event MouseMove event
   */
  const mouseMoveHandler = (event) => {
    if (!dragState.dragging) return;
    dragState.textItemRef.current.style.left = `${event.clientX - dragState.rel.x}px`;
    dragState.textItemRef.current.style.top = `${event.clientY - dragState.rel.y}px`;
    handleDraggableMoved({ x: event.clientX, y: event.clientY });
    event.stopPropagation();
    event.preventDefault();
  };

  /**
   * Make dropzone visible when text item hovers over category
   * @param {Object} mouseCoordinates Coordinates of the mouse in the format {x, y}
   */
  const handleDraggableMoved = (mouseCoordinates) => {
    for (let i = 0; i < categoryAssignment.length; i++) {
      // If the text item hovers over its current category, do nothing
      if (i === dragState.categoryId) continue;

      // If the mouse is inside the category and dropzone is not visible
      if (checkIfInsideCategory(i, mouseCoordinates)) {
        dragState.textItemRef.current.children[0].classList.add('drag-over-category');
        setDropzoneVisible(i);
        return;
      }
      else {
        dragState.textItemRef.current.children[0].classList.remove('drag-over-category');
        setDropzoneVisible(-1);
      }
    }
  };

  /**
   * Update dimensions of categories when dragging a text item is started
   */
  const draggingStartedHandler = () => {
    updateCategoryDimensions();
  };

  /**
   * Handle text item being dropped
   * @param {MouseEvent} event MouseUp event
   */
  const mouseUpHandler = (event) => {
    // Reset style of dragged text item
    dragState.textItemRef.current.style.position = '';
    dragState.textItemRef.current.style.width = '';
    dragState.textItemRef.current.style.zIndex = '';
    dragState.textItemRef.current.style.left = '';
    dragState.textItemRef.current.style.top = '';
    dragState.textItemRef.current.children[0].classList.remove('text-item-selected');

    // Move text item to new category if it was dropped in a new category
    let insideCategoryIndex = -1;
    for (let i = 0; i < categoryAssignment.length; i++) {
      if (
        checkIfInsideCategory(i, { x: event.clientX, y: event.clientY }) &&
        i !== dragState.categoryId
      ) {
        insideCategoryIndex = i;
      }
    }
    if (insideCategoryIndex !== -1) {
      moveTextItems([
        {
          textItemId: dragState.textItemId,
          newCategoryId: insideCategoryIndex,
          prevCategoryId: dragState.categoryId
        }
      ]);
    }

    // Remove listeners, reset dragstate and dropzone
    document.removeEventListener('mousemove', mouseMoveHandler);
    document.removeEventListener('mouseup', mouseUpHandler);
    setDragState((prevDragState) => {
      prevDragState.textItemId = null;
      prevDragState.categoryId = null;
      prevDragState.textItemRef = null;
      prevDragState.dragging = false;
      prevDragState.rel = { x: 0, y: 0 };
      return prevDragState;
    });
    setDropzoneVisible(-1);
    event.stopPropagation();
    event.preventDefault();
  };

  /**
   * Checks if mouse is inside a category
   * @param {number} categoryId Index of the category checked
   * @param {object} mouseCoordinates Coordinates of the mouse in the format {x, y}
   * @returns {boolean} true if mouse is inside a category, false otherwise
   */
  const checkIfInsideCategory = (categoryId, mouseCoordinates) => {
    const { x1, x2, y1, y2 } = categoryDimensions[categoryId];
    return (
      x1 <= mouseCoordinates.x &&
      mouseCoordinates.x <= x2 &&
      y1 <= mouseCoordinates.y &&
      mouseCoordinates.y <= y2
    );
  };

  /**
   * Update dimensions of each category
   */
  const updateCategoryDimensions = () => {
    for (let i = 0; i < categoryAssignment.length; i++) {
      const clientRect = document.getElementById(`category ${i}`).getBoundingClientRect();
      const coordinates = {
        x1: clientRect.x,
        x2: clientRect.x + clientRect.width,
        y1: clientRect.y,
        y2: clientRect.y + clientRect.height
      };
      setCategoryDimensions((prevCategoryDimensions) => {
        prevCategoryDimensions[i] = coordinates;
        return prevCategoryDimensions;
      });
    }
  };

  /**
   * Moves n text items from their current category to a new one
   * @param {object} textItems Id of text item that should be moved
   * @param {string} textItems.textItemId Id of text item that should be moved
   * @param {number} textItems.newCategoryId Id of category the text item should be moved to
   * @param {number} textItems.prevCategoryId Id of category the text item currently belongs to, if available
   * @param {boolean} shouldFocus Whether the text item should receive focused after the move
   */
  const moveTextItems = (textItems, shouldFocus) => {
    const newCategories = deepCopy(categoryAssignment);
    let textItem;

    textItems.forEach(({ textItemId, newCategoryId, prevCategoryId }) => {
      // Reduce looping if the previous category is known
      let i = prevCategoryId === undefined ? 0 : prevCategoryId;
      const limit = prevCategoryId === undefined ? textGroups.length : prevCategoryId;
      let prevCategory;
      let prevPosition;

      // Remove from previous category
      for (i; i <= limit; i++) {
        newCategories[i].forEach((item, index) => {
          if (item.id === textItemId) {
            textItem = item;
            textItem.shouldAnimate = true;
            prevCategory = i;
            prevPosition = index;
          }
        });
      }

      // Add to new category
      newCategories[newCategoryId].push(textItem);

      if (shouldFocus) {
        setFocusedTextItem(textItemId);

        // Render the new textitem after enough time for the focus to be set
        setTimeout(() => {
          setCategoryAssignment(newCategories);
        }, 10);
      }

      // Remove from previous category
      newCategories[prevCategory].splice(prevPosition, 1);
    });

    setCategoryAssignment(newCategories);
    triggerInteracted(newCategories);
  };

  /**
   * Remove animations for all text items
   */
  const removeAnimations = () => {
    setCategoryAssignment((prevCategoryAssignment) => {
      prevCategoryAssignment.flat().forEach((textItem) => (textItem.shouldAnimate = false));
      return prevCategoryAssignment;
    });
  };

  return (
    <H5PContext.Provider
      value={{
        ...context,
        categoryAssignment,
        showSelectedSolutions,
        showUnselectedSolutions,
        focusedTextItem,
        setFocusedTextItem,
        dragState,
        setDragState
      }}
    >
      <CategoryList
        categoryAssignment={categoryAssignment}
        textGroups={textGroups}
        moveTextItems={moveTextItems}
        allTextItems={getRandomizedTextItems().slice()}
        removeAnimations={removeAnimations}
        mouseMoveHandler={mouseMoveHandler}
        mouseUpHandler={mouseUpHandler}
        draggingStartedHandler={draggingStartedHandler}
        dropzoneVisible={dropzoneVisible}
      />
      {showUnselectedSolutions || categoryAssignment[uncategorizedId].length === 0 ? null : (
        <Category
          categoryId={uncategorizedId}
          moveTextItems={moveTextItems}
          mouseMoveHandler={mouseMoveHandler}
          mouseUpHandler={mouseUpHandler}
          draggingStartedHandler={draggingStartedHandler}
          dropzoneVisible={dropzoneVisible === uncategorizedId ? true : false}
          textItems={{
            category: categoryAssignment[uncategorizedId],
            categories: [...textGroups, { groupName: 'Uncategorized' }],
            removeAnimations: removeAnimations
          }}
        />
      )}
    </H5PContext.Provider>
  );
}

Main.propTypes = {
  context: PropTypes.shape({
    params: PropTypes.shape({
      textGroups: PropTypes.arrayOf(
        PropTypes.exact({
          groupName: PropTypes.string.isRequired,
          textElements: PropTypes.arrayOf(PropTypes.string)
        })
      ).isRequired
    }),
    instance: PropTypes.object,
    getRandomizedTextItems: PropTypes.func.isRequired,
    triggerInteracted: PropTypes.func.isRequired
  }).isRequired
};
