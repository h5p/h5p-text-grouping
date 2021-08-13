import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';

import { H5PContext } from '../context/H5PContext';
import Category from './category/Category';
import CategoryList from './categoryList/CategoryList';

import './Main.scss';
import deepCopy from '../helpers/deepCopy';
import getCategoryEdges from '../helpers/getCategoryEdges';
import checkIfInsideCategory from '../helpers/checkIfInsideCategory';

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

  const [openDropdown, setOpenDropdown] = useState({categoryId: -1, nextCategoryId: -1});
  const [showSelectedSolutions, setShowSelectedSolutions] = useState(false);
  const [showUnselectedSolutions, setShowUnselectedSolutions] = useState(false);
  const [focusedTextItem, setFocusedTextItem] = useState(null);
  const [draggedInfo, setDraggedInfo] = useState({ style: {}, itemOverCategory: -1 });
  const [dragState, setDragState] = useState({
    textItemId: null,
    categoryId: null,
    dragging: false,
    offset: { x: 0, y: 0 }
  });
  const categorysRef = useRef([]);
  const refToFocusOn = useRef(null);
  const [categoryAssignment, setCategoryAssignment] = useState([
    getRandomizedTextItems(),
    ...textGroups.map(() => [])
  ]);

  /**
   * Shows the solutions of which text items where placed correctly or wrongly
   */
  useEffect(() => {
    const handleAnswered = (event) => {
      if (event.getVerb() === 'answered') {
        setShowSelectedSolutions(true);
      }
    };

    instance.on('xAPI', handleAnswered);
    return () => instance.off('xAPI', handleAnswered);
  }, []);

  /**
   * If text item dragging has been started, add listeners to handle dragging
   */
  useEffect(() => {
    if (dragState.dragging) {
      document.addEventListener('mousemove', mouseMoveHandler);
      document.addEventListener('mouseup', mouseUpHandler);
    }

    return () => {
      document.removeEventListener('mousemove', mouseMoveHandler);
      document.removeEventListener('mouseup', mouseUpHandler);
    };
  }, [dragState]);

  /**
   * Shows the solutions of where text items should have been placed
   */
  useEffect(() => {
    instance.on('show-solution', function () {
      setShowUnselectedSolutions(true);
    });

    return () => instance.off('show-solution', () => setShowUnselectedSolutions(true));
  }, []);

  /**
   * Hides solutions and resets TextItem placement
   */
  useEffect(() => {
    const resetTask = () => {
      setShowSelectedSolutions(false);
      setShowUnselectedSolutions(false);
      setCategoryAssignment([getRandomizedTextItems(), ...textGroups.map(() => [])]);
    };

    instance.on('reset-task', resetTask);
    return () => instance.off('reset-task', resetTask);
  }, []);

  /**
   * Set focus to refToFocusOn if present
   */
  useEffect(() => {
    if (refToFocusOn !== null && refToFocusOn.current !== null) {
      refToFocusOn.current.focus();
      refToFocusOn.current = null;
    }
  }, [refToFocusOn.current]);

  /**
   * Handle mouse moved when item is being dragged
   * @param {MouseEvent} event MouseMove event
   */
  const mouseMoveHandler = (event) => {
    if (!dragState.dragging) {
      return;
    }
    const categoryEdges = getCategoryEdges(categoryAssignment.length, categorysRef);
    let itemOverCategory = -1;
    for (let i = 0; i < categoryAssignment.length; i++) {
      // If the text item hovers over its current category, do nothing
      if (i === dragState.categoryId) {
        continue;
      }
      else if (checkIfInsideCategory(i, { x: event.clientX, y: event.clientY }, categoryEdges)) {
        itemOverCategory = i;
      }
    }
    setDraggedInfo({
      style: {
        left: `${event.clientX - dragState.offset.x}px`,
        top: `${event.clientY - dragState.offset.y}px`
      },
      itemOverCategory: itemOverCategory
    });
    event.preventDefault();
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
    const categoryEdges = getCategoryEdges(categoryAssignment.length, categorysRef);
    for (let i = 0; i < categoryAssignment.length; i++) {
      if (
        checkIfInsideCategory(i, { x: event.clientX, y: event.clientY }, categoryEdges) &&
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
    event.preventDefault();
  };

  /**
   * Remove listeners, reset dragstate and reset dropzoneIndex
   */
  const resetDragState = () => {
    document.removeEventListener('mousemove', mouseMoveHandler);
    document.removeEventListener('mouseup', mouseUpHandler);
    setDragState({
      textItemId: null,
      categoryId: null,
      dragging: false,
      offset: { x: 0, y: 0 }
    });
    setDraggedInfo({
      style: {},
      itemOverCategory: -1
    });
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
    setCategoryAssignment(previousCategoryAssignment => {
      const newCategories = deepCopy(previousCategoryAssignment);
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
  
          // Render the new textItem after enough time for the focus to be set
          setTimeout(() => {
            setCategoryAssignment(newCategories);
          }, 10);
        }
  
        // Remove from previous category
        newCategories[prevCategory].splice(prevPosition, 1);
      });

      triggerInteracted(newCategories);
      return (newCategories);
    });
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
        setDragState,
        openDropdown,
        setOpenDropdown,
        refToFocusOn
      }}
    >
      <CategoryList
        moveTextItems={moveTextItems}
        allTextItems={getRandomizedTextItems()}
        removeAnimations={removeAnimations}
        draggedInfo={draggedInfo}
        categorysRef={categorysRef}
      />
      {!showUnselectedSolutions && categoryAssignment[0].length !== 0 ? (
        <Category
          categoryId={0}
          moveTextItems={moveTextItems}
          draggedInfo={draggedInfo}
          categorysRef={categorysRef}
          textItems={{
            categories: [...textGroups, { groupName: l10n.uncategorizedLabel }],
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
