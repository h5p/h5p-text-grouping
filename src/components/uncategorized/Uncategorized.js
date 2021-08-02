import React, { useContext, useState } from 'react';
import PropTypes from 'prop-types';

import './Uncategorized.scss';
import { H5PContext } from '../../context/H5PContext';
import TextItem from '../textItem/TextItem';

/**
 * Uncategorized is renders a list of TextElements not
 * currently in any categories, a dropzone and a title.
 * @param {object} props Props object
 * @returns {JSX.Element} An uncategorized element
 */
export default function Uncategorized({
  textItems,
  textGroups,
  moveTextItem,
  applyCategoryAssignment,
  removeAnimation
}) {
  const [minHeight, setMinHeight] = useState(null);
  const { l10n } = useContext(H5PContext);

  const textItemElements = textItems.map((textItem) => (
    <TextItem
      key={textItem[0]}
      id={textItem[0]}
      currentCategory={textGroups.length}
      categories={textGroups}
      moveTextItem={moveTextItem}
      applyAssignment={applyCategoryAssignment}
      displayedText={textItem[1]}
      animate={textItem[2]}
      removeAnimation={() => removeAnimation(textItem[0])}
      setContainerHeight={setMinHeight}
      resetContainerHeight={() => setMinHeight(0)}
    />
  ));

  return (
    <div className="uncategorized">
      <div className="uncategorized-heading">{l10n.uncategorizedLabel}</div>
      <ul
        style={{ minHeight: minHeight }}
        className={`uncategorized-list ${textItemElements.length === 1 ? 'single-text-item' : ''}`}
      >
        {textItemElements}
      </ul>
    </div>
  );
}

Uncategorized.propTypes = {
  textItems: PropTypes.arrayOf(
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.bool]))
  ).isRequired,
  textGroups: PropTypes.arrayOf(
    PropTypes.shape({
      groupName: PropTypes.string.isRequired
    })
  ).isRequired,
  moveTextItem: PropTypes.func.isRequired,
  applyCategoryAssignment: PropTypes.func.isRequired,
  removeAnimation: PropTypes.func.isRequired
};
