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
  const { instance, l10n, showSelectedSolutions, showUnselectedSolutions } = useContext(H5PContext);
  const narrowScreen = useNarrowScreen();

  const [dropdownSelectOpen, setDropdownSelectOpen] = useState(false);
  const [accordionOpen, setAccordionOpen] = useState(!narrowScreen);
  const [dropzoneVisible, setDropzoneVisible] = useState(false);

  const categoryHeaderRef = useRef(null);
  const assignItemsButtonRef = useRef(null);

  useEffect(() => {
    setAccordionOpen(!narrowScreen);
  }, [narrowScreen]);

  const uncategorizedId = categoryAssignment.length - 1;

  const currentlySelectedIds = categoryAssignment[categoryId].map((textItem) => textItem.id);
  const titleWithChildCount = `${title} (${category ? category.length : 0})`;

  /**
   * Finds the unselected textItems belonging to this category
   * @returns {object[]} list of unselected textItems belonging to this category
   */
  const getUnselectedSolutions = () =>
    allTextItems.filter(
      (textItem) => textItem.id[0] == categoryId && !currentlySelectedIds.includes(textItem.id)
    );

  /**
   * Toggle whether the accordion is open or not
   */
  const handleAccordionToggle = () => {
    setAccordionOpen((accordionOpen) => !accordionOpen);
    instance.trigger('resize');
  };

  const handleDropdownSelectOpen = () => setDropdownSelectOpen(true);

  const handleDropdownSelectClose = (addedIds, removedIds) => {
    moveTextItems([
      ...addedIds.map((id) => ({ textItemId: id, newCategoryId: categoryId })),
      ...removedIds.map((id) => ({
        textItemId: id,
        newCategoryId: uncategorizedId,
        prevCategoryId: categoryId
      }))
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
      moveTextItems([
        {
          textItemId: draggedTextItem.textItemId,
          newCategoryId: categoryId,
          prevCategoryId: draggedTextItem.categoryId
        }
      ]);
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

  const buildTextItems = (textItems, isShowSolutionItem) =>
    textItems.map(({ id, content, shouldAnimate }) => (
      <TextItem
        key={id}
        textItemId={id}
        currentCategoryId={categoryId}
        categories={categories}
        moveTextItems={moveTextItems}
        textElement={content}
        isShowSolutionItem={isShowSolutionItem}
        shouldAnimate={shouldAnimate}
        removeAnimations={removeAnimations}
        setContainerHeight={setContainerHeight}
        resetContainerHeight={resetContainerHeight}
        setDraggedTextItem={setDraggedTextItem}
      />
    ));

  let textItems = buildTextItems(category, false);

  if (showUnselectedSolutions) {
    textItems.push(buildTextItems(getUnselectedSolutions(), true));
  }

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
