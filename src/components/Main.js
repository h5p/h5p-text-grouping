import React from 'react';
import PropTypes from 'prop-types';

import Category from './category/Category';
import TextItem from './text-item/TextItem';

import './Main.scss';
/**
 * A component that defines the top-level layout and
 * functionality.
 * @param {object} props Props object
 * @returns {JSX.Element} the main content to be displayed
 */
export default function Main({ context }) {
  const categories = context.params.textGroups;
  return (
    <div>
      {categories.map((category, index) => (
        <Category key={`category-${index}`} title={category.groupName}>
          {category.textElements.map((textItem, index) => (
            <TextItem key={`textItem-${index}`} text={textItem} />
          ))}
        </Category>
      ))}
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
