import React, { useEffect } from 'react';
import './DropdownSelect.scss';

export default function DropdownSelect({
  label,
  onChange,
  onClose,
  options,
  currentlySelectedIds,
  multiSelectable
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
