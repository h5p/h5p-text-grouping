import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';

import './Category.scss';

/**
 * A Category renders a list of TextElements received
 * through parameters, a dropzone, a title and buttons
 * for collapsing and adding other TextElements.
 * @param {object} props Props object containing
 * @param {string} props.title The name of the category
 * @param {JSX.Element[]} props.children Elements to be rendered inside the category
 * @returns {JSX.Element} A single category element
 */
export default function Category({ title, children }) {
  const heading = `${title} (${children.length})`;
  return (
    <div className="category">
      <p className="heading">
        <strong>{heading}</strong>
      </p>
      <hr />
      <ul className="content">
        {children.map((child, index) => (
          <li key={index}>{child}</li>
        ))}
      </ul>
    </div>
  );
}

Category.propTypes = exact({
  title: PropTypes.string.isRequired,
  children: PropTypes.arrayOf(PropTypes.element)
});
