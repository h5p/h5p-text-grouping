import React, { useState, useContext } from 'react';
import PropTypes from 'prop-types';

import './Uncategorized.scss';
import Dropzone from '../commons/DropZone.js';
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
    currentCategory,
    categories,
    moveTextItem,
    applyAssignment,
    removeAnimations
  }
}) {
  const { l10n } = useContext(H5PContext);
  const [dropzoneVisible, setDropzoneVisible] = useState(false);

  const textItems = category.map((textItem) => {
    const [textItemId, textItemElement, textItemShouldAnimate] = textItem;
    return (
      <TextItem
        key={textItemId}
        textItemId={textItemId}
        currentCategory={currentCategory}
        categories={categories}
        moveTextItem={moveTextItem}
        applyAssignment={applyAssignment}
        textElement={textItemElement}
        shouldAnimate={textItemShouldAnimate}
        removeAnimations={removeAnimations}
      />
    );
  });

  return (
    <div className="uncategorized">
      <div className="uncategorized-heading">{l10n.uncategorizedLabel}</div>
      <ul className={`uncategorized-list ${categories.length === 1 ? 'single-text-item' : ''}`}>
        {textItems}
        <li>
          <Dropzone key={`dropzone-uncategorized`} visible={dropzoneVisible} />
        </li>
      </ul>
    </div>
  );
}

Uncategorized.propTypes = {
  children: PropTypes.arrayOf(PropTypes.element)
};
