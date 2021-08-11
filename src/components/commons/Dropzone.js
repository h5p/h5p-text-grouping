import React from 'react';
import PropTypes from 'prop-types';
import './Dropzone.scss';

/**
 * A Dropzone indicating where textItems can be dragged to.
 */
export default function Dropzone({
  visible
}) {
  return (<div className={`dropzone${visible ? '' : ' hidden'}`}/>);
}

Dropzone.propTypes = {
  visible: PropTypes.bool
};
