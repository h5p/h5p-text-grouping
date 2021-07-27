import React from 'react';
import PropTypes from 'prop-types';

import './Button.scss';

/**
 * A general Button component to be used in other components.
 * Functionality and appearance is determined by parameters.
 */
export default function Button({
  iconName,
  className = '',
  ariaLabel,
  ariaHasPopup = false,
  ariaExpanded = false,
  hoverText,
  disabled,
  onClick,
  children
}) {
  return (
    <button
      onClick={onClick}
      className={`h5p-text-grouping-button ${className} ${iconName ? iconName : ''}`}
      aria-label={ariaLabel}
      aria-haspopup={ariaHasPopup || undefined}
      aria-expanded={ariaExpanded || undefined}
      title={hoverText ? hoverText : ''}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

Button.propTypes = {
  iconName: PropTypes.string,
  className: PropTypes.string,
  ariaLabel: PropTypes.string.isRequired,
  ariaHasPopup: PropTypes.oneOf(['false', 'true', 'menu', 'listbox', 'tree', 'grid', 'dialog']),
  ariaExpanded: PropTypes.bool,
  hoverText: PropTypes.string,
  disabled: PropTypes.bool,
  onClick: PropTypes.func.isRequired
};
