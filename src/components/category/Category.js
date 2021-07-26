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
    <div className="category">
      <p className="heading">
        <strong>{heading}</strong>
      </p>
      <hr />
      <div className="content">{children}</div>
    </div>
  );
}

Category.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.arrayOf(PropTypes.element)
};
