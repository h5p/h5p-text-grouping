import React, { useEffect, useState } from 'react';
import './DropdownSelect.scss';

export default function DropdownSelect({
  label,
  onClose,
  options,
  currentlySelectedIds,
  multiSelectable
}) {
  const [selectedIds, setSelectedIds] = useState(currentlySelectedIds);
  useEffect(() => {
    window.addEventListener('click', onClose);
    return () => {
      window.removeEventListener('click', onClose);
    };
  }, []);

  const handleSelectItem = (event, optionId) => {
    event.stopPropagation();
    const newSelectedIds = [...selectedIds];
    const indexOfOptionId = newSelectedIds.indexOf(optionId);
    if (indexOfOptionId > -1) {
      newSelectedIds.splice(indexOfOptionId, 1);
      setSelectedIds(newSelectedIds);
    }
    else {
      setSelectedIds([...newSelectedIds, optionId]);
    }
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
                  ? selectedIds.includes(optionId)
                    ? 'selected'
                    : 'unselected'
                  : undefined
              }
              onClick={(event) => handleSelectItem(event, optionId)}
              role="option"
              aria-selected={selectedIds.includes(optionId)}
              dangerouslySetInnerHTML={{ __html: optionElement }}
            />
          );
        })}
      </ul>
    </div>
  );
}
