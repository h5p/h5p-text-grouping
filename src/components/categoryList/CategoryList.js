import React from 'react';
import PropTypes from 'prop-types';

import './CategoryList.scss';

/**
 * A component that contains 1 to n categories, and
 * determines their top-level layout and logic.
 * @param {object} props Props object
 * @returns {JSX.Element} The CategoryList element
 */
export default function CategoryList({ children }) {
  let className = 'categoryList';
  if (children.length < 2) {
    className += ' singleCategory';
  }
  return <div className={className}>{children}</div>;
}

CategoryList.propTypes = {
  children: PropTypes.arrayOf(PropTypes.element)
};
