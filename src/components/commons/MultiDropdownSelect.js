import React, { useEffect, useRef } from 'react';
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
  onChange,
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
    switch (event.key) {
      case ' ': // The space key
        event.preventDefault();
        handleSelectItem(event, optionId);
        break;

      case 'Enter':
      case 'Escape':
        event.preventDefault();
        handleClose();
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
  setContainerHeight: PropTypes.func.isRequired,
  resetContainerHeight: PropTypes.func.isRequired,
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
