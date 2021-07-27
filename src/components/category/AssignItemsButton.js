import React from 'react';
import PropTypes from 'prop-types';

import Button from '../commons/Button';

import './AssignItemsButton.scss';

export default function AssignItemsButton({ expanded, onClick }) {
  return (
    <Button
      iconName="icon-assign-items"
      className="button-assign-items"
      ariaLabel="Assign items to category"
      ariaHasPopup="listbox"
      ariaExpanded={expanded}
      hoverText="Assign items to category"
      onClick={onClick}
    />
  );
}

AssignItemsButton.propTypes = {
  expanded: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired
};
