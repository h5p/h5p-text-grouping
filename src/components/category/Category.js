import React, { useState, useContext } from 'react';
import PropTypes from 'prop-types';

import { H5PContext } from '../../context/H5PContext';
import Dropzone from '../commons/Dropzone';
import DropdownSelect from '../commons/DropdownSelect';
import ExpandCollapseButton from './Buttons/ExpandCollapseButton';
import AssignItemsButton from './Buttons/AssignItemsButton';

import './Category.scss';

/**
 * A Category renders a list of TextElements received
 * through parameters, a dropzone, a title and buttons
 * for collapsing and adding other TextElements.
 * @param {object} props Props object
 * @returns {JSX.Element} A single category element
 */
export default function Category({
  categoryId,
  title,
  assignTextItem,
  applyCategoryAssignment,
  temporaryCategoryAssignment,
  children
}) {
  const { instance, l10n } = useContext(H5PContext);
  const [dropdownSelectOpen, setDropdownSelectOpen] = useState(false);
  const [accordionOpen, setAccordionOpen] = useState(false);

  const id = categoryId.substring(9);
  const uncategorizedId = `category-${temporaryCategoryAssignment.length - 1}`;
  const currentlySelectedIds = temporaryCategoryAssignment[id].map((item) => item[0]);
  const titleWithChildCount = `${title} (${children ? children.length : 0})`;

  /**
   * Toggle whether the accordion is open or not
   */
  const handleAccordionToggle = () => {
    setAccordionOpen(!accordionOpen);
    instance.trigger('resize');
  };

  const handleDropdownSelectOpen = () => setDropdownSelectOpen(true);
  const handleDropdownSelectClose = () => {
    applyCategoryAssignment();
    setDropdownSelectOpen(false);
  };
  const toggleTextItem = (textItemId) => {
    if (currentlySelectedIds.includes(textItemId)) {
      assignTextItem(textItemId, uncategorizedId);
    }
    else {
      assignTextItem(textItemId, categoryId);
    }
  };

  return (
    <div className="category">
      <div className="category-top">
        <ExpandCollapseButton expanded={accordionOpen} onClick={handleAccordionToggle} />
        <div className="heading">
          <div>{titleWithChildCount}</div>
          <AssignItemsButton expanded={dropdownSelectOpen} onClick={handleDropdownSelectOpen} />
          {dropdownSelectOpen ? (
            <DropdownSelect
              label={l10n.assignItemsHelpText}
              onChange={(textItemId) => toggleTextItem(textItemId)}
              onClose={handleDropdownSelectClose}
              options={temporaryCategoryAssignment.flat()}
              currentlySelectedIds={currentlySelectedIds}
              multiSelectable={true}
            />
          ) : null}
        </div>
      </div>
      <div className={accordionOpen ? 'second-state-content' : 'start-state-content'}>
        <hr />
        <ul className="content">
          {children}
          <li key="key">
            <Dropzone key="key" />
          </li>
        </ul>
      </div>
    </div>
  );
}

Category.propTypes = {
  title: PropTypes.string.isRequired,
  currentCategoryAssignment: PropTypes.arrayOf(
    PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string))
  ),
  children: PropTypes.arrayOf(PropTypes.element)
};
