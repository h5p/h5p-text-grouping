import React from 'react';
import PropTypes from 'prop-types';
import Dropzone from '../commons/Dropzone';
import AssignItemsButton from './AssignItemsButton';

import './Category.scss';

/**
 * A Category renders a list of TextElements received
 * through parameters, a dropzone, a title and buttons
 * for collapsing and adding other TextElements.
 * @param {object} props Props object
 * @returns {JSX.Element} A single category element
 */
export default function Category({ title, children }) {
  const titleWithChildCount = `${title} (${children.length})`;
  const assignItemsToCategory = () => {
    console.log('Button pressed');
  };

  return (
    <div className="category">
      <div className="heading">
        <div>{titleWithChildCount}</div>
        <AssignItemsButton onClick={assignItemsToCategory} />
      </div>
      <hr />
      <ul className="content">
        {[...children.map((child, index) => (
          <li key={index}>{child}</li>
        )), <li key='key'><Dropzone key='key'/></li>]}
      </ul>
    </div>
  );
}

Category.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.arrayOf(PropTypes.element)
};
