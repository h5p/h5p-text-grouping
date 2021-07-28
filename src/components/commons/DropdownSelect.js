import React, { useEffect } from 'react';
import './DropdownSelect.scss';

export default function DropdownSelect({ label, onClose, options, selected, multiSelectable }) {
  useEffect(() => {
    window.addEventListener('click', onClose);
    return () => {
      window.removeEventListener('click', onClose);
    };
  }, []);

  const handleSelectItem = (event, index) => {
    event.stopPropagation();
    console.log(`Selected index ${index}`);
  };

  return (
    <div className="dropdown-select">
      <div className="label">{label}</div>
      <hr />
      <ul role="listbox" aria-multiselectable={multiSelectable || undefined}>
        {options.map((option, index) => (
          <li
            className={multiSelectable ? (selected[index] ? 'selected' : 'unselected') : undefined}
            onClick={(event) => handleSelectItem(event, index)}
            role="option"
            aria-selected={selected[index]}
            key={index}
          >
            {option}
          </li>
        ))}
      </ul>
    </div>
  );
}
