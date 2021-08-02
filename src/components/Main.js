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

  const applyCategoryAssignment = () => {
    // Remove text items that are to be moved from old categories
    appliedCategoryAssignment.forEach((category, i) => {
      for (let j = category.length - 1; j >= 0; j--) {
        if (!temporaryCategoryAssignment[i].map((e) => e[0]).includes(category[j][0])) {
          category.splice(j, 1);
        }
        else {
          category[j][2] = false; // Set boolean for moved to false for all text items
        }
      }
    });

    // Add back text items that are to be moved to new categories
    temporaryCategoryAssignment.forEach((category, i) => {
      category.forEach((textItem) => {
        if (!appliedCategoryAssignment[i].map((e) => e[0]).includes(textItem[0])) {
          appliedCategoryAssignment[i].push(textItem);
          textItem[2] = true; // Set boolean for moved to true
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
      category.forEach((item, i) => {
        if (item[0] === textItemId) {
          textItem = item;
          category.splice(i, 1);
        }
      });
    });

    // Add to new category
    newCategories[categoryId].push(textItem);
    setTemporaryCategoryAssignment(newCategories);
  };

  const removeAnimation = (textItemId) => {
    temporaryCategoryAssignment.forEach((category) => {
      const textItem = category.find((textItem) => textItem[0] === textItemId);
      if (textItem) {
        textItem[2] = false;
        return;
      }
    });
  };

  return (
    <H5PContext.Provider value={context}>
      <CategoryList
        categories={appliedCategoryAssignment}
        textGroups={textGroups}
        removeAnimation={removeAnimation}
        moveTextItem={moveTextItem}
        applyCategoryAssignment={applyCategoryAssignment}
        appliedCategoryAssignment={appliedCategoryAssignment}
        temporaryCategoryAssignment={temporaryCategoryAssignment}
      />
      <Uncategorized
        textItems={appliedCategoryAssignment[textGroups.length]}
        textGroups={textGroups}
        moveTextItem={moveTextItem}
        applyCategoryAssignment={applyCategoryAssignment}
        removeAnimation={removeAnimation}
      />
    </H5PContext.Provider>
  );
}
