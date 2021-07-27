import React from 'react';
import PropTypes from 'prop-types';


import './Uncategorized.scss';

/**
 * Uncategorized is renders a list of TextElements not
 * currently in any categories, a dropzone and a title.
 * @param {object} props Props object
 * @returns {JSX.Element} An uncategorized element
 */
export default function Uncategorized({ context, children }) {
  return (
    <div className="uncategorized">
      <div className="uncategorized-heading">
        {context.params.l10n.uncategorizedLabel}
      </div>
      <ul className="uncategorized-list">
        {children.map((child, index) => (
          <li key={index}>{child}</li>
        ))}
      </ul>
    </div>
  );
}

Uncategorized.propTypes = {
  children: PropTypes.arrayOf(PropTypes.element)
};
