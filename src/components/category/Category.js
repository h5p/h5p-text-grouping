import React from 'react';
import PropTypes from 'prop-types';

import './Category.scss';

/**
 * A Category renders a list of TextElements received
 * through parameters, a dropzone, a title and buttons
 * for collapsing and adding other TextElements.
 * @param params Parameters
 */
export default function Category({ title, children }) {
  const heading = `${title} (${children.length})`;
  return (
    <div>
      <p>
        <strong>{heading}</strong>
      </p>
      <div>{children}</div>
    </div>
  );
}

Category.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.arrayOf(PropTypes.element)
};
