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
  moveTextItems,
  allTextItems,
  categoryAssignment,
  setContainerHeight,
  resetContainerHeight,
  draggedTextItem,
  setDraggedTextItem,
  textItems: { category, categories, removeAnimations }
}) {
  const { instance, l10n, showSelectedSolutions } = useContext(H5PContext);
  const narrowScreen = useNarrowScreen();

  const [dropdownSelectOpen, setDropdownSelectOpen] = useState(false);
  const [accordionOpen, setAccordionOpen] = useState(!narrowScreen);
  const [dropzoneVisible, setDropzoneVisible] = useState(false);
  const [focused, setFocused] = useState(null);

  const categoryHeaderRef = useRef(null);
  const assignItemsButtonRef = useRef(null);

  /**
   * Resets the state after the focus has been moved
   */
  useEffect(() => {
    if (focused !== null) {
      setFocused(null);
    }
  });

  useEffect(() => {
    setAccordionOpen(!narrowScreen);
  }, [narrowScreen]);

  const uncategorizedId = categoryAssignment.length - 1;

  const currentlySelectedIds = categoryAssignment[categoryId].map(
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
    moveTextItems([
      ...addedIds.map(id => ({ textItemId: id, newCategoryId: categoryId})), 
      ...removedIds.map(id => ({textItemId: id, newCategoryId: uncategorizedId, prevCategoryId: categoryId}))
    ]);
    assignItemsButtonRef.current.focus();
    setDropdownSelectOpen(false);
    instance.trigger('resize');
  };

  /**
   * Make dropzone visible when mouse hovers over category
   */
  const handleOnMouseEnter = () => {
    if (
      draggedTextItem.categoryId !== categoryId &&
      draggedTextItem.categoryId !== -1 &&
      !narrowScreen
    ) {
      setDropzoneVisible(true);
    }
  };

  /**
   * Make dropzone not visible when mouse does not hover over category
   */
  const handleOnMouseLeave = () => {
    if (dropzoneVisible) {
      setDropzoneVisible(false);
    }
  };

  /**
   * Handle dropped text item if it exists
   * Adds text item to category if it is not already there
   */
  const handleOnMouseUp = () => {
    if (draggedTextItem.textItemId !== '-1' && categoryId !== draggedTextItem.categoryId) {
      setDropzoneVisible(false);
      moveTextItems([{
        textItemId: draggedTextItem.textItemId, 
        newCategoryId: categoryId, prevCategoryId: 
        draggedTextItem.categoryId
      }]);
      setDraggedTextItem({ textItemId: '-1', categoryId: -1 });
    }
  };

  /**
   * Cancel dragging when textItem is dropped outside a category
   */
  document.onmouseup = () => {
    if (!dropzoneVisible) {
      setDraggedTextItem({ textItemId: '-1', categoryId: -1 });
    }
  };

  const setHeight = (height) => {
    setContainerHeight(
      categoryHeaderRef.current.offsetTop + height - categoryHeaderRef.current.offsetHeight
    );
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

    moveTextItems([{ textItemId: textItemId, newCategoryId: newCategoryId, prevCategoryId: categoryId }]);
  };

  const textItems = category.map(({ id, content, shouldAnimate }, index) => {
    return (
      <TextItem
        key={id}
        textItemId={id}
        currentCategoryId={categoryId}
        categories={categories}
        removeTextItem={removeTextItem}
        textElement={content}
        shouldAnimate={shouldAnimate}
        removeAnimations={removeAnimations}
        setContainerHeight={setContainerHeight}
        resetContainerHeight={resetContainerHeight}
        setDraggedTextItem={setDraggedTextItem}
        focused={index === focused}
      />
    );
  });

  return (
    <div
      className={`category ${categoryId}`}
      onMouseEnter={(event) => handleOnMouseEnter(event)}
      onMouseLeave={(event) => handleOnMouseLeave(event)}
      onMouseUp={(event) => handleOnMouseUp(event)}
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
        {showSelectedSolutions ? null : ( // hide assign button if done
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
        )}
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
  moveTextItems: PropTypes.func.isRequired,
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
  draggedTextItem: PropTypes.shape({
    textItemId: PropTypes.string.isRequired,
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
