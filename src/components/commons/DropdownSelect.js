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

  return (
    <div className="dropdown-select">
      <div className="label">{label}</div>
      <hr />
      <ul role="listbox" aria-multiselectable={multiSelectable || undefined}>
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
              role="option"
              aria-selected={currentlySelectedIds.includes(optionId)}
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
  options: PropTypes.arrayOf(arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.bool])))
    .isRequired,
  currentlySelectedIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  multiSelectable: PropTypes.bool
};
