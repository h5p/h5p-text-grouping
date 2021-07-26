import React from 'react';
import PropTypes from 'prop-types';

import './CategoryList.scss';

/**
 * A component that contains 1 to n categories, and
 * determines their top-level layout and logic.
 * @param params Parameters
 */
export default function CategoryList({ title, categories }) {
  return (
    <div className='categoryList'>
      <h2 className='categoriesHeading'>{title}</h2>
      <div className='categoriesWrapper'>
        {categories}
      </div>
    </div>
  );
}

CategoryList.propTypes = {
  title: PropTypes.string,
  categories: PropTypes.array
};
