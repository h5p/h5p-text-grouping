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
  const context = useContext(H5PContext);
  const { taskDescription, categories, uncategorized, l10n } = context.params;
  return (
    <div>
      <div dangerouslySetInnerHTML={{ __html: taskDescription }} />
      <CategoryList
        categories={categories.map((category, index) => (
          <Category id={`category-${index}`} key={`category-${index}`} title={category.groupName}>
            {category.textElements.map((textItem, index) => (
              <TextItem
                key={`textItem-${index}`}
                displayedText={textItem}
                buttonAriaLabel={l10n.ariaMoveToCategory}
                buttonHoverText={l10n.hoverMoveToCategory}
              />
            ))}
          </Category>
        ))}
      ></CategoryList>
      <Uncategorized context={context}>
        {uncategorized.map((textItem, index) => (
          <TextItem
            key={`textItem-U-${index}`}
            displayedText={textItem}
            buttonAriaLabel={l10n.ariaMoveToCategory}
            buttonHoverText={l10n.hoverMoveToCategory}
          />
        ))}
      </Uncategorized>
    </div>
  );
}
