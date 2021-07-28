import React from 'react';
import PropTypes from 'prop-types';

import Category from './category/Category';
import CategoryList from './categoryList/CategoryList';
import './Main.scss';
import TextItem from './textItem/TextItem';

import './Main.scss';
import Uncategorized from './uncategorized/Uncategorized';
/**
 * A component that defines the top-level layout and
 * functionality.
 * @param {object} props Props object
 * @returns {JSX.Element} the main content to be displayed
 */
export default function Main({ context }) {
  const categories = context.params.textGroups;
  const uncategorized = context.params.distractorGroup;
  const taskDescription = context.params.taskDescription;

  //Construct category elements
  const categoryElements = categories.map((category, index) => (
    <Category key={`category-${index}`} title={category.groupName} />
  ));

  // Construct text item elements for categorized words
  let randomizedTextItems = [];
  for (let i = 0; i < categories.length; i++) {
    const category = categories[i];
    category.textElements.forEach((element, j) => {
      randomizedTextItems.push(
        <TextItem
          key={`${i}${j}`}
          displayedText={element}
          buttonAriaLabel={context.params.l10n.ariaMoveToCategory}
          buttonHoverText={context.params.l10n.hoverMoveToCategory}
        />
      );
    });
  }

  // Construct text item elements for distractor words
  uncategorized.forEach((element, i) => {
    randomizedTextItems.push(
      <TextItem
        key={`${categories.length}${i}`}
        displayedText={element}
        buttonAriaLabel={context.params.l10n.ariaMoveToCategory}
        buttonHoverText={context.params.l10n.hoverMoveToCategory}
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
      <CategoryList
        categories={categoryElements}
      ></CategoryList>
      <Uncategorized context={context}>
        {randomizedTextItems}
      </Uncategorized>
    </div>
  );
}

Main.propTypes = {
  context: PropTypes.exact({
    params: PropTypes.object,
    l10n: PropTypes.object,
    instance: PropTypes.object,
    contentId: PropTypes.number
  })
};
