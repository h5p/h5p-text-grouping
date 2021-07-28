import React, { useContext } from 'react';
import PropTypes from 'prop-types';

import { H5PContext } from '../../../context/H5PContext';
import Button from '../../commons/Button';

import './AssignItemsButton.scss';
import './ExpandCollapseButton.scss';

export default function ExpandCollapseButton({ expanded, onClick }) {
  const { l10n } = useContext(H5PContext);

  return (
    <Button
      iconName={expanded ? 'second-state-icon' : 'start-state-icon'}
      className="expand-collapse-button"
      ariaLabel={expanded ? l10n.ariaCollapse : l10n.ariaExpand}
      hoverText={expanded ? l10n.hoverCollapse : l10n.hoverExpand}
      onClick={onClick}
      aria-expanded={expanded}
    />
  );
}

ExpandCollapseButton.propTypes = {
  expanded: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired
};
