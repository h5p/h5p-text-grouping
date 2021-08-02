import React from 'react';
import './Dropzone.scss';

/**
 * A Dropzone indicating where textItems can be dragged to.
 */
export default function Dropzone({
  visible
}) {
  // TODO: Dummy return statement
  return (<div className={`dropzone${visible ? '' : ' hidden'}`}/>);
}
