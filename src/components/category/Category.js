import React from 'react';
import PropTypes from 'prop-types';
import Dropzone from '../commons/Dropzone';
import AssignItemsButton from './AssignItemsButton';
import Button from '../commons/Button';

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
export default function Category({ context, title, children }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [accordionOpen, setAccordionOpen] = React.useState(false);

  //TODO: Test data
  const options = ['To run', 'Blue', 'Admiration', 'Cheerful'];
  const selected = [true, false, false, false];
  const multiSelectable = true;

  const titleWithChildCount = `${title} (${children.length})`;

  /**
   * Toggle whether the accordion is open or not
   * @param  {string} id
   */
  const handleAccordionToggle = () => {
    setAccordionOpen(!accordionOpen);
  };

  return (
    <div className="category">
      <div className="category-top">
        <Button
          iconName={accordionOpen ? 'second-state-icon' : 'start-state-icon'}
          className="expand-collapse-button"
          ariaLabel={accordionOpen ? context.params.l10n.ariaCollapse : context.params.l10n.ariaExpand}
          hoverText={accordionOpen ? context.params.l10n.hoverCollapse : context.params.l10n.hoverExpand}
          onClick={() => handleAccordionToggle()}
          aria-expanded={accordionOpen}
        />
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
  context: PropTypes.exact({
    params: PropTypes.object,
    l10n: PropTypes.object,
    instance: PropTypes.object,
    contentId: PropTypes.number
  }).isRequired,
  title: PropTypes.string.isRequired,
  children: PropTypes.arrayOf(PropTypes.element)
};
