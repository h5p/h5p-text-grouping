import React from 'react';
import PropTypes from 'prop-types';
import Dropzone from '../commons/Dropzone';
import AssignItemsButton from './AssignItemsButton';

import './Category.scss';
import DropdownSelect from '../commons/DropdownSelect';
import { useDisclosure } from '../commons/useDisclosure';
/**
 * A Category renders a list of TextElements received
 * through parameters, a dropzone, a title and buttons
 * for collapsing and adding other TextElements.
 * @param {object} props Props object
 * @returns {JSX.Element} A single category element
 */
export default function Category({ title, children }) {
  const { isOpen, onOpen, onClose } = useDisclosure();

  //TODO: Test data
  const options = ['To run', 'Blue', 'Admiration', 'Cheerful'];
  const selected = [true, false, false, false];
  const multiSelectable = true;

  const titleWithChildCount = `${title} (${children.length})`;

  return (
    <div className="category">
      <div className="heading">
        <div>{titleWithChildCount}</div>
        <AssignItemsButton expanded={isOpen} onClick={onOpen} />
        {isOpen ? (
          <DropdownSelect
            onClose={onClose}
            options={options}
            selected={selected}
            multiSelectable={multiSelectable}
          />
        ) : null}
      </div>
      <hr />
      <ul className="content">
        {children}
        <li key="key">
          <Dropzone key="key" />
        </li>
      </ul>
    </div>
  );
}

Category.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.arrayOf(PropTypes.element)
};
