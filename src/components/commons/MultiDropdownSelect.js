import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

import './DropdownSelect.scss';

/**
 * Dropdown select menu with either multi selectable options
 * @param {object} props Props object
 * @returns {JSX.Element} Dropdown select menu
 */
export default function MultiDropdownSelect({
  label,
  onChange,
  onClose,
  options,
  currentlySelectedIds
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
    switch (event.key) {
      case ' ': // The space key
        event.preventDefault();
        handleSelectItem(event, optionId);
        break;

      case 'Enter':
      case 'Escape':
        onClose();
        break;
    }
  };

  return (
    <div className="dropdown-select">
      <div className="label">{label}</div>
      <hr />
      <ul role="listbox" tabIndex={-1} aria-multiselectable={true}>
        {options.map((option) => {
          const { id, content } = option;
          return (
            <li
              key={`option-${id}`}
              className={currentlySelectedIds.includes(id) ? 'selected' : 'unselected'}
              onClick={(event) => handleSelectItem(event, id)}
              onKeyDown={(event) => handleKeyboardPressed(event, id)}
              tabIndex={0}
              role="option"
              aria-selected={currentlySelectedIds.includes(id)}
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
  onChange: PropTypes.func.isRequired,
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
