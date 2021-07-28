import React, { useContext } from 'react';
import PropTypes from 'prop-types';

import { H5PContext } from '../../context/H5PContext';
import { useDisclosure } from '../commons/useDisclosure';
import Dropzone from '../commons/Dropzone';
import Button from '../commons/Button';
import DropdownSelect from '../commons/DropdownSelect';
import AssignItemsButton from './AssignItemsButton';

import './Category.scss';

/**
 * A Category renders a list of TextElements received
 * through parameters, a dropzone, a title and buttons
 * for collapsing and adding other TextElements.
 * @param {object} props Props object
 * @returns {JSX.Element} A single category element
 */
export default function Category({ title, children }) {
  const context = useContext(H5PContext);
  const l10n = context.params.l10n;

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
    context.instance.trigger('resize');
  };

  return (
    <div className="category">
      <div className="category-top">
        <Button
          iconName={accordionOpen ? 'second-state-icon' : 'start-state-icon'}
          className="expand-collapse-button"
          ariaLabel={accordionOpen ? l10n.ariaCollapse : l10n.ariaExpand}
          hoverText={accordionOpen ? l10n.hoverCollapse : l10n.hoverExpand}
          onClick={() => handleAccordionToggle()}
          aria-expanded={accordionOpen}
        />
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
