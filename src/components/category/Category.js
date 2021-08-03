import React, { useState, useContext, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

import { H5PContext } from '../../context/H5PContext';
import useNarrowScreen from '../../helpers/useNarrowScreen';

import Button from '../commons/Button';
import Dropzone from '../commons/Dropzone';
import MultiDropdownSelect from '../commons/MultiDropdownSelect';
import TextItem from '../textItem/TextItem';

import './Category.scss';

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
  moveTextItem,
  allTextItems,
  temporaryCategoryAssignment,
  setContainerHeight,
  resetContainerHeight,
  applyCategoryAssignment,
  textItemDragStart,
  draggedTextItem,
  textItems: { category, categories, removeAnimations }
}) {
  const { instance, l10n } = useContext(H5PContext);
  const narrowScreen = useNarrowScreen();

  const [dropdownSelectOpen, setDropdownSelectOpen] = useState(false);
  const [accordionOpen, setAccordionOpen] = useState(!narrowScreen);
  const [dropzoneVisible, setDropzoneVisible] = useState(false);

  const categoryHeaderRef = useRef(null);
  const assignItemsButtonRef = useRef(null);

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

  const handleDropdownSelectClose = (addedIds, removedIds) => {
    addedIds.forEach(id => moveTextItem(id, categoryId));
    removedIds.forEach(id => moveTextItem(id, uncategorizedId, categoryId));
    assignItemsButtonRef.current.focus();
    applyCategoryAssignment();
    setDropdownSelectOpen(false);
    instance.trigger('resize');
  };

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
        currentCategoryId={categoryId}
        categories={categories}
        moveTextItem={moveTextItem}
        applyAssignment={applyCategoryAssignment}
        textElement={content}
        shouldAnimate={shouldAnimate}
        removeAnimations={removeAnimations}
        setContainerHeight={setContainerHeight}
        resetContainerHeight={resetContainerHeight}
        dragStart={textItemDragStart}
      />
    );
  });

  return (
    <div 
      className={`category ${categoryId}`} 
      onMouseEnter={event => handleOnMouseEnter(event)} 
      onMouseLeave={event => handleOnMouseLeave(event)} 
      onMouseUp={event => handleOnMouseUp(event)}
    >
      <div className="header" ref={categoryHeaderRef}>
        <Button
          iconName={accordionOpen ? 'expanded-state' : 'collapsed-state'}
          className="expand-collapse-button"
          ariaLabel={accordionOpen ? l10n.ariaCollapse : l10n.ariaExpand}
          hoverText={accordionOpen ? l10n.hoverCollapse : l10n.hoverExpand}
          onClick={handleAccordionToggle}
          aria-expanded={accordionOpen}
        />
        <div className="title">{titleWithChildCount}</div>
        <Button
          ref={assignItemsButtonRef}
          iconName="icon-assign-items"
          className="button-assign-items"
          ariaLabel={l10n.assignItemsHelpText}
          ariaHasPopup="listbox"
          ariaExpanded={dropdownSelectOpen}
          hoverText={l10n.assignItemsHelpText}
          onClick={handleDropdownSelectOpen}
        />
      </div>
      {dropdownSelectOpen ? (
        <div className="dropdown-wrapper">
          <MultiDropdownSelect
            label={l10n.assignItemsHelpText}
            setContainerHeight={setHeight}
            resetContainerHeight={resetContainerHeight}
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
  moveTextItem: PropTypes.func.isRequired,
  allTextItems: PropTypes.arrayOf(
    PropTypes.exact({
      id: PropTypes.string,
      content: PropTypes.string,
      shouldAnimate: PropTypes.bool
    })
  ),
  temporaryCategoryAssignment: PropTypes.arrayOf(
    PropTypes.arrayOf(
      PropTypes.exact({
        id: PropTypes.string,
        content: PropTypes.string,
        shouldAnimate: PropTypes.bool
      })
    )
  ),
  setContainerHeight: PropTypes.func.isRequired,
  resetContainerHeight: PropTypes.func.isRequired,
  applyCategoryAssignment: PropTypes.func.isRequired,
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
