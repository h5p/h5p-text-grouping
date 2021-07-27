import React from 'react';
import PropTypes from 'prop-types';

import './CategoryList.scss';

/**
 * A component that contains 1 to n categories, and
 * determines their top-level layout and logic.
 * @param params Parameters
 */
export default function CategoryList({ categories }) {
  return (
    <div className='categoryList'>
      {categories}
    </div>
  );
}

CategoryList.propTypes = {
  categories: PropTypes.array
};
