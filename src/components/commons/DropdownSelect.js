import React, { useEffect } from 'react';
import PropTypes, { arrayOf } from 'prop-types';

import './DropdownSelect.scss';

/**
 * Dropdown select menu with either multi or single selectable options
 * @param {object} props Props object
 * @returns {JSX.Element} Dropdown select menu
 */
export default function DropdownSelect({
  label,
  onChange,
  onClose,
  options,
  currentlySelectedIds,
  multiSelectable = false
}) {
  useEffect(() => {
    window.addEventListener('click', onClose);
    return () => {
      window.removeEventListener('click', onClose);
    };
  }, []);

  const handleSelectItem = (event, optionId) => {
    event.stopPropagation();
    onChange(optionId);
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
          onClose();
          break;
      }
    }
  };

  return (
    <div className="dropdown-select">
      <div className="label">{label}</div>
      <hr />
      <ul
        role="listbox"
        tabIndex={multiSelectable === true ? -1 : 0}
        onKeyDown={event => handleKeyboardPressed(event, null)}
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
              onClick={event => handleSelectItem(event, optionId)}
              onKeyDown={event => handleKeyboardPressed(event, optionId)}
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
  onChange: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(
    arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.bool, PropTypes.number]))
  ).isRequired,
  currentlySelectedIds: PropTypes.arrayOf(PropTypes.string),
  multiSelectable: PropTypes.bool
};
