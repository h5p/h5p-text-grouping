import React, { useContext } from 'react';

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
export default function Main() {
  const {
    l10n,
    params: { taskDescription, textGroups, distractorGroup }
  } = useContext(H5PContext);

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
    <div> 
      <div dangerouslySetInnerHTML={{ __html: taskDescription }} />
      <CategoryList>{categoryElements}</CategoryList>
      <Uncategorized>{randomizedTextItems}</Uncategorized>
    </div>
  );
}
