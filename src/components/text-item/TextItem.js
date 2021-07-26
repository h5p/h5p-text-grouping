import React from 'react';
import PropTypes from 'prop-types';

import './TextItem.scss';

/**
 * A TextItem represents what the user is trying to
 * place in the correct category.
 * It renders the text received through parameters,
 * and a button to move to a different category.
 * @param props Props object
 * @returns {JSX.Element} A single text item element
 */
export default function TextItem({ text }) {
  return <div dangerouslySetInnerHTML={{ __html: text }} />;
}

TextItem.propTypes = {
  text: PropTypes.string.isRequired
};
