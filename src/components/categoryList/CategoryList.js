import React, { useState, useRef, useContext } from 'react';
import PropTypes from 'prop-types';
import { H5PContext } from '../../context/H5PContext';

import Category from '../category/Category';

import './CategoryList.scss';

/**
 * A component that contains 1 to n categories, and
 * determines their top-level layout and logic.
 * @param {object} props Props object
 * @returns {JSX.Element} The CategoryList element
 */
export default function CategoryList({
  moveTextItems,
  allTextItems,
  removeAnimations,
  draggedInfo,
  categorysRef
}) {
  const [marginBottom, setMarginBottom] = useState(null);
  const categoryListRef = useRef(null);
  const {
    params: { textGroups },
    categoryAssignment
  } = useContext(H5PContext);

  /**
   * Set the bottom margin if not enough space for the content
   * @param {number} height The minimal height needed to display the content
   */
  const setMargin = (height) => {
    const heightDifference = height - categoryListRef.current.offsetHeight;
    setMarginBottom(heightDifference > 0 ? heightDifference : null);
  };

  const categoryElements = categoryAssignment.map((_category, categoryId) => {
    if (categoryId !== 0) {
      return (
        <Category
          categoryId={categoryId}
          key={`category-${categoryId}`}
          moveTextItems={moveTextItems}
          allTextItems={allTextItems}
          draggedInfo={draggedInfo}
          categorysRef={categorysRef}
          textItems={{
            categories: [...textGroups, { groupName: 'Uncategorized' }],
            removeAnimations: removeAnimations
          }}
          setContainerHeight={setMargin}
        />
      );
    }
  });

  return (
    <div
      className={`categoryList${categoryElements.length < 2 ? ' singleCategory' : ''}`}
      style={{ marginBottom: marginBottom }}
      ref={categoryListRef}
    >
      {categoryElements}
    </div>
  );
}

CategoryList.propTypes = {
  moveTextItems: PropTypes.func.isRequired,
  allTextItems: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      content: PropTypes.string,
      shouldAnimate: PropTypes.bool
    })
  ).isRequired,
  removeAnimations: PropTypes.func.isRequired,
  categorysRef: PropTypes.object.isRequired,
  draggedInfo: PropTypes.shape({
    style: PropTypes.object.isRequired,
    itemOverCategory: PropTypes.number.isRequired
  }).isRequired
};
