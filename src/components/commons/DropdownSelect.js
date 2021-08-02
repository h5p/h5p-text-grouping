import React, { useEffect, useRef } from 'react';
import PropTypes, { arrayOf } from 'prop-types';

import './DropdownSelect.scss';

/**
 * Dropdown select menu with either multi or single selectable options
 * @param {object} props Props object
 * @returns {JSX.Element} Dropdown select menu
 */
export default function DropdownSelect({
  label,
  setContainerHeight,
  resetContainerHeight,
  onChange,
  onClose,
  options,
  currentlySelectedIds,
  multiSelectable = false
}) {
  const dropdownRef = useRef(null);

  useEffect(() => {
    const dropdownHeight = dropdownRef.current.offsetHeight;
    if (dropdownHeight > 0) {
      setContainerHeight(dropdownHeight);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('click', handleClose);
    return () => {
      window.removeEventListener('click', handleClose);
    };
  }, []);

  const handleSelectItem = (event, optionId) => {
    event.stopPropagation();
    onChange(optionId);
  };

  const handleClose = () => {
    resetContainerHeight();
    onClose();
  };

  const handleKeyboardPressed = (event, optionId) => {
    // TODO: Implement radio button-like functionality for optionId === null
    if (optionId != null) {
      switch (event.key) {
        case ' ': // The space key
          event.preventDefault();
          handleSelectItem(event, optionId);
          break;

        case 'Enter':
          handleClose();
          break;
      }
    }
  };

  return (
    <div className="dropdown-select" ref={dropdownRef}>
      <div className="label">{label}</div>
      <hr />
      <ul
        role="listbox"
        tabIndex={multiSelectable === true ? -1 : 0}
        onKeyDown={(event) => handleKeyboardPressed(event, null)}
        aria-multiselectable={multiSelectable || undefined}
      >
        {options.map((option) => {
          const [optionId, optionElement] = option;
          return (
            <li
              key={`option-${optionId}`}
              className={
                multiSelectable
                  ? currentlySelectedIds.includes(optionId)
                    ? 'selected'
                    : 'unselected'
                  : undefined
              }
              onClick={(event) => handleSelectItem(event, optionId)}
              onKeyDown={(event) => handleKeyboardPressed(event, optionId)}
              tabIndex={multiSelectable === true ? 0 : -1}
              role="option"
              aria-selected={multiSelectable ? currentlySelectedIds.includes(optionId) : false}
              dangerouslySetInnerHTML={{ __html: optionElement }}
            />
          );
        })}
      </ul>
    </div>
  );
}

DropdownSelect.propTypes = {
  label: PropTypes.string.isRequired,
  setContainerHeight: PropTypes.func.isRequired,
  resetContainerHeight: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(
    arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.bool, PropTypes.number]))
  ).isRequired,
  currentlySelectedIds: PropTypes.arrayOf(PropTypes.string),
  multiSelectable: PropTypes.bool
};
