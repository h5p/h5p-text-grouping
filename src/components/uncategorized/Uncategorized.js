import React, { useState, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';

import './Uncategorized.scss';
import Dropzone from '../commons/Dropzone.js';
import TextItem from '../textItem/TextItem';
import { H5PContext } from '../../context/H5PContext';

/**
 * Uncategorized is renders a list of TextElements not
 * currently in any categories, a dropzone and a title.
 * @param {object} props Props object
 * @returns {JSX.Element} An uncategorized element
 */
export default function Uncategorized({
  categoryId,
  applyCategoryAssignment,
  moveTextItem,
  draggedTextItem,
  setDraggedTextItem,
  textItems: { category, categories, removeAnimations }
}) {
  const [minHeight, setMinHeight] = useState(null);
  const [focused, setFocused] = useState(null);
  const { l10n } = useContext(H5PContext);

  const [dropzoneVisible, setDropzoneVisible] = useState(false);

  /**
   * Resets the state after the focus has been moved
   */
  useEffect(() => {
    if (focused !== null) {
      setFocused(null);
    }
  });

  const handleOnMouseEnter = () => {
    if (draggedTextItem.categoryId !== categoryId && draggedTextItem.categoryId !== -1) {
      setDropzoneVisible(true);
    }
  };

  const handleOnMouseLeave = () => {
    setDropzoneVisible(false);
  };

  const handleOnMouseUp = () => {
    if (draggedTextItem.categoryId === -1) {
      setDropzoneVisible(false);
    }
  };

  /**
   * Safely moves the focus to another element before the element is moved somewhere else
   * @param {string} textItemId
   * @param {string} newCategoryId
   */
  const removeTextItem = (textItemId, newCategoryId) => {
    // If text item not only element in list
    if (textItems.length > 0) {
      category.forEach((textItem, index) => {
        if ((textItemId === textItem.id)) {
          // focus on the textitem after the removed one, or the one before if removing the last in the list
          setFocused(index < category.length - 1 ? index : index - 1);
        }
      });
    }
    else {
      // TODO
      // Set to anchor point
      // If unable, send the focus to another category via Main
    }

    moveTextItem(textItemId, newCategoryId, categoryId);
  };

  const textItems = category.map(({ id, content, shouldAnimate }, index) => {
    return (
      <TextItem
        key={id}
        textItemId={id}
        currentCategoryId={categoryId}
        categories={categories}
        moveTextItem={removeTextItem}
        applyAssignment={applyCategoryAssignment}
        textElement={content}
        shouldAnimate={shouldAnimate}
        removeAnimations={removeAnimations}
        setContainerHeight={setMinHeight}
        resetContainerHeight={() => setMinHeight(0)}
        setDraggedTextItem={setDraggedTextItem}
        focused={index === focused}
      />
    );
  });

  return (
    <div
      className="uncategorized"
      onMouseEnter={(event) => handleOnMouseEnter(event)}
      onMouseLeave={(event) => handleOnMouseLeave(event)}
      onMouseUp={(event) => handleOnMouseUp(event)}
    >
      <div className="uncategorized-heading">{l10n.uncategorizedLabel}</div>
      <ul
        style={{ minHeight: minHeight }}
        className={`uncategorized-list ${categories.length === 1 ? 'single-text-item' : ''}`}
      >
        {textItems}
        <li>
          <Dropzone key={`dropzone-uncategorized`} visible={dropzoneVisible} />
        </li>
      </ul>
    </div>
  );
}

Uncategorized.propTypes = {
  categoryId: PropTypes.number.isRequired,
  applyCategoryAssignment: PropTypes.func.isRequired,
  moveTextItem: PropTypes.func.isRequired,
  draggedTextItem: PropTypes.shape({
    textItemId: PropTypes.isRequired,
    categoryId: PropTypes.number.isRequired
  }).isRequired,
  setDraggedTextItem: PropTypes.func.isRequired,
  textItems: PropTypes.exact({
    category: PropTypes.arrayOf(
      PropTypes.exact({
        id: PropTypes.string,
        content: PropTypes.string,
        shouldAnimate: PropTypes.bool
      })
    ),
    categories: PropTypes.arrayOf(
      PropTypes.shape({
        groupName: PropTypes.string
      })
    ),
    removeAnimations: PropTypes.func
  }).isRequired
};
