import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import { H5PContext } from '../context/H5PContext';
import Uncategorized from './uncategorized/Uncategorized';
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

  const [categoryAssignment, setCategoryAssignment] = useState([
    ...textGroups.map(() => []),
    getRandomizedTextItems().slice()
  ]);

  useEffect(() => {
    instance.on('xAPI', function (event) {
      if (event.getVerb() === 'answered') {
        setShowSelectedSolutions(true);
      }
    });
  }, []);

  useEffect(() => {
    instance.on('reset-task', () => {
      setShowSelectedSolutions(false);
      setCategoryAssignment([...textGroups.map(() => []), getRandomizedTextItems().slice()]);
    });
  }, []);

  const uncategorizedId = textGroups.length;

  const [draggedTextItem, setDraggedTextItem] = useState({ textItemId: '-1', categoryId: -1 });

  /**
   * Moves n text items from their current category to new ones
   * @param {String} textItemId Id of text item that should be moved
   * @param {number} newCategoryId Id of category the text item should be moved to
   * @param {number} prevCategoryId Id of category the text item currently belongs to, if available
   */
  const moveTextItems = (textItems) => {
    const newCategories = deepCopy(categoryAssignment);
    let textItem;  

    textItems.forEach(({ textItemId, newCategoryId, prevCategoryId }) => {    
      // Reduce looping if the previous category is known
      let i = (prevCategoryId === undefined ? 0 : prevCategoryId); 
      const limit = (prevCategoryId === undefined ? textGroups.length : prevCategoryId);

      // Remove from previous category
      for (i; i <= limit; i++) {
        newCategories[i].forEach((item, index) => {
          if (item.id === textItemId) {
            textItem = item;
            textItem.shouldAnimate = true;
            newCategories[i].splice(index, 1);
          }
        });
      }
      
      // Add to new category
      newCategories[newCategoryId].push(textItem);
    });
  
    setCategoryAssignment(newCategories);
    triggerInteracted(categoryAssignment);
  };

  /**
   * Remove animations for all text items
   */
  const removeAnimations = () => {
    setCategoryAssignment(prevCategoryAssignment => {
      prevCategoryAssignment.flat().forEach(textItem => textItem.shouldAnimate = false);
      return prevCategoryAssignment;
    });
  };

  return (
    <H5PContext.Provider value={{ ...context, showSelectedSolutions }}>
      <CategoryList
        categoryAssignment={categoryAssignment}
        textGroups={textGroups}
        moveTextItems={moveTextItems}
        allTextItems={getRandomizedTextItems().slice()}
        setDraggedTextItem={setDraggedTextItem}
        draggedTextItem={draggedTextItem}
        removeAnimations={removeAnimations}
      />
      <Uncategorized
        categoryId={uncategorizedId}
        moveTextItems={moveTextItems}
        setDraggedTextItem={setDraggedTextItem}
        draggedTextItem={draggedTextItem}
        textItems={{
          category: categoryAssignment[uncategorizedId],
          categories: [...textGroups, { groupName: 'Uncategorized' }],
          removeAnimations: removeAnimations
        }}
      />
    </H5PContext.Provider>
  );
}

Main.propTypes = {
  context: PropTypes.exact({
    params: PropTypes.object,
    l10n: PropTypes.object,
    instance: PropTypes.object,
    contentId: PropTypes.number,
    getRandomizedTextItems: PropTypes.func.isRequired,
    triggerInteracted: PropTypes.func.isRequired,
    showSelectedSolutions: PropTypes.bool
  }).isRequired
};
