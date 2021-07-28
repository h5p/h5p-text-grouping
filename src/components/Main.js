import React from 'react';

import { H5PContext } from '../context/H5PContext';
import Category from './category/Category';
import Uncategorized from './uncategorized/Uncategorized';
import CategoryList from './categoryList/CategoryList';
import TextItem from './textItem/TextItem';

import './Main.scss';

/**
 * A component that defines the top-level layout and
 * functionality.
 * @param {object} props Props object
 * @returns {JSX.Element} the main content to be displayed
 */
export default function Main({ context }) {
  const {
    l10n,
    params: { textGroups, distractorGroup }
  } = context;

  // TODO: Dummy list while waiting for randomization
  const [currentCategories, setCurrentCategories] = React.useState([
    ['00', '01', '12'],
    ['13', '03', '15']
  ]);

  /**
   * Adds the listed text items to the category and removes them from others
   * @param {String} categoryId
   * @param {String[]} textItemIds An array of textItemIds
   */
  const addToCategory = (categoryId, textItemIds) => {
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
    // TODO: Depending on how uncategorized is given after randomization, this might have to be implemented differently

    const newCategories = currentCategories;

    // Remove from previous category
    newCategories.forEach((category) => {
      const textItemIndex = category.indexOf(textItemId);
      if (textItemIndex > -1) {
        category.splice(textItemIndex, 1);
      }
    });

    // Add to new category
    newCategories[parseInt(categoryId.substring(9))].push(textItemId);

    setCurrentCategories(newCategories);

    console.log('Current categories', currentCategories);
  };

  //Construct category elements
  const categoryElements = textGroups.map((textGroup, i) => (
    <Category id={`category-${i}`} key={`category-${i}`} title={textGroup.groupName} />
  ));

  // Construct text item elements for categorized words
  let randomizedTextItems = [];
  textGroups.forEach((category, i) => {
    category.textElements.forEach((element, j) => {
      randomizedTextItems.push(
        <TextItem
          key={`${i}${j}`}
          id={`${i}${j}`}
          moveTextItem={moveTextItem}
          displayedText={element}
          buttonAriaLabel={l10n.ariaMoveToCategory}
          buttonHoverText={l10n.hoverMoveToCategory}
        />
      );
    });
  });

  // Construct text item elements for distractor words
  distractorGroup.forEach((element, i) => {
    randomizedTextItems.push(
      <TextItem
        key={`${textGroups.length}${i}`}
        id={`${textGroups.length}${i}`}
        moveTextItem={moveTextItem}
        displayedText={element}
        buttonAriaLabel={l10n.ariaMoveToCategory}
        buttonHoverText={l10n.hoverMoveToCategory}
      />
    );
  });

  // Randomize order of text items
  for (let i = randomizedTextItems.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [randomizedTextItems[i], randomizedTextItems[j]] = [
      randomizedTextItems[j],
      randomizedTextItems[i]
    ];
  }

  return (
    <H5PContext.Provider value={context}>
      <CategoryList>{categoryElements}</CategoryList>
      <Uncategorized>{randomizedTextItems}</Uncategorized>
    </H5PContext.Provider>
  );
}
