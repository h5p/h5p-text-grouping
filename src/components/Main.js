import React, { useState } from 'react';

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
    randomizedTextItems,
    params: { textGroups }
  } = context;

  const [appliedCategoryAssignment, setAppliedCategoryAssignment] = useState([
    ...textGroups.map(() => []),
    randomizedTextItems.slice()
  ]);

  const [temporaryCategoryAssignment, setTemporaryCategoryAssignment] = useState([
    ...textGroups.map(() => []),
    randomizedTextItems.slice()
  ]);

  const uncategorizedId = textGroups.length;

  const applyCategoryAssignment = () => {
    // Remove text items that are to be moved from old categories
    appliedCategoryAssignment.forEach((category, categoryId) => {
      for (let otherCategoryId = category.length - 1; otherCategoryId >= 0; otherCategoryId--) {
        if (
          !temporaryCategoryAssignment[categoryId]
            .map((temporaryTextItem) => temporaryTextItem.id)
            .includes(category[otherCategoryId].id)
        ) {
          category.splice(otherCategoryId, 1);
        }
        else {
          category[otherCategoryId].shouldAnimate = false; // Set boolean for moved to false for all text items
        }
      }
    });

    // Add back text items that are to be moved to new categories
    temporaryCategoryAssignment.forEach((category, categoryId) => {
      category.forEach((textItem) => {
        if (
          !appliedCategoryAssignment[categoryId]
            .map((appliedTextItem) => appliedTextItem.id)
            .includes(textItem.id)
        ) {
          appliedCategoryAssignment[categoryId].push(textItem);
          textItem.shouldAnimate = true; // Set boolean for moved to true
        }
      });
    });

    setAppliedCategoryAssignment(deepCopy(appliedCategoryAssignment));
  };

  /**
   * Moves a text item from its current category to a new one
   * @param {String} textItemId
   * @param {String} categoryId
   */
  const moveTextItem = (textItemId, categoryId) => {
    const newCategories = temporaryCategoryAssignment.slice();
    let textItem;

    // Remove from previous category
    newCategories.forEach((category) => {
      category.forEach((item, index) => {
        if (item.id === textItemId) {
          textItem = item;
          category.splice(index, 1);
        }
      });
    });

    // Add to new category
    newCategories[categoryId].push(textItem);
    setTemporaryCategoryAssignment(newCategories);
  };

  const removeAnimations = () => {
    const temporaryCategoryAssignmentCopy = deepCopy(temporaryCategoryAssignment);
    temporaryCategoryAssignmentCopy.flat().forEach((textItem) => {
      textItem.shouldAnimate = false;
    });
    setTemporaryCategoryAssignment(temporaryCategoryAssignmentCopy);
    applyCategoryAssignment();
  };

  return (
    <H5PContext.Provider value={context}>
      <CategoryList
        categories={appliedCategoryAssignment}
        textGroups={textGroups}
        moveTextItem={moveTextItem}
        allTextItems={randomizedTextItems.slice()}
        applyCategoryAssignment={applyCategoryAssignment}
        appliedCategoryAssignment={appliedCategoryAssignment}
        temporaryCategoryAssignment={temporaryCategoryAssignment}
        removeAnimations={removeAnimations}
      />
      <Uncategorized
        textItems={{
          category: appliedCategoryAssignment[uncategorizedId],
          currentCategoryId: uncategorizedId,
          categories: [...textGroups, { groupName: 'Uncategorized' }],
          moveTextItem: moveTextItem,
          applyAssignment: applyCategoryAssignment,
          removeAnimations: removeAnimations
        }}
      />
    </H5PContext.Provider>
  );
}
