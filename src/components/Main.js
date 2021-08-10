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
    l10n,
    instance,
    getRandomizedTextItems,
    triggerInteracted
  } = context;

  const [showSelectedSolutions, setShowSelectedSolutions] = useState(false);
  const [focusedTextItem, setFocusedTextItem] = useState(null);
  const [categoryDimensions, setCategoryDimensions] = useState({});
  const [draggedInfo, setDraggedInfo] = useState({
    style: {},
    firstChildClassNames: {},
    dropzoneVisible: -1
  });
  const [dragState, setDragState] = useState({
    textItemId: null,
    categoryId: null,
    dragging: false,
    rel: { x: 0, y: 0 }
  });
  const [showUnselectedSolutions, setShowUnselectedSolutions] = useState(false);

  const [categoryAssignment, setCategoryAssignment] = useState([
    getRandomizedTextItems().slice(),
    ...textGroups.map(() => [])
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
   * If text item dragging has been started, add listeners to handle dragging
   */
  useEffect(() => {
    if (dragState.dragging) {
      document.addEventListener('mousemove', mouseMoveHandler);
      document.addEventListener('mouseup', mouseUpHandler);
    }
  }, [dragState]);

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

  /**
   * Handle mouse moved when item is being dragged
   * @param {MouseEvent} event MouseMove event
   */
  const mouseMoveHandler = (event) => {
    if (!dragState.dragging) {
      return;
    }
    setDraggedInfo((prevDraggedInfo) => {
      return {
        ...prevDraggedInfo,
        style: {
          left: `${event.clientX - dragState.rel.x}px`,
          top: `${event.clientY - dragState.rel.y}px`
        }
      };
    });
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
      if (i === dragState.categoryId) {
        continue;
      }

      // If the mouse is inside the category and dropzone is not visible
      if (checkIfInsideCategory(i, mouseCoordinates)) {
        setDraggedInfo((prevDraggedInfo) => {
          return {
            ...prevDraggedInfo,
            firstChildClassNames: {
              ...prevDraggedInfo.firstChildClassNames,
              'drag-over-category': true
            },
            dropzoneVisible: i
          };
        });
        return;
      }
      else {
        setDraggedInfo((prevDraggedInfo) => {
          return {
            ...prevDraggedInfo,
            firstChildClassNames: {
              ...prevDraggedInfo.firstChildClassNames,
              'drag-over-category': false
            },
            dropzoneVisible: -1
          };
        });
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
    if (!dragState.dragging) {
      return;
    }

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
      instance.trigger('resize');
    }

    resetDragState();
    event.stopPropagation();
    event.preventDefault();
  };

  /**
   * Remove listeners, reset dragstate and reset dropindexone
   */
  const resetDragState = () => {
    document.removeEventListener('mousemove', mouseMoveHandler);
    document.removeEventListener('mouseup', mouseUpHandler);
    setDragState({
      textItemId: null,
      categoryId: null,
      dragging: false,
      rel: { x: 0, y: 0 }
    });
    setDraggedInfo({
      style: {},
      firstChildClassNames: {},
      dropzoneVisible: -1
    });
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
      // Skip uncategorized category if it is empty
      if (i === 0 && categoryAssignment[0].length === 0) {
        setCategoryDimensions((prevCategoryDimensions) => {
          return { ...prevCategoryDimensions, 0: { x1: 0, x2: 0, y1: 0, y2: 0 } };
        });
        continue;
      }

      const clientRect = document.getElementById(`category ${i}`).getBoundingClientRect();
      const coordinates = {
        x1: clientRect.x,
        x2: clientRect.x + clientRect.width,
        y1: clientRect.y,
        y2: clientRect.y + clientRect.height
      };
      setCategoryDimensions((prevCategoryDimensions) => {
        return { ...prevCategoryDimensions, [i]: coordinates};
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
        moveTextItems={moveTextItems}
        allTextItems={getRandomizedTextItems().slice()}
        removeAnimations={removeAnimations}
        draggingStartedHandler={draggingStartedHandler}
        draggedInfo={draggedInfo}
      />
      {!showUnselectedSolutions && categoryAssignment[0].length !== 0 ? (
        <Category
          categoryId={0}
          moveTextItems={moveTextItems}
          draggingStartedHandler={draggingStartedHandler}
          draggedInfo={draggedInfo}
          textItems={{
            category: categoryAssignment[0],
            categories: [...textGroups, { groupName: l10n.uncategorizedLabel}],
            removeAnimations: removeAnimations
          }}
        />
      ) : null}
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
