import React, { useState } from 'react';

import { H5PContext } from '../context/H5PContext';
import Category from './category/Category';
import Uncategorized from './uncategorized/Uncategorized';
import CategoryList from './categoryList/CategoryList';
import TextItem from './textItem/TextItem';

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

  const removeAnimations = () => {
    const temporaryCategoryAssignmentCopy = deepCopy(temporaryCategoryAssignment);
    temporaryCategoryAssignmentCopy.flat().forEach((textItem) => {
      textItem[2] = false;
    });
    setTemporaryCategoryAssignment(temporaryCategoryAssignmentCopy);
    applyCategoryAssignment();
  };

  //Construct category elements
  const categoryElements = appliedCategoryAssignment.map((category, i) => {
    if (i < textGroups.length) {
      return (
        <Category
          categoryId={i}
          key={`category-${i}`}
          title={textGroups[i].groupName}
          assignTextItem={moveTextItem}
          applyCategoryAssignment={applyCategoryAssignment}
          appliedCategoryAssignment={appliedCategoryAssignment}
          temporaryCategoryAssignment={temporaryCategoryAssignment}
        >
          {category.map((textItem) => (
            <TextItem
              key={textItem[0]}
              id={textItem[0]}
              currentCategory={i}
              categories={[...textGroups, { groupName: 'Uncategorized' }]}
              moveTextItem={moveTextItem}
              applyAssignment={applyCategoryAssignment}
              displayedText={textItem[1]}
              animate={textItem[2]}
              removeAnimations={removeAnimations}
            />
          ))}
        </Category>
      );
    }
  });

  // Construct text item elements
  let textItemElements = [];
  appliedCategoryAssignment[textGroups.length].forEach((textItem) => {
    textItemElements.push(
      <TextItem
        key={textItem[0]}
        id={textItem[0]}
        currentCategory={textGroups.length}
        categories={textGroups}
        moveTextItem={moveTextItem}
        applyAssignment={applyCategoryAssignment}
        displayedText={textItem[1]}
        animate={textItem[2]}
        removeAnimations={removeAnimations}
      />
    );
  });

  return (
    <H5PContext.Provider value={context}>
      <CategoryList>{categoryElements}</CategoryList>
      <Uncategorized>{textItemElements}</Uncategorized>
    </H5PContext.Provider>
  );
}
