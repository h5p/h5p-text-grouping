import React, { useState, useEffect } from 'react';
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

  const [classNames, setClassNames] = useState(options.map(() => 'radioUnchecked'));

  const handleSelectItem = (event, optionId) => {
    event.stopPropagation();
    onChange(optionId);
  };

  const handleKeyboardPressed = (event, optionId) => {
    if (multiSelectable) {
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
    else {
      switch (event.key) {
        case 'ArrowDown': 
          event.preventDefault();
          if (classNames[classNames.length - 1] != 'radioUnchecked') return;
          setClassNames(prevClassNames => {
            const index = prevClassNames.indexOf('radioChecked');
            const classes = options.map(() => 'radioUnchecked');
            classes[index + 1] = 'radioChecked';
            return classes;
          });
          break;
        
        case 'ArrowUp': 
          event.preventDefault();
          if (classNames[0] != 'radioUnchecked') return;
          setClassNames(prevClassNames => {
            const index = prevClassNames.indexOf('radioChecked');
            const classes = options.map(() => 'radioUnchecked');
            classes[index - 1] = 'radioChecked';
            return classes;
          });
          break;
          
        case 'Enter':
        case ' ': // The space key
          event.preventDefault();
          handleSelectItem(event, classNames.indexOf('radioChecked'));
          break;
      }
    }
  };

  const handleListboxSelected = () => {
    const newClassNames = options.map(() => 'radioUnchecked');
    newClassNames[0] = 'radioChecked';
    setClassNames(newClassNames);
  };

  return (
    <div className="dropdown-select">
      <div className="label">{label}</div>
      <hr />
      <ul
        role="listbox"
        onFocus={event => handleListboxSelected(event)}
        tabIndex={multiSelectable === true ? -1 : 0}
        onKeyDown={event => handleKeyboardPressed(event, null)}
        aria-multiselectable={multiSelectable || undefined}
      >
        {options.map((option, index) => {
          const [optionId, optionElement] = option;
          return (
            <li
              key={`option-${optionId}`}
              className={multiSelectable
                ? currentlySelectedIds.includes(optionId)
                  ? 'selected'
                  : 'unselected'
                : classNames[index]}
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
  onChange: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(
    arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.bool, PropTypes.number]))
  ).isRequired,
  currentlySelectedIds: PropTypes.arrayOf(PropTypes.string),
  multiSelectable: PropTypes.bool
};
