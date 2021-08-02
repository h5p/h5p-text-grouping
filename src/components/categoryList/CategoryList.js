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
  removeAnimation,
  moveTextItem,
  applyCategoryAssignment,
  appliedCategoryAssignment,
  temporaryCategoryAssignment
}) {
  const [marginBottom, setMarginBottom] = useState(null);
  const categoryListRef = useRef(null);

  const setMargin = (height) => {
    const heightDifference = height - categoryListRef.current.offsetHeight;
    if (heightDifference > 0) {
      setMarginBottom(heightDifference);
    }
  };

  const categoryElements = categories.map((category, i) => {
    if (i < textGroups.length) {
      return (
        <Category
          categoryId={i}
          key={`category-${i}`}
          title={textGroups[i].groupName}
          textGroups={textGroups}
          removeAnimation={removeAnimation}
          textItems={category}
          assignTextItem={moveTextItem}
          applyCategoryAssignment={applyCategoryAssignment}
          appliedCategoryAssignment={appliedCategoryAssignment}
          temporaryCategoryAssignment={temporaryCategoryAssignment}
          setContainerHeight={setMargin}
          resetContainerHeight={() => setMarginBottom(0)}
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
  categories: PropTypes.arrayOf(
    PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.bool])))
  ).isRequired,
  textGroups: PropTypes.arrayOf(
    PropTypes.shape({
      groupName: PropTypes.string.isRequired
    })
  ).isRequired,
  removeAnimation: PropTypes.func.isRequired,
  moveTextItem: PropTypes.func.isRequired,
  applyCategoryAssignment: PropTypes.func.isRequired,
  appliedCategoryAssignment: PropTypes.arrayOf(
    PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.bool])))
  ).isRequired,
  temporaryCategoryAssignment: PropTypes.arrayOf(
    PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.bool])))
  ).isRequired
};
