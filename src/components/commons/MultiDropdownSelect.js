import React, { useState, useContext, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

import { H5PContext } from '../../context/H5PContext';
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
  const {
    dragState
  } = useContext(H5PContext);
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
  currentlySelectedIds.forEach(id => optionDict[id] = true);

  const [addedIds, setAddedIds] = useState([]);
  const [removedIds, setRemovedIds] = useState([]);
  const [selectedOptionDict, setSelectedOptionDict] = useState(Object.assign({}, optionDict));

  const handleSelectItem = (event, optionId) => {
    event.stopPropagation();
    if (optionDict[optionId]) {
      setRemovedIds(prevRemovedIds => {
        prevRemovedIds[optionId] = !prevRemovedIds[optionId];
        return prevRemovedIds;
      });
    }
    else {
      setAddedIds(prevAddedIds => {
        prevAddedIds[optionId] = !prevAddedIds[optionId];
        return prevAddedIds;
      });
    }
    setSelectedOptionDict(prevSelectedOptionDict => {
      const selectedOptionDict = Object.assign({}, prevSelectedOptionDict);
      selectedOptionDict[optionId] = !prevSelectedOptionDict[optionId];
      return selectedOptionDict;
    });
  };

  /**
   * Close the dropdown
   * @param {*} event
   */
  const handleClose = event => {
    if (event === null || !event.button) { // Left click or keyboard
      setContainerHeight(0);
      onClose(
        Object.entries(addedIds).reduce((acc, item) => item[1] ? [...acc, item[0]] : acc, []),
        Object.entries(removedIds).reduce((acc, item) => item[1] ? [...acc, item[0]] : acc, [])
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
