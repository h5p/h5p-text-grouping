import React, { useState, useContext, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

import { H5PContext } from '../../context/H5PContext';
import useScreenType from '../../helpers/useScreenType';
import belongsToCategory from '../../helpers/belongsToCategory';
import getClassNames from '../../helpers/getClassNames';

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
  draggedInfo,
  categorysRef,
  textItems: { categories, removeAnimations }
}) {
  const uncategorized = categoryId === 0;

  const {
    instance,
    l10n,
    categoryAssignment,
    showSelectedSolutions,
    showUnselectedSolutions,
    openDropdown,
    setOpenDropdown,
    refToFocusOn
  } = useContext(H5PContext);
  const narrowScreen = useScreenType('narrow');
  const mediumScreen = useScreenType('medium');

  const [minHeight, setMinHeight] = useState(null);
  const [maxHeight, setMaxHeight] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [currentlyOpenTextItem, setCurrentlyOpenTextItem] = useState(null);
  const [accordionOpen, setAccordionOpen] = useState(!narrowScreen);

  const categoryHeaderRef = useRef(null);
  const categoryContentRef = useRef(null);
  const assignItemsButtonRef = useRef(null);

  /**
   * Opens assign items dropdown if the assign items button was clicked while another dropdown was open
   */
  useEffect(() => {
    if (openDropdown.nextCategoryId === categoryId && openDropdown.categoryId === -1) {
      setOpenDropdown({ categoryId: categoryId, nextCategoryId: -1 });
      // Set focus to this assign items button
      if (assignItemsButtonRef.current) {
        refToFocusOn.current = assignItemsButtonRef.current;
      }
    }
  });

  /**
   * Collapse or expand the category based on how wide the screen is
   */
  useEffect(() => {
    setAccordionOpen(!narrowScreen);
  }, [narrowScreen]);

  /**
   * Trigger resize when the dropdown or accordion opens or closes
   */
  useEffect(() => {
    instance.trigger('resize');
  }, [openDropdown, accordionOpen]);

  /**
   * Expand the category if Check or Show Solution has been clicked
   */
  useEffect(() => {
    if (showSelectedSolutions || showUnselectedSolutions) {
      setAccordionOpen(true);
    }
  }, [showSelectedSolutions, showUnselectedSolutions]);

  const getCurrentlySelectedIds = () =>
    categoryAssignment[categoryId].map((textItem) => textItem.id);

  let titleWithTextItemCount = uncategorized
    ? categories[categories.length - 1].groupName
    : categories[categoryId - 1].groupName;

  if (!showUnselectedSolutions) {
    // Only add text item count when not in show solution state
    titleWithTextItemCount += ` (${categoryAssignment[categoryId].length})`;
  }

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
        newCategoryId: 0,
        prevCategoryId: categoryId
      }))
    ]);

    if (assignItemsButtonRef.current) {
      refToFocusOn.current = assignItemsButtonRef.current;
    }

    setOpenDropdown((previousOpenDropdown) => {
      return { ...previousOpenDropdown, categoryId: -1 };
    });
  };

  /**
   * Handles the different scenarios when the assign items button is clicked
   */
  const handleAssignItemsButtonClicked = () => {
    // This dropdown is open. Closes this dropdown
    if (openDropdown.categoryId === categoryId) {
      return;
    }
    // No dropdown is open. Opens this dropdown
    else if (openDropdown.categoryId === -1) {
      setOpenDropdown({ categoryId: categoryId, nextCategoryId: -1 });
    }
    // Another dropdown is already open. Sets this dropdown to be opened on reload
    else {
      setOpenDropdown((previousOpenDropdown) => {
        return { ...previousOpenDropdown, nextCategoryId: categoryId };
      });
    }
  };

  /**
   * Inform the container of which height is needed to show the category (with dropdown)
   * @param {number} height The height of the dropdown
   */
  const setHeight = (height) => {
    if (height === 0) {
      setContainerHeight(0);
    }
    else {
      setContainerHeight(
        categoryHeaderRef.current.offsetTop + height - categoryHeaderRef.current.offsetHeight
      );
    }
  };

  /**
   * Set the maxHeight and minHeight of Uncategorized to make sure the textItems aren't shifted
   * by the new dropdown, and that there is enough room for a dropdown
   * @param {number} height The max height needed
   * @param {string} textItemId The id of the textItem calling the function
   * @param {bool} settingMinHeight True if minHeight should be set, false if maxHeight should be set
   */
  const resizeUncategorized = (height, textItemId, settingMinHeight) => {
    if (categoryContentRef.current === null) return;

    if (height === 0) {
      // Makes sure the state is up to date.
      // If the state is accessed normally, it will be possible for one textItem to reset
      // the size after another textItem has opened. This is because normal state variables
      // are accessed at the start of a function, and not updated while the function is running
      setCurrentlyOpenTextItem((currentlyOpenTextItem) => {
        // Reset height restrictions if the closing textItem was the last to open
        if (textItemId === currentlyOpenTextItem) {
          setMaxHeight(null);
          setMinHeight(null);
          setCurrentlyOpenTextItem(null);
        }
        return currentlyOpenTextItem;
      });
    }
    else if (height > 0) {
      if (settingMinHeight) {
        setMinHeight(height + categoryHeaderRef.current.offsetHeight);
      }
      else {
        setMaxHeight(categoryContentRef.current.offsetHeight);
      }
      setCurrentlyOpenTextItem(textItemId);
    }
  };

  /**
   * Builder for creating different text items
   * @param {object[]} textItems list of text item objects to build elements from
   * @param {boolean} isShowSolutionItem if the text item is used to show the correct solution
   * @returns {Element[]} list of textItem elements
   */
  const buildTextItems = (textItems, isShowSolutionItem) =>
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
        removeAnimations={removeAnimations}
        setContainerHeight={uncategorized ? resizeUncategorized : setContainerHeight}
        draggedInfo={draggedInfo}
      />
    ));

  // Build the assigned text items for the category
  let textItems = buildTextItems(categoryAssignment[categoryId], false, false);

  if (showUnselectedSolutions) {
    // Build the show solution state text items to show which items should have been placed in the category
    const unselectedSolutions = getUnselectedSolutions();
    textItems.push(buildTextItems(unselectedSolutions, true));
  }

  return (
    <div
      id={`category ${categoryId}`}
      ref={categoryRef => categorysRef.current[categoryId] = categoryRef}
      className={getClassNames({
        category: true,
        uncategorized: uncategorized,
        'category-dropzone': draggedInfo.itemOverCategory === categoryId,
        'expanded-state': accordionOpen
      })}
      style={uncategorized ? { minHeight: minHeight } : {}}
    >
      <div className={uncategorized ? 'uncategorized-heading' : 'header'} ref={categoryHeaderRef}>
        {uncategorized ? null : (
          <Button
            iconName={accordionOpen ? 'expanded-state-icon' : 'collapsed-state-icon'}
            className="expand-collapse-button"
            ariaLabel={accordionOpen ? l10n.ariaCollapse : l10n.ariaExpand}
            hoverText={accordionOpen ? l10n.hoverCollapse : l10n.hoverExpand}
            onClick={handleAccordionToggle}
            aria-expanded={accordionOpen}
          />
        )}
        <div className="title">{titleWithTextItemCount}</div>
        {showSelectedSolutions || uncategorized ? null : (
          <Button
            ref={assignItemsButtonRef}
            className="icon-assign-items"
            iconName={getClassNames({
              'button-assign-items ': true,
              'icon-assign-items-expanded-state': openDropdown.categoryId === categoryId
            })}
            ariaLabel={l10n.assignItemsHelpText}
            ariaHasPopup="listbox"
            ariaExpanded={openDropdown.categoryId === categoryId}
            hoverText={l10n.assignItemsHelpText}
            onClick={() => handleAssignItemsButtonClicked()}
          />
        )}
      </div>
      {openDropdown.categoryId === categoryId ? (
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
      <div className={accordionOpen || uncategorized ? null : 'collapsed'}>
        {uncategorized || (showSelectedSolutions && textItems.length === 0) ? null : <hr />}
        <ul
          ref={categoryContentRef}
          style={uncategorized && !mediumScreen ? { maxHeight: maxHeight } : {}}
          className={getClassNames({
            'category-content': true,
            'single-text-item': textItems.length === 1
          })}
        >
          {textItems}
          {!showSelectedSolutions ? (
            <li>
              <Dropzone
                key={`dropzone-${categoryId}`}
                visible={draggedInfo.itemOverCategory === categoryId}
              />
            </li>
          ) : null}
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
  draggedInfo: PropTypes.shape({
    style: PropTypes.object.isRequired,
    itemOverCategory: PropTypes.number.isRequired
  }).isRequired,
  categorysRef: PropTypes.object.isRequired,
  textItems: PropTypes.exact({
    categories: PropTypes.arrayOf(
      PropTypes.shape({
        groupName: PropTypes.string
      })
    ),
    removeAnimations: PropTypes.func
  }).isRequired
};
