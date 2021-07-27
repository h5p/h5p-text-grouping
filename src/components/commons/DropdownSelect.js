import React, { useState, useEffect } from 'react';
import './DropdownSelect.scss';

export default function DropdownSelect({ onClose, options, selected, multiSelectable }) {
  useEffect(() => {
    window.addEventListener('click', onClose);
    return () => {
      window.removeEventListener('click', onClose);
    };
  });

  return (
    <ul
      className={`dropdown-select`}
      role="listbox"
      aria-multiselectable={multiSelectable || undefined}
    >
      {options.map((option, index) => (
        <li role="option" aria-selected={selected[index]} key={index}>
          {`${selected[index] ? 'v' : 'x'} ${option}`}
        </li>
      ))}
    </ul>
  );
}
