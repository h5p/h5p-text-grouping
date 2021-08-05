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

  const [appliedCategoryAssignment, setAppliedCategoryAssignment] = useState([
    ...textGroups.map(() => []),
    getRandomizedTextItems().slice()
  ]);

  const [temporaryCategoryAssignment, setTemporaryCategoryAssignment] = useState([
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
      setAppliedCategoryAssignment([...textGroups.map(() => []), getRandomizedTextItems().slice()]);
      setTemporaryCategoryAssignment([
        ...textGroups.map(() => []),
        getRandomizedTextItems().slice()
      ]);
    });
  }, []);

  const uncategorizedId = textGroups.length;

  const [draggedTextItem, setDraggedTextItem] = useState({ textItemId: '-1', categoryId: -1 });

  /**
   * Update layout with current location of all text items
   */
  const applyCategoryAssignment = () => {
    setAppliedCategoryAssignment(deepCopy(temporaryCategoryAssignment));
    triggerInteracted(appliedCategoryAssignment);
  };

  /**
   * Moves a text item from its current category to a new one
   * Does not apply the updated locations in the layout
   * @param {String} textItemId Id of text item that should be moved
   * @param {number} newCategoryId Id of category the text item should be moved to
   * @param {number} prevCategoryId Id of category the text item currently belongs to, if available
   */
  const moveTextItem = (textItemId, newCategoryId, prevCategoryId = null) => {
    const newCategories = temporaryCategoryAssignment.slice();
    let textItem;

    // Remove from previous category
    // Reduce looping if the previous category is known
    let i = prevCategoryId === null ? 0 : prevCategoryId;
    const limit = prevCategoryId === null ? textGroups.length : prevCategoryId;

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
    setTemporaryCategoryAssignment(newCategories);
  };

  /**
   * Remove animations for all text items
   */
  const removeAnimations = () => {
    setTemporaryCategoryAssignment((prevTemporaryCategoryAssignment) => {
      prevTemporaryCategoryAssignment
        .flat()
        .forEach((textItem) => (textItem.shouldAnimate = false));
      return prevTemporaryCategoryAssignment;
    });
    applyCategoryAssignment();
  };

  return (
    <H5PContext.Provider value={{ ...context, showSelectedSolutions }}>
      <CategoryList
        categories={appliedCategoryAssignment}
        textGroups={textGroups}
        moveTextItem={moveTextItem}
        allTextItems={getRandomizedTextItems().slice()}
        applyCategoryAssignment={applyCategoryAssignment}
        setDraggedTextItem={setDraggedTextItem}
        draggedTextItem={draggedTextItem}
        temporaryCategoryAssignment={temporaryCategoryAssignment}
        removeAnimations={removeAnimations}
      />
      <Uncategorized
        categoryId={uncategorizedId}
        applyCategoryAssignment={applyCategoryAssignment}
        moveTextItem={moveTextItem}
        setDraggedTextItem={setDraggedTextItem}
        draggedTextItem={draggedTextItem}
        textItems={{
          category: appliedCategoryAssignment[uncategorizedId],
          categories: [...textGroups, { groupName: 'Uncategorized' }],
          removeAnimations: removeAnimations
        }}
      />
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
