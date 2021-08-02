import React, { useState, useContext, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

import { H5PContext } from '../../context/H5PContext';
import Button from '../commons/Button';
import DropdownSelect from '../commons/DropdownSelect';
import './TextItem.scss';

/**
 * A TextItem represents what the user is trying to
 * place in the correct category.
 * It renders the text received through parameters,
 * and a button to move to a different category.
 * @param {object} props Props object
 * @returns {JSX.Element} A single text item with button
 */
export default function TextItem({
  id,
  currentCategory,
  categories,
  moveTextItem,
  applyAssignment,
  displayedText,
  animate,
  removeAnimation,
  setContainerHeight,
  resetContainerHeight
}) {
  const { instance, l10n } = useContext(H5PContext);
  const [dropdownSelectOpen, setDropdownSelectOpen] = useState(false);
  const [selectableCategories, setSelectableCategories] = useState();
  const textItemRef = useRef(null);
  useEffect(() => {
    return () => {
      removeAnimation();
    };
  }, [animate]);

  const handleDropdownSelectOpen = () => {
    setSelectableCategories(
      categories
        .map((category, i) => [i, category.groupName])
        .filter((category, i) => i !== currentCategory)
    );
    setDropdownSelectOpen(true);
    instance.trigger('resize');
  };

  const handleDropdownSelectClose = () => {
    applyAssignment();
    setDropdownSelectOpen(false);
    resetContainerHeight();
    instance.trigger('resize');
  };

  const selectCategory = (categoryId) => {
    moveTextItem(id, categoryId);
    handleDropdownSelectClose();
  };

  const setHeight = (height) => {
    // If the dropdown can't fit in the textitem
    if (height > textItemRef.current.offsetHeight / 2) {
      const offset =
        textItemRef.current.offsetTop +
        textItemRef.current.offsetHeight +
        (height - textItemRef.current.offsetHeight / 2);
      setContainerHeight(offset);
    }
  };

  return (
    <li className={`text-item-wrapper${animate ? ' animate' : ''}`} ref={textItemRef}>
      <div className="text-item-border">
        <div className="text-item">
          <div dangerouslySetInnerHTML={{ __html: displayedText }} />
          <Button
            iconName="icon-move-to-category"
            className="button-move-to-category"
            ariaLabel={l10n.ariaMoveToCategory}
            hoverText={l10n.hoverMoveToCategory}
            onClick={handleDropdownSelectOpen}
          />
        </div>
        {dropdownSelectOpen ? (
          <div className="dropdown-wrapper">
            <DropdownSelect
              label={l10n.moveItemsHelpText}
              setContainerHeight={setHeight}
              resetContainerHeight={resetContainerHeight}
              onChange={(categoryId) => selectCategory(categoryId)}
              onClose={handleDropdownSelectClose}
              options={selectableCategories}
              multiSelectable={false}
            />
          </div>
        ) : null}
      </div>
    </li>
  );
}

TextItem.propTypes = {
  id: PropTypes.string.isRequired,
  currentCategory: PropTypes.number.isRequired,
  categories: PropTypes.arrayOf(
    PropTypes.shape({
      groupName: PropTypes.string.isRequired
    })
  ),
  moveTextItem: PropTypes.func.isRequired,
  applyAssignment: PropTypes.func.isRequired,
  displayedText: PropTypes.string.isRequired,
  setContainerHeight: PropTypes.func.isRequired,
  resetContainerHeight: PropTypes.func.isRequired
};
