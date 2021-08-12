import React, { useContext, useState, useEffect, useRef, createRef } from 'react';
import PropTypes from 'prop-types';

import { H5PContext } from '../../context/H5PContext';
import './DropdownSelect.scss';

/**
 * Dropdown select menu with either single selectable options
 * @param {object} props Props object
 * @returns {JSX.Element} Dropdown select menu
 */
export default function SingleDropdownSelect({
  label,
  setContainerHeight,
  onChange,
  options,
  currentlySelectedId
}) {
  const { dragState } = useContext(H5PContext);

  const [selectedOption, setSelectedOption] = useState(0);
  const dropdownRef = useRef(null);
  const optionRefs = useRef([]);

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
      handleSelectItem(null);
    }
  }, [dragState]);

  useEffect(() => {
    window.addEventListener('click', handleSelectItem);
    return () => {
      window.removeEventListener('click', handleSelectItem);
    };
  }, []);

  //Set focus to the option list on mount
  useEffect(() => {
    optionRefs.current[0].current.focus();
  }, []);

  /**
   * Call the given function when an option has been selected
   * @param {object} event KeyboardEvent or MouseEvent
   * @param {number} optionId Which option was selected
   */
  const handleSelectItem = (event, optionId = null) => {
    if (optionId !== currentlySelectedId && optionId !== null) {
      onChange(optionId);
      event.stopPropagation();
    }
    else {
      onChange();
    }
  };

  /**
   * Handle navigation within the dropdown
   * @param {object} event KeyboardEvent
   */
  const handleKeyboardPressed = (event) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (selectedOption === options.length - 1) return;
        setSelectedOption(selectedOption + 1);
        optionRefs.current[selectedOption + 1].current.focus();
        break;

      case 'ArrowUp':
        event.preventDefault();
        if (selectedOption === 0) return;
        setSelectedOption(selectedOption - 1);
        optionRefs.current[selectedOption - 1].current.focus();
        break;

      case 'Enter':
      case 'Escape':
      case ' ': // The space key
        event.preventDefault();
        if (selectedOption === currentlySelectedId) {
          return;
        }
        handleSelectItem(event, selectedOption);
        break;
    }
  };

  // Create ref for all options
  if (optionRefs.current.length === 0) {
    optionRefs.current = Array(options.length)
      .fill()
      .map(() => createRef());
  }

  return (
    <div className="dropdown-select" ref={dropdownRef}>
      <div className="label">{label}</div>
      <hr />
      <ul role="listbox" onKeyDown={(event) => handleKeyboardPressed(event)}>
        {options.map(({ groupName }, id) => {
          const disabled = id === currentlySelectedId;
          let className = id === selectedOption ? 'radioSelected ' : '';
          className += disabled ? 'disabled' : className;
          return (
            <li
              ref={optionRefs.current[id]}
              key={`option-${id}`}
              className={className}
              onClick={(event) => handleSelectItem(event, id)}
              tabIndex={id === selectedOption ? 0 : -1}
              role="option"
              aria-selected={false}
              aria-disabled={disabled}
              dangerouslySetInnerHTML={{ __html: groupName }}
            />
          );
        })}
      </ul>
    </div>
  );
}

SingleDropdownSelect.propTypes = {
  label: PropTypes.string.isRequired,
  setContainerHeight: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      groupName: PropTypes.string
    })
  ).isRequired,
  currentlySelectedId: PropTypes.number
};
