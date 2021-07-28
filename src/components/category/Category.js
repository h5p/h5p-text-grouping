import React, { useContext } from 'react';
import PropTypes from 'prop-types';

import { H5PContext } from '../../context/H5PContext';
import { useDisclosure } from '../commons/useDisclosure';
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
  const { instance } = useContext(H5PContext);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [accordionOpen, setAccordionOpen] = React.useState(false);

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

  const titleWithChildCount = `${title} (${children.length})`;

  /**
   * Toggle whether the accordion is open or not
   * @param  {string} id
   */
  const handleAccordionToggle = () => {
    setAccordionOpen(!accordionOpen);
    instance.trigger('resize');
  };

  return (
    <div className="category">
      <div className="category-top">
        <ExpandCollapseButton expanded={accordionOpen} onClick={handleAccordionToggle} />
        <div className="heading">
          <div>{titleWithChildCount}</div>
          <AssignItemsButton expanded={isOpen} onClick={onOpen} />
          {isOpen ? (
            <DropdownSelect
              label={'Assign items to this category'}
              onClose={onClose}
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
