import React, { useContext } from 'react';
import PropTypes from 'prop-types';

import './Uncategorized.scss';
import { H5PContext } from '../../context/H5PContext';

/**
 * Uncategorized is renders a list of TextElements not
 * currently in any categories, a dropzone and a title.
 * @param {object} props Props object
 * @returns {JSX.Element} An uncategorized element
 */
export default function Uncategorized({ children }) {
  const { l10n } = useContext(H5PContext);

  return (
    <div className="uncategorized">
      <div className="uncategorized-heading">{l10n.uncategorizedLabel}</div>
      <ul className={`uncategorized-list ${children.length === 1 ? 'single-text-item' : ''}`}>
        {children}
      </ul>
    </div>
  );
}

Uncategorized.propTypes = {
  children: PropTypes.arrayOf(PropTypes.element)
};
