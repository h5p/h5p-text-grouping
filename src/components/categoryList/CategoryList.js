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
  textGroups,
  moveTextItems,
  allTextItems,
  categoryAssignment,
  removeAnimations,
  setDraggedTextItem,
  draggedTextItem
}) {
  const [marginBottom, setMarginBottom] = useState(null);
  const categoryListRef = useRef(null);

  /**
   * Set the bottom margin if not enough space for the content
   * @param {number} height The minimal height needed to display the content
   */
  const setMargin = (height) => {
    const heightDifference = height - categoryListRef.current.offsetHeight;
    setMarginBottom(heightDifference > 0 ? heightDifference : null);
  };

  const categoryElements = categoryAssignment.map((category, categoryId) => {
    if (categoryId < textGroups.length) {
      return (
        <Category
          categoryId={categoryId}
          key={`category-${categoryId}`}
          moveTextItems={moveTextItems}
          allTextItems={allTextItems}
          categoryAssignment={categoryAssignment}
          setDraggedTextItem={setDraggedTextItem}
          draggedTextItem={draggedTextItem}
          textItems={{
            category: category,
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
  textGroups: PropTypes.arrayOf(
    PropTypes.shape({
      groupName: PropTypes.string.isRequired
    })
  ).isRequired,
  moveTextItems: PropTypes.func.isRequired,
  allTextItems: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      content: PropTypes.string,
      shouldAnimate: PropTypes.bool
    })
  ).isRequired,
  categoryAssignment: PropTypes.arrayOf(
    PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        content: PropTypes.string,
        shouldAnimate: PropTypes.bool
      })
    )
  ).isRequired,
  removeAnimations: PropTypes.func.isRequired,
  setDraggedTextItem: PropTypes.func.isRequired,
  draggedTextItem: PropTypes.shape({
    textItemId: PropTypes.string.isRequired,
    categoryId: PropTypes.number.isRequired,
  }).isRequired
};
