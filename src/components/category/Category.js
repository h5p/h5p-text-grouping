import React, { useState, useContext, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

import { H5PContext } from '../../context/H5PContext';
import useNarrowScreen from '../../helpers/useNarrowScreen';
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
  textItems: { dropzoneVisible, category, categories, removeAnimations }
}) {
  const uncategorized = categoryId === categories.length - 1;

  const { instance, l10n, categoryAssignment, showSelectedSolutions, showUnselectedSolutions } =
    useContext(H5PContext);
  const narrowScreen = useNarrowScreen();

  const [minHeight, setMinHeight] = useState(null);
  const [dropdownSelectOpen, setDropdownSelectOpen] = useState(false);
  const [accordionOpen, setAccordionOpen] = useState(!narrowScreen);

  const categoryHeaderRef = useRef(null);
  const assignItemsButtonRef = useRef(null);

  /**
   * Collapse or expand the category based on how wide the screen is
   */
  useEffect(() => {
    setAccordionOpen(!narrowScreen);
  }, [narrowScreen]);

  const uncategorizedId = categories.length - 1;
  const getCurrentlySelectedIds = () => category.map((textItem) => textItem.id);
  const titleWithChildCount = `${categories[categoryId].groupName} ${
    uncategorized ? '' : `(${category.length})`
  }`;

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
        dropzoneVisible={dropzoneVisible}
        categories={categories}
        moveTextItems={moveTextItems}
        textElement={content}
        shouldAnimate={shouldAnimate}
        isShowSolutionItem={isShowSolutionItem}
        showSwapIcon={showSwapIcon}
        removeAnimations={removeAnimations}
        setContainerHeight={uncategorized ? setMinHeight : setContainerHeight}
        draggingStartedHandler={draggingStartedHandler}
        narrowScreen={narrowScreen}
      />
    ));

  // Build the assigned text items for the category
  let textItems = buildTextItems(category, false, false);

  if (showUnselectedSolutions) {
    // Build the show solution state text items to show which items should have been placed in the category
    const unselectedSolutions = getUnselectedSolutions();
    const categorized = [];
    const uncategorized = [];

    // Partition the missing text items into already categorized and uncategorized
    unselectedSolutions.forEach((textItem) => {
      if (categoryAssignment[uncategorizedId].find(({ id }) => id === textItem.id)) {
        uncategorized.push(textItem);
      }
      else {
        categorized.push(textItem);
      }
    });

    // Categorized items gets a swap icon
    textItems.push(buildTextItems(categorized, true, true));
    // Uncategorized items does not get a swap icon
    textItems.push(buildTextItems(uncategorized, true, false));
  }

  return (
    <div
      id={`category ${categoryId}`}
      className={`category${uncategorized ? ' uncategorized' : ''}`}
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
      <div className={accordionOpen || uncategorized ? undefined : 'collapsed'}>
        {uncategorized ? null : <hr />}
        <ul style={uncategorized ? { minHeight: minHeight } : {}} className={'category-content'}>
          {textItems}
          <li>
            <Dropzone key={`dropzone-${categoryId}`} visible={dropzoneVisible === categoryId} />
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
  textItems: PropTypes.exact({
    dropzoneVisible: PropTypes.number,
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
