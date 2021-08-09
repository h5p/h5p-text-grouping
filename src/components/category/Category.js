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
  mouseMoveHandler,
  mouseUpHandler,
  draggingStartedHandler,
  dropzoneVisible,
  textItems: { category, categories, removeAnimations }
}) {
  const uncategorized = categoryId === categories.length - 1;

  const { instance, l10n, showSelectedSolutions, showUnselectedSolutions } = useContext(H5PContext);
  const narrowScreen = useNarrowScreen();

  const [minHeight, setMinHeight] = useState(null);
  const [dropdownSelectOpen, setDropdownSelectOpen] = useState(false);
  const [accordionOpen, setAccordionOpen] = useState(!narrowScreen);

  const categoryHeaderRef = useRef(null);
  const assignItemsButtonRef = useRef(null);

  useEffect(() => {
    setAccordionOpen(!narrowScreen);
  }, [narrowScreen]);

  const uncategorizedId = categories.length - 1;
  const currentlySelectedIds = category.map((textItem) => textItem.id);
  const titleWithChildCount = `${categories[categoryId].groupName} ${
    uncategorized ? '' : `(${category ? category.length : 0})`
  }`;

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
        setContainerHeight={uncategorized ? setMinHeight : setContainerHeight}
        mouseMoveHandler={mouseMoveHandler}
        mouseUpHandler={mouseUpHandler}
        draggingStartedHandler={draggingStartedHandler}
        narrowScreen={narrowScreen}
      />
    ));

  let textItems = buildTextItems(category, false);

  if (showUnselectedSolutions) {
    textItems.push(buildTextItems(getUnselectedSolutions(), true));
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
            onClose={handleDropdownSelectClose}
            options={allTextItems}
            currentlySelectedIds={currentlySelectedIds}
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
  mouseMoveHandler: PropTypes.func.isRequired,
  mouseUpHandler: PropTypes.func.isRequired,
  draggingStartedHandler: PropTypes.func.isRequired,
  dropzoneVisible: PropTypes.bool.isRequired,
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
