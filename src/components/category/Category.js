import React from 'react';
import PropTypes from 'prop-types';
import Dropzone from '../commons/Dropzone';
import AssignItemsButton from './AssignItemsButton';
import Button from '../commons/Button';

import './Category.scss';

/**
 * A Category renders a list of TextElements received
 * through parameters, a dropzone, a title and buttons
 * for collapsing and adding other TextElements.
 * @param {object} props Props object
 * @returns {JSX.Element} A single category element
 */
export default function Category({ context, title, children }) {
  const [open, setOpen] = React.useState(false);

  const titleWithChildCount = `${title} (${children.length})`;
  const assignItemsToCategory = () => {
    console.log('Button pressed');
  };

  /**
   * Toggle whether the accordion is open or not
   * @param  {string} id
   */
  const handleAccordionToggle = () => {
    setOpen(!open);
  };

  return (
    <div className="category">
      <div className="category-top">
        <Button
          iconName={open ? 'second-state-icon' : 'start-state-icon'}
          className="expand-collapse-button"
          ariaLabel={open ? context.params.l10n.ariaCollapse : context.params.l10n.ariaExpand}
          hoverText={open ? context.params.l10n.hoverCollapse : context.params.l10n.hoverExpand}
          onClick={() => handleAccordionToggle()}
          aria-expanded={open}
        />
        <div className="heading">
          <div>{titleWithChildCount}</div>
          <AssignItemsButton onClick={assignItemsToCategory} />
        </div>
      </div>
      <div className={open ? 'second-state-content' : 'start-state-content'}>
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
