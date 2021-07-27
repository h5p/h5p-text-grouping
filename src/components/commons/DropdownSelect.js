import React, { useEffect } from 'react';
import './DropdownSelect.scss';

export default function DropdownSelect({ isOpen, onClose, options, disabled, multiSelectable }) {
  useEffect(() => {
    window.addEventListener('click', onClose);
    return () => {
      window.removeEventListener('click', onClose);
    };
  }, [isOpen]);

  return (
    <ul
      className={`dropdown-select ${isOpen ? '' : 'hidden'}`}
      role="listbox"
      aria-multiselectable={multiSelectable || undefined}
    >
      {options.map((option, index) => (
        <li role="option" aria-selected="false" key={index}>
          {option}
        </li>
      ))}
    </ul>
  );
}
