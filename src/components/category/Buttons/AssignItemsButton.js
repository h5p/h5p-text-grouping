import React, { useContext } from 'react';
import PropTypes from 'prop-types';

import { H5PContext } from '../../../context/H5PContext';
import Button from '../../commons/Button';

import './AssignItemsButton.scss';

export default function AssignItemsButton({ expanded, onClick }) {
  const { l10n } = useContext(H5PContext);

  return (
    <Button
      iconName="icon-assign-items"
      className="button-assign-items"
      ariaLabel={l10n.assignItemsHelpText}
      ariaHasPopup="listbox"
      ariaExpanded={expanded}
      hoverText={l10n.assignItemsHelpText}
      onClick={onClick}
    />
  );
}

AssignItemsButton.propTypes = {
  expanded: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired
};
