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

  const [classNames, setClassNames] = useState(options.map(() => 'radioUnchecked'));

  const handleSelectItem = (event, optionId) => {
    event.stopPropagation();
    onChange(optionId);
  };

  const handleKeyboardPressed = (event) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (classNames[classNames.length - 1] != 'radioUnchecked') return;
        setClassNames((prevClassNames) => {
          const index = prevClassNames.indexOf('radioChecked');
          const classes = options.map(() => 'radioUnchecked');
          classes[index + 1] = 'radioChecked';
          return classes;
        });
        break;

      case 'ArrowUp':
        event.preventDefault();
        if (classNames[0] != 'radioUnchecked') return;
        setClassNames((prevClassNames) => {
          const index = prevClassNames.indexOf('radioChecked');
          const classes = options.map(() => 'radioUnchecked');
          classes[index - 1] = 'radioChecked';
          return classes;
        });
        break;

      case 'Enter':
      case 'Escape':
      case ' ': // The space key
        event.preventDefault();
        handleSelectItem(event, options[classNames.indexOf('radioChecked')][0]);
        break;
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
        onFocus={(event) => handleListboxSelected(event)}
        tabIndex={0}
        onKeyDown={(event) => handleKeyboardPressed(event, null)}
      >
        {options.map(({ groupName }, id) => {
          return (
            <li
              key={`option-${id}`}
              className={classNames[id]}
              onClick={(event) => handleSelectItem(event, id)}
              tabIndex={-1}
              role="option"
              aria-selected={false}
              disabled={id === currentlySelectedId} // TODO: Implement functionality for this attribute
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
