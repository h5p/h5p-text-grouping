import React, { useState, useContext, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

import { H5PContext } from '../../context/H5PContext';
import Dropzone from '../commons/Dropzone';
import MultiDropdownSelect from '../commons/MultiDropdownSelect';
import ExpandCollapseButton from './Buttons/ExpandCollapseButton';
import AssignItemsButton from './Buttons/AssignItemsButton';
import TextItem from '../textItem/TextItem';

import './Category.scss';
import useNarrowScreen from '../../helpers/useNarrowScreen';

/**
 * A Category renders a list of TextElements received
 * through parameters, a dropzone, a title and buttons
 * for collapsing and adding other TextElements.
 * @param {object} props Props object
 * @returns {JSX.Element} A single category element
 */
export default function Category({
  categoryId,
  title,
  assignTextItem,
  allTextItems,
  temporaryCategoryAssignment,
  setContainerHeight,
  resetContainerHeight,
  applyCategoryAssignment,
  textItems: { category, currentCategoryId, categories, removeAnimations }
}) {
  const { instance, l10n } = useContext(H5PContext);
  const narrowScreen = useNarrowScreen();
  const [dropdownSelectOpen, setDropdownSelectOpen] = useState(false);
  const [accordionOpen, setAccordionOpen] = useState(!narrowScreen);
  const categoryHeaderRef = useRef(null);

  const [dropzoneVisible, setDropzoneVisible] = useState(false);
  useEffect(() => {
    setAccordionOpen(!narrowScreen);
  }, [narrowScreen]);

  const uncategorizedId = temporaryCategoryAssignment.length - 1;

  const currentlySelectedIds = temporaryCategoryAssignment[categoryId].map(
    (textItem) => textItem.id
  );
  const titleWithChildCount = `${title} (${category ? category.length : 0})`;

  /**
   * Toggle whether the accordion is open or not
   */
  const handleAccordionToggle = () => {
    setAccordionOpen(!accordionOpen);
    instance.trigger('resize');
  };

  const handleDropdownSelectOpen = () => setDropdownSelectOpen(true);

  const handleDropdownSelectClose = () => {
    applyCategoryAssignment();
    setDropdownSelectOpen(false);
    instance.trigger('resize');
  };

  const toggleTextItem = (textItemId) => {
    if (currentlySelectedIds.includes(textItemId)) {
      assignTextItem(textItemId, uncategorizedId);
    }
    else {
      assignTextItem(textItemId, categoryId);
    }
  };

  const setHeight = (height) => {
    setContainerHeight(
      categoryHeaderRef.current.offsetTop + height - categoryHeaderRef.current.offsetHeight
    );
  };

  const textItems = category.map(({ id, content, shouldAnimate }) => {
    return (
      <TextItem
        key={id}
        textItemId={id}
        currentCategoryId={currentCategoryId}
        categories={categories}
        moveTextItem={assignTextItem}
        applyAssignment={applyCategoryAssignment}
        textElement={content}
        shouldAnimate={shouldAnimate}
        removeAnimations={removeAnimations}
        setContainerHeight={setContainerHeight}
        resetContainerHeight={resetContainerHeight}
      />
    );
  });

  return (
    <div className="category">
      <div className="header" ref={categoryHeaderRef}>
        <ExpandCollapseButton expanded={accordionOpen} onClick={handleAccordionToggle} />
        <div className="title">{titleWithChildCount}</div>
        <AssignItemsButton expanded={dropdownSelectOpen} onClick={handleDropdownSelectOpen} />
      </div>
      {dropdownSelectOpen ? (
        <div className="dropdown-wrapper">
          <MultiDropdownSelect
            label={l10n.assignItemsHelpText}
            setContainerHeight={setHeight}
            resetContainerHeight={resetContainerHeight}
            onChange={(textItemId) => toggleTextItem(textItemId)}
            onClose={handleDropdownSelectClose}
            options={allTextItems}
            currentlySelectedIds={currentlySelectedIds}
          />
        </div>
      ) : null}
      <div className={accordionOpen ? undefined : 'collapsed'}>
        <hr />
        <ul className="content">
          {textItems}
          <li>
            <Dropzone key={`dropzone-${categoryId}`} visible={dropzoneVisible} />
          </li>
        </ul>
      </div>
    </div>
  );
}

Category.propTypes = {
  categoryId: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
  assignTextItem: PropTypes.func.isRequired,
  temporaryCategoryAssignment: PropTypes.arrayOf(
    PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        content: PropTypes.string,
        shouldAnimate: PropTypes.bool
      })
    )
  ).isRequired,
  setContainerHeight: PropTypes.func.isRequired,
  resetContainerHeight: PropTypes.func.isRequired,
  applyCategoryAssignment: PropTypes.func.isRequired
};
