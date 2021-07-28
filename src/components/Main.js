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
    randomizedTextItems,
    params: { textGroups }
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

  //Construct category elements
  const categoryElements = textGroups.map((textGroup, i) => (
    <Category id={`category-${i}`} key={`category-${i}`} title={textGroup.groupName} />
  ));

  // Construct text item elements
  let randomizedTextItemElements = [];
  randomizedTextItems.forEach( textItem => {
    randomizedTextItemElements.push(
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
      <Uncategorized>{randomizedTextItemElements}</Uncategorized>
    </H5PContext.Provider>
  );
}
