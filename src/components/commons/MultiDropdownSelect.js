import React, { useState, useContext, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

import { H5PContext } from '../../context/H5PContext';
import addToLinkedList from '../../helpers/addToLinkedList.js';
import removeFromLinkedList from '../../helpers/removeFromLinkedList';
import convertLinkedListToArray from '../../helpers/convertLinkedListToArray';
import './DropdownSelect.scss';

/**
 * Dropdown select menu with multi selectable options
 * @param {object} props Props object
 * @returns {JSX.Element} Dropdown select menu
 */
export default function MultiDropdownSelect({
  label,
  setContainerHeight,
  onClose,
  options,
  currentlySelectedIds
}) {
  const { dragState } = useContext(H5PContext);
  const dropdownRef = useRef(null);

  /**
   * Inform the parent of how much space is needed for the dropdown
   */
  useEffect(() => {
    const dropdownHeight = dropdownRef.current.offsetHeight;
    if (dropdownHeight > 0) {
      setContainerHeight(dropdownHeight);
    }
  }, []);

  /**
   * Close dropdown menu if text item is being dragged
   */
  useEffect(() => {
    if (dragState.dragging) {
      handleClose(null);
    }
  }, [dragState]);

  useEffect(() => {
    window.addEventListener('click', handleClose);
    return () => {
      window.removeEventListener('click', handleClose);
    };
  }, []);

  const optionDict = {};
  currentlySelectedIds.forEach((id) => (optionDict[id] = true));

  /*
   * Linked lists for added and removed ids. Every item links to the previous and next item
   * Added ids are ids of text items that are to be added to this category
   * Removed ids are ids of the text items that are to be removed from this category
   */
  const [addedIds, setAddedIds] = useState({ first: [null, 'last'], last: ['first', null] });
  const [removedIds, setRemovedIds] = useState({ first: [null, 'last'], last: ['first', null] });
  const [selectedOptionDict, setSelectedOptionDict] = useState({ ...optionDict });

  const handleSelectItem = (event, optionId) => {
    event.stopPropagation();
    // If text item is currently in this category
    if (optionDict[optionId]) {
      setRemovedIds((previousRemovedIds) => {
        // If the text item is currently selected
        if (previousRemovedIds[optionId] === undefined) {
          return addToLinkedList(previousRemovedIds, optionId, 'last');
        }
        // If the text item is currently not selected
        else {
          return removeFromLinkedList(previousRemovedIds, optionId);
        }
      });
    }
    // If text item is in another category
    else {
      setAddedIds((previousAddedIds) => {
        // If the text item is currently not selected
        if (previousAddedIds[optionId] === undefined) {
          return addToLinkedList(previousAddedIds, optionId, 'last');
        }
        // If the text item is currently selected
        else {
          return removeFromLinkedList(previousAddedIds, optionId);
        }
      });
    }
    // Update the currently selected options in the dropdown list
    setSelectedOptionDict((previousSelectedOptionDict) => {
      return { ...previousSelectedOptionDict, [optionId]: !previousSelectedOptionDict[optionId] };
    });
  };

  /**
   * Close the dropdown
   * @param {object} event KeyboardEvent or MouseEvent
   */
  const handleClose = (event) => {
    if (event === null || !event.button) { // Left click or keyboard
      setContainerHeight(0);
      onClose(
        convertLinkedListToArray(addedIds, 'first', 'last'),
        convertLinkedListToArray(removedIds, 'first', 'last')
      );
    }
  };

  const handleKeyboardPressed = (event, optionId) => {
    switch (event.key) {
      case ' ': // The space key
        event.preventDefault();
        handleSelectItem(event, optionId);
        break;

      case 'Enter':
      case 'Escape':
        event.preventDefault();
        handleClose(event);
        break;
    }
  };

  return (
    <div className="dropdown-select" ref={dropdownRef}>
      <div className="label">{label}</div>
      <hr />
      <ul role="listbox" tabIndex={-1} aria-multiselectable={true}>
        {options.map((option) => {
          const { id, content } = option;
          return (
            <li
              key={`option-${id}`}
              className={selectedOptionDict[id] ? 'selected' : 'unselected'}
              onClick={(event) => handleSelectItem(event, id)}
              onKeyDown={(event) => handleKeyboardPressed(event, id)}
              tabIndex={0}
              role="option"
              aria-selected={selectedOptionDict[id]}
              dangerouslySetInnerHTML={{ __html: content }}
            />
          );
        })}
      </ul>
    </div>
  );
}

MultiDropdownSelect.propTypes = {
  label: PropTypes.string.isRequired,
  setContainerHeight: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.exact({
      id: PropTypes.string,
      content: PropTypes.string,
      shouldAnimate: PropTypes.bool
    })
  ).isRequired,
  currentlySelectedIds: PropTypes.arrayOf(PropTypes.string)
};
