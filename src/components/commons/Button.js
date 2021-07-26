import React from 'react';
import './Button.scss';
import PropTypes from 'prop-types';

/**
 * A general Button component to be used in other components.
 * Functionality and apperance is determined by parameters.
 */
export default function Button({ iconName, className = '', ariaLabel, hoverText, disabled, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`h5p-text-grouping-button ${className} ${(iconName? iconName : '')}`}
      aria-label={ariaLabel}
      title={hoverText ? hoverText : ''}
      disabled={disabled}
    />
  );
}

Button.propTypes = {
  iconName: PropTypes.string,
  className: PropTypes.string,
  ariaLabel: PropTypes.string.isRequired,
  hoverText: PropTypes.string,
  disabled: PropTypes.bool,
  onClick: PropTypes.func.isRequired
};
