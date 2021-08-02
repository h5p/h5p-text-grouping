import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import './DropdownSelect.scss';

/**
 * Dropdown select menu with either single selectable options
 * @param {object} props Props object
 * @returns {JSX.Element} Dropdown select menu
 */
export default function SingleDropdownSelect({
  label,
  onChange,
  onClose,
  options,
  currentlySelectedId
}) {
  useEffect(() => {
    window.addEventListener('click', onClose);
    return () => {
      window.removeEventListener('click', onClose);
    };
  }, []);

  const selectableOptions = options
    .map((_option, optionId) => optionId)
    .filter((optionId) => optionId !== currentlySelectedId);
  const [selectedOption, setSelectedOption] = useState(null);

  const handleSelectItem = (event, optionId) => {
    event.stopPropagation();
    onChange(optionId);
  };

  const handleKeyboardPressed = (event) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (selectedOption === selectableOptions.length - 1) return;
        setSelectedOption(selectedOption + 1);
        break;

      case 'ArrowUp':
        event.preventDefault();
        if (selectedOption === 0) return;
        setSelectedOption(selectedOption - 1);
        break;

      case 'Enter':
      case 'Escape':
      case ' ': // The space key
        event.preventDefault();
        handleSelectItem(event, selectableOptions[selectedOption]);
        break;
    }
  };

  const handleListboxSelected = () => {
    setSelectedOption(0);
  };

  return (
    <div className="dropdown-select">
      <div className="label">{label}</div>
      <hr />
      <ul
        role="listbox"
        tabIndex={0}
        onFocus={(event) => handleListboxSelected(event)}
        onKeyDown={(event) => handleKeyboardPressed(event)}
      >
        {options.map(({ groupName }, id) => {
          const disabled = id === currentlySelectedId;
          let className = id === selectableOptions[selectedOption] ? 'radioSelected' : '';
          className = disabled ? 'disabled' : className;
          return (
            <li
              key={`option-${id}`}
              className={className}
              onClick={(event) => handleSelectItem(event, id)}
              tabIndex={-1}
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
  onChange: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      groupName: PropTypes.string
    })
  ).isRequired,
  currentlySelectedId: PropTypes.number
};
