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

  return (
    <H5PContext.Provider value={context}>
      <div dangerouslySetInnerHTML={{ __html: taskDescription }} />
      <CategoryList>
        {textGroups.map((textGroup, index) => (
          <Category id={`category-${index}`} key={`category-${index}`} title={textGroup.groupName}>
            {textGroup.textElements.map((textItem, index) => (
              <TextItem
                key={`textItem-${index}`}
                displayedText={textItem}
                buttonAriaLabel={l10n.ariaMoveToCategory}
                buttonHoverText={l10n.hoverMoveToCategory}
              />
            ))}
          </Category>
        ))}
      </CategoryList>
      <Uncategorized>
        {distractorGroup.map((textItem, index) => (
          <TextItem
            key={`textItem-U-${index}`}
            displayedText={textItem}
            buttonAriaLabel={l10n.ariaMoveToCategory}
            buttonHoverText={l10n.hoverMoveToCategory}
          />
        ))}
      </Uncategorized>
    </H5PContext.Provider>
  );
}
