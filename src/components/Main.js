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
    params: { taskDescription, textGroups, distractorGroup }
  } = context;

  // TODO: Dummy list while waiting for randomization
  const [currentCategories, setCurrentCategories] = React.useState([
    ['00', '01', '12'],
    ['13', '04', '15']
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
    const newCategories = currentCategories;
    newCategories[parseInt(categoryId.substring(9))].push(textItemId);

    setCurrentCategories(newCategories);

    // TODO: remove from previous category
  };

  const [testState, setTestState] = React.useState(true); // TODO: remove test state

  // TODO: remove test func
  const testFunc = (textItemId) => {
    console.log(textItemId);
    setTestState(!testState);
  };

  //Construct category elements
  const categoryElements = textGroups.map((textGroup, index) => (
    <Category id={`category-${index}`} key={`category-${index}`} title={textGroup.groupName} />
  ));

  // Construct text item elements for categorized words
  let randomizedTextItems = [];
  for (let i = 0; i < textGroups.length; i++) {
    const category = textGroups[i];
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
  }

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

  for (let i = randomizedTextItems.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [randomizedTextItems[i], randomizedTextItems[j]] = [
      randomizedTextItems[j],
      randomizedTextItems[i]
    ];
  }

  return (
    <H5PContext.Provider value={context}>
      <div dangerouslySetInnerHTML={{ __html: taskDescription }} />
      <CategoryList>{categoryElements}</CategoryList>
      <Uncategorized>{randomizedTextItems}</Uncategorized>
    </H5PContext.Provider>
  );
}
