import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';

import Category from '../category/Category';

import './CategoryList.scss';

/**
 * A component that contains 1 to n categories, and
 * determines their top-level layout and logic.
 * @param {object} props Props object
 * @returns {JSX.Element} The CategoryList element
 */
export default function CategoryList({
  categories,
  textGroups,
  moveTextItem,
  allTextItems,
  applyCategoryAssignment,
  temporaryCategoryAssignment,
  removeAnimations
}) {
  const [marginBottom, setMarginBottom] = useState(null);
  const categoryListRef = useRef(null);

  const setMargin = (height) => {
    const heightDifference = height - categoryListRef.current.offsetHeight;
    if (heightDifference > 0) {
      setMarginBottom(heightDifference);
    }
  };

  const categoryElements = categories.map((category, categoryId) => {
    if (categoryId < textGroups.length) {
      return (
        <Category
          categoryId={categoryId}
          key={`category-${categoryId}`}
          title={textGroups[categoryId].groupName}
          moveTextItem={moveTextItem}
          allTextItems={allTextItems}
          temporaryCategoryAssignment={temporaryCategoryAssignment}
          applyCategoryAssignment={applyCategoryAssignment}
          textItems={{
            category: category,
            categories: [...textGroups, { groupName: 'Uncategorized' }],
            removeAnimations: removeAnimations
          }}
          setContainerHeight={setMargin}
          resetContainerHeight={() => setMarginBottom(0)}
        ></Category>
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
  categories: PropTypes.arrayOf(
    PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        content: PropTypes.string,
        shouldAnimate: PropTypes.bool
      })
    )
  ).isRequired,
  textGroups: PropTypes.arrayOf(
    PropTypes.shape({
      groupName: PropTypes.string.isRequired
    })
  ).isRequired,
  moveTextItem: PropTypes.func.isRequired,
  applyCategoryAssignment: PropTypes.func.isRequired,
  temporaryCategoryAssignment: PropTypes.arrayOf(
    PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        content: PropTypes.string,
        shouldAnimate: PropTypes.bool
      })
    )
  ).isRequired,
  removeAnimations: PropTypes.func.isRequired
};
