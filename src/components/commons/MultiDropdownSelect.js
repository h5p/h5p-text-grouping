import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

import './DropdownSelect.scss';

/**
 * Dropdown select menu with multi selectable options
 * @param {object} props Props object
 * @returns {JSX.Element} Dropdown select menu
 */
export default function MultiDropdownSelect({
  label,
  setContainerHeight,
  resetContainerHeight,
  onClose,
  options,
  currentlySelectedIds
}) {
  const dropdownRef = useRef(null);

  useEffect(() => {
    const dropdownHeight = dropdownRef.current.offsetHeight;
    if (dropdownHeight > 0) {
      setContainerHeight(dropdownHeight);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('mousedown', handleClose);
    return () => {
      window.removeEventListener('mousedown', handleClose);
    };
  }, []);

  const optionDict = {};
  options.forEach(option => optionDict[option.id] = false);
  currentlySelectedIds.forEach(id => optionDict[id] = true);

  const [addedIds, setAddedIds] = useState([]);
  const [removedIds, setRemovedIds] = useState([]);
  const [selectedOptionDict, setSelectedOptionDict] = useState(Object.assign({}, optionDict));

  const handleSelectItem = (event, optionId) => {
    if (!event.button) { // Left click or keyboard
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
        prevSelectedOptionDict[optionId] = !prevSelectedOptionDict[optionId];
        return prevSelectedOptionDict;
      });
    }
  };

  const handleClose = event => {
    if (!event.button) { // Left click or keyboard
      resetContainerHeight();
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
              onMouseDown={(event) => handleSelectItem(event, id)}
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
  resetContainerHeight: PropTypes.func.isRequired,
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
