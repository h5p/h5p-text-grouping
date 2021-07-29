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
    l10n,
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

  const applyCategoryAssignment = () =>
    setAppliedCategoryAssignment(deepCopy(temporaryCategoryAssignment));

  /**
   * Adds the listed text items to the category and removes them from others
   * @param {String} categoryId
   * @param {String[]} textItemIds An array of textItemIds
   */
  const addToCategory = (categoryId, textItemIds) => {
    // TODO: ignore textitem if already in category

    textItemIds.array.forEach((textItemId) => {
      moveTextItem(textItemId, categoryId);
    });
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

    textItem.push(true); // Adds a boolean after id and text if this item was moved
    // Add to new category
    newCategories[categoryId].push(textItem);
    setTemporaryCategoryAssignment(newCategories);
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
              moveTextItem={moveTextItem}
              displayedText={textItem[1]}
              buttonAriaLabel={l10n.ariaMoveToCategory}
              buttonHoverText={l10n.hoverMoveToCategory}
              animate={textItem.length === 3 && textItem[2] === true ? true : false}
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
        moveTextItem={moveTextItem}
        displayedText={textItem[1]}
        buttonAriaLabel={l10n.ariaMoveToCategory}
        buttonHoverText={l10n.hoverMoveToCategory}
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
