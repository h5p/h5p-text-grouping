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
export default function Category({ title, children }) {
  const { instance, l10n } = useContext(H5PContext);

  const [dropdownSelectOpen, setDropdownSelectOpen] = useState(false);
  const [accordionOpen, setAccordionOpen] = useState(false);

  //TODO: Test data
  const options = [
    'To run',
    'Blue',
    'Admiration',
    'Cheerful',
    'Blue',
    'Admiration',
    'Cheerful',
    'Blue',
    'Admiration',
    'Cheerful',
    'Admiration',
    'Cheerful',
    'Blue',
    'Admiration'
  ];
  const selected = [
    true,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false
  ];
  const multiSelectable = true;

  const titleWithChildCount = `${title} (${children ? children.length : 0})`;

  /**
   * Toggle whether the accordion is open or not
   */
  const handleAccordionToggle = () => {
    setAccordionOpen(!accordionOpen);
    instance.trigger('resize');
  };

  const handleDropdownSelectOpen = () => setDropdownSelectOpen(true);
  const handleDropdownSelectClose = () => setDropdownSelectOpen(false);

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
              onClose={handleDropdownSelectClose}
              options={options}
              selected={selected}
              multiSelectable={multiSelectable}
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
  children: PropTypes.arrayOf(PropTypes.element)
};
