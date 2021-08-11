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
  draggingStartedHandler,
  draggedInfo,
  textItems: { categories, removeAnimations }
}) {
  const uncategorized = categoryId === 0;

  const { instance, l10n, categoryAssignment, showSelectedSolutions, showUnselectedSolutions } =
    useContext(H5PContext);
  const narrowScreen = useScreenType('narrow');
  const mediumScreen = useScreenType('medium');

  const [minHeight, setMinHeight] = useState(null);
  const [maxHeight, setMaxHeight] = useState(null);
  const [previousHeight, setPreviousHeight] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [currentlyOpenTextItem, setCurrentlyOpenTextItem] = useState(null);
  const [dropdownSelectOpen, setDropdownSelectOpen] = useState(false);
  const [accordionOpen, setAccordionOpen] = useState(!narrowScreen);

  const categoryHeaderRef = useRef(null);
  const categoryContentRef = useRef(null);
  const assignItemsButtonRef = useRef(null);

  /**
   * Collapse or expand the category based on how wide the screen is
   */
  useEffect(() => {
    setAccordionOpen(!narrowScreen);
  }, [narrowScreen]);

  /**
   * Sets the height of the category on resize
   */
  useEffect(() => {
    instance.on('resize', () => {
      if (uncategorized && currentlyOpenTextItem === null) {
        setPreviousHeight(categoryContentRef.current.offsetHeight);
      }
    });
  }, []);

  /**
   * Sets the height of the category without a dropdown being open
   */
  useEffect(() => {
    if (uncategorized) {
      // A slight timeout is added to make sure the changes have time to take effect
      setTimeout(() => {
        setPreviousHeight(categoryContentRef.current.offsetHeight);
      }, 10);
    }
  }, [categoryAssignment[categoryId].length]);

  const getCurrentlySelectedIds = () =>
    categoryAssignment[categoryId].map((textItem) => textItem.id);
  const titleWithChildCount = uncategorized
    ? categories[categories.length - 1].groupName
    : `${categories[categoryId - 1].groupName} (${categoryAssignment[categoryId].length})`;

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
        newCategoryId: 0,
        prevCategoryId: categoryId
      }))
    ]);

    if (assignItemsButtonRef.current) {
      assignItemsButtonRef.current.focus();
    }

    setDropdownSelectOpen(false);
    instance.trigger('resize');
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
   * Set the maxHeight an minHeight of Uncategorized to make sure the textItems aren't shifted
   * by the new dropdown, and that there is enough room for a dropdown
   * @param {number} height The max height needed
   * @param {string} textItemId The id of the textItem calling the function
   * @param {bool} settingMinHeight True if minHeight should be set, false if maxHeight should be set
   */
  const resizeUncategorized = (height, textItemId, settingMinHeight) => {
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
        setMaxHeight(previousHeight);
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
        draggingStartedHandler={draggingStartedHandler}
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
      className={getClassNames({
        category: true,
        uncategorized: uncategorized,
        'category-dropzone': draggedInfo.dropzoneVisible === categoryId,
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
        <div className="title">{titleWithChildCount}</div>
        {showSelectedSolutions || uncategorized ? null : (
          <Button
            ref={assignItemsButtonRef}
            className="icon-assign-items"
            iconName={getClassNames({
              'button-assign-items ': true,
              'icon-assign-items-expanded-state': dropdownSelectOpen
            })}
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
      <div className={accordionOpen || uncategorized ? null : 'collapsed'}>
        {uncategorized ? null : <hr />}
        <ul
          ref={categoryContentRef}
          style={uncategorized && !mediumScreen ? { maxHeight: maxHeight } : {}}
          className={'category-content'}
        >
          {textItems}
          <li>
            <Dropzone
              key={`dropzone-${categoryId}`}
              visible={draggedInfo.dropzoneVisible === categoryId}
            />
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
  draggingStartedHandler: PropTypes.func.isRequired,
  draggedInfo: PropTypes.shape({
    style: PropTypes.object.isRequired,
    firstChildClassNames: PropTypes.object.isRequired,
    dropzoneVisible: PropTypes.number.isRequired
  }).isRequired,
  textItems: PropTypes.exact({
    categories: PropTypes.arrayOf(
      PropTypes.shape({
        groupName: PropTypes.string
      })
    ),
    removeAnimations: PropTypes.func
  }).isRequired
};
