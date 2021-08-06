import React, { useState, useContext, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

import { H5PContext } from '../../context/H5PContext';
import useNarrowScreen from '../../helpers/useNarrowScreen';
import belongsToCategory from '../../helpers/belongsToCategory';

import Button from '../commons/Button';
import Dropzone from '../commons/Dropzone';
import MultiDropdownSelect from '../commons/MultiDropdownSelect';
import TextItem from '../textItem/TextItem';

import './Category.scss';

/**
 * A Category renders a list of TextElements received through
 * parameters, a dropzone, a title and, for some categories,
 * buttons for collapsing and adding other TextElements
 * @param {object} props Props object
 * @returns {JSX.Element} A single category element
 */
export default function Category({
  categoryId,
  moveTextItems,
  allTextItems,
  setContainerHeight,
  draggedTextItem,
  setDraggedTextItem,
  textItems: { category, categories, removeAnimations }
}) {
  const uncategorized = categoryId === categories.length - 1;

  const { instance, l10n, categoryAssignment, showSelectedSolutions, showUnselectedSolutions } =
    useContext(H5PContext);
  const narrowScreen = useNarrowScreen();

  const [minHeight, setMinHeight] = useState(null);
  const [dropdownSelectOpen, setDropdownSelectOpen] = useState(false);
  const [accordionOpen, setAccordionOpen] = useState(!narrowScreen);
  const [dropzoneVisible, setDropzoneVisible] = useState(false);

  const categoryHeaderRef = useRef(null);
  const assignItemsButtonRef = useRef(null);

  /**
   * Collapse or expand the category based on how wide the screen is
   */
  useEffect(() => {
    setAccordionOpen(!narrowScreen);
  }, [narrowScreen]);

  const uncategorizedId = categories.length - 1;
  const titleWithChildCount = `${categories[categoryId].groupName} ${
    uncategorized ? '' : `(${category.length})`
  }`;

  const getCurrentlySelectedIds = () => category.map((textItem) => textItem.id);

  /**
   * Finds the unselected textItems belonging to this category
   * @returns {object[]} list of unselected textItems belonging to this category
   */
  const getUnselectedSolutions = () =>
    allTextItems.filter(
      (textItem) =>
        belongsToCategory(textItem.id, categoryId) &&
        !getCurrentlySelectedIds().includes(textItem.id)
    );

  /**
   * Toggle whether the accordion is open or not
   */
  const handleAccordionToggle = () => {
    setAccordionOpen((accordionOpen) => !accordionOpen);
    instance.trigger('resize');
  };

  /**
   * Apply the changes that has been made through the dropdown
   * @param {String[]} addedIds Ids of text items to be added to the category
   * @param {String[]} removedIds Ids of text items to be removed from the category
   */
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

  /**
   * Inform the container of which height is needed to show the category (with dropdown)
   * @param {number} height The height of the dropdown
   */
  const setHeight = (height) => {
    setContainerHeight(
      categoryHeaderRef.current.offsetTop + height - categoryHeaderRef.current.offsetHeight
    );
  };

  /**
   * Builder for creating different text items
   * @param {object[]} textItems list of text item objects to build elements from
   * @param {boolean} isShowSolutionItem if the text item is used to show the correct solution
   * @param {boolean} showSwapIcon if the text item should show that it should have been in another category
   * @returns {Element[]} list of textItem elements
   */
  const buildTextItems = (textItems, isShowSolutionItem, showSwapIcon) =>
    textItems.map(({ id, content, shouldAnimate }) => (
      <TextItem
        key={id}
        textItemId={id}
        currentCategoryId={categoryId}
        categories={categories}
        moveTextItems={moveTextItems}
        textElement={content}
        shouldAnimate={shouldAnimate}
        isShowSolutionItem={isShowSolutionItem}
        showSwapIcon={showSwapIcon}
        removeAnimations={removeAnimations}
        setContainerHeight={uncategorized ? setMinHeight : setContainerHeight}
        setDraggedTextItem={setDraggedTextItem}
      />
    ));

  let textItems = buildTextItems(category, false, false);

  if (showUnselectedSolutions) {
    const unselectedSolutions = getUnselectedSolutions();
    const categorized = [];
    const uncategorized = [];

    unselectedSolutions.forEach((textItem) => {
      if (categoryAssignment[uncategorizedId].find(({ id }) => id === textItem.id)) {
        categorized.push(textItem);
      }
      else {
        uncategorized.push(textItem);
      }
    });

    textItems.push(buildTextItems(categorized, true, false));
    textItems.push(buildTextItems(uncategorized, true, true));
  }

  return (
    <div
      className={`category${uncategorized ? ' uncategorized' : ''}`}
      onMouseEnter={(event) => handleOnMouseEnter(event)}
      onMouseLeave={(event) => handleOnMouseLeave(event)}
      onMouseUp={(event) => handleOnMouseUp(event)}
    >
      <div className={uncategorized ? 'uncategorized-heading' : 'header'} ref={categoryHeaderRef}>
        {uncategorized ? null : (
          <Button
            iconName={accordionOpen ? 'expanded-state' : 'collapsed-state'}
            className="expand-collapse-button"
            ariaLabel={accordionOpen ? l10n.ariaCollapse : l10n.ariaExpand}
            hoverText={accordionOpen ? l10n.hoverCollapse : l10n.hoverExpand}
            onClick={handleAccordionToggle}
            aria-expanded={accordionOpen}
          />
        )}
        <div className="title">{titleWithChildCount}</div>
        {showSelectedSolutions || uncategorized ? null : (
          <Button
            ref={assignItemsButtonRef}
            iconName="icon-assign-items"
            className="button-assign-items"
            ariaLabel={l10n.assignItemsHelpText}
            ariaHasPopup="listbox"
            ariaExpanded={dropdownSelectOpen}
            hoverText={l10n.assignItemsHelpText}
            onClick={() => setDropdownSelectOpen(true)}
          />
        )}
      </div>
      {dropdownSelectOpen ? (
        <div className="dropdown-wrapper">
          <MultiDropdownSelect
            label={l10n.assignItemsHelpText}
            setContainerHeight={setHeight}
            onClose={handleDropdownSelectClose}
            options={allTextItems}
            currentlySelectedIds={getCurrentlySelectedIds()}
          />
        </div>
      ) : null}
      <div className={accordionOpen || uncategorized ? undefined : 'collapsed'}>
        {uncategorized ? null : <hr />}
        <ul style={uncategorized ? { minHeight: minHeight } : {}} className={'content'}>
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
  moveTextItems: PropTypes.func.isRequired,
  allTextItems: PropTypes.arrayOf(
    PropTypes.exact({
      id: PropTypes.string,
      content: PropTypes.string,
      shouldAnimate: PropTypes.bool
    })
  ),
  setContainerHeight: PropTypes.func,
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
