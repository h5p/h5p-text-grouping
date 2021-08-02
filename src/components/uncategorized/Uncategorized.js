import React, { useState, useContext } from 'react';
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
  textItems: {
    category,
    currentCategoryId,
    categories,
    moveTextItem,
    applyAssignment,
    removeAnimations
  }
}) {
  const [minHeight, setMinHeight] = useState(null);
  const { l10n } = useContext(H5PContext);
  const [dropzoneVisible, setDropzoneVisible] = useState(false);

  const textItems = category.map(({ id, content, shouldAnimate }) => {
    return (
      <TextItem
        key={id}
        textItemId={id}
        currentCategoryId={currentCategoryId}
        categories={categories}
        moveTextItem={moveTextItem}
        applyAssignment={applyAssignment}
        textElement={content}
        shouldAnimate={shouldAnimate}
        removeAnimations={removeAnimations}
        setContainerHeight={setMinHeight}
        resetContainerHeight={() => setMinHeight(0)}
      />
    );
  });

  return (
    <div className="uncategorized">
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
  textItems: PropTypes.shape({
    category: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        content: PropTypes.string.isRequired,
        shouldAnimate: PropTypes.bool
      })
    ).isRequired,
    currentCategoryId: PropTypes.number.isRequired,
    categories: PropTypes.arrayOf(
      PropTypes.shape({
        groupName: PropTypes.string.isRequired,
        textElements: PropTypes.arrayOf(PropTypes.string)
      })
    ),
    moveTextItem: PropTypes.func.isRequired,
    applyAssignment: PropTypes.func.isRequired,
    removeAnimations: PropTypes.func.isRequired
  })
};
