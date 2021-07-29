import React, { useState, useContext } from 'react';
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
  animate
}) {
  const { instance, l10n } = useContext(H5PContext);
  const [dropdownSelectOpen, setDropdownSelectOpen] = useState(false);
  const [selectableCategories, setSelectableCategories] = useState();

  const handleDropdownSelectOpen = () => {
    setSelectableCategories(
      categories
        .map((category, i) => [`category-${i}`, category.groupName])
        .filter((category, i) => `category-${i}` !== currentCategory)
    );

    setDropdownSelectOpen(true);
  };

  const handleDropdownSelectClose = () => {
    applyAssignment();
    setDropdownSelectOpen(false);
    instance.trigger('resize');
  };

  const selectCategory = (categoryId) => {
    moveTextItem(id, categoryId);
    handleDropdownSelectClose();
  };

  return (
    <li className={`text-item-wrapper${animate ? ' animate' : ''}`}>
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
          {dropdownSelectOpen ? (
            <DropdownSelect
              label={l10n.assignItemsHelpText}
              onChange={(categoryId) => selectCategory(categoryId)}
              onClose={handleDropdownSelectClose}
              options={selectableCategories}
              multiSelectable={false}
            />
          ) : null}
        </div>
      </div>
    </li>
  );
}

TextItem.propTypes = {
  id: PropTypes.string.isRequired,
  currentCategory: PropTypes.string.isRequired,
  categories: PropTypes.arrayOf(
    PropTypes.shape({
      groupName: PropTypes.string.isRequired
    })
  ),
  moveTextItem: PropTypes.func.isRequired,
  applyAssignment: PropTypes.func.isRequired,
  displayedText: PropTypes.string.isRequired
};
