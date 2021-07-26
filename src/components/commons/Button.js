import React from 'react';
import './Button.scss';
import PropTypes from 'prop-types';

/**
 * A general Button component to be used in other components.
 * Functionality and apperance is determined by parameters.
 * @param {String} iconName The scss class to display the icon on the button
 * @param {String} className The scss class to add to the button
 * @param {String} ariaLabel The aria label
 * @param {String} hoverText The text to display on hover
 * @param {Boolean} disabled Whether or not the button should be disabled
 * @param {Function} callback The function to run on press
 */
export default function Button({ iconName = '', className = 'default-button', ariaLabel, hoverText = '', disabled = false, callback }) {
  const classes = iconName ? className + ' ' + iconName : className;

  return (
    <button
      onClick={callback}
      className={classes}
      aria-label={ariaLabel}
      title={hoverText}
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
  callback: PropTypes.func.isRequired
};
