import React from 'react';
import PropTypes from 'prop-types';

import Category from './category/Category';
import CategoryList from './categoryList/CategoryList';
import './Main.scss';
import TextItem from './textItem/TextItem';

import './Main.scss';
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
  return (
    <div>
      <div dangerouslySetInnerHTML={{ __html: taskDescription }} />
      <CategoryList
        categories={categories.map((category, index) => (
          <Category key={`category-${index}`} title={category.groupName}>
            {category.textElements.map((textItem, index) => (
              <TextItem
                key={`textItem-${index}`}
                displayedText={textItem}
                buttonAriaLabel={context.params.l10n.ariaMoveToCategory}
                buttonHoverText={context.params.l10n.hoverMoveToCategory}
              />
            ))}
          </Category>
        ))}
      ></CategoryList>
      <div className="uncategorized">
        <div className="uncategorized-heading">{context.params.l10n.uncategorizedLabel}</div>
        <ul className="uncategorized-list">
          {uncategorized.map((textItem, index) => (
            <li key={index}>
              <TextItem
                displayedText={textItem}
                buttonAriaLabel={context.params.l10n.ariaMoveToCategory}
                buttonHoverText={context.params.l10n.hoverMoveToCategory}
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

Category.propTypes = {
  context: PropTypes.exact({
    params: PropTypes.object,
    l10n: PropTypes.object,
    instance: PropTypes.object,
    contentId: PropTypes.number
  })
};
