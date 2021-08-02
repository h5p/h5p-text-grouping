import React, { useState, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';

import { H5PContext } from '../../context/H5PContext';
import Dropzone from '../commons/Dropzone';
import MultiDropdownSelect from '../commons/MultiDropdownSelect';
import ExpandCollapseButton from './Buttons/ExpandCollapseButton';
import AssignItemsButton from './Buttons/AssignItemsButton';
import TextItem from '../textItem/TextItem';

import './Category.scss';
import useNarrowScreen from '../../helpers/useNarrowScreen';

/**
 * A Category renders a list of TextElements received
 * through parameters, a dropzone, a title and buttons
 * for collapsing and adding other TextElements.
 * @param {object} props Props object
 * @returns {JSX.Element} A single category element
 */
export default function Category({
  categoryId,
  title,
  moveTextItem,
  allTextItems,
  temporaryCategoryAssignment,
  applyCategoryAssignment,
  textItems: { category, categories, removeAnimations }
}) {
  console.log(allTextItems);
  const { instance, l10n } = useContext(H5PContext);
  const narrowScreen = useNarrowScreen();
  const [dropdownSelectOpen, setDropdownSelectOpen] = useState(false);
  const [accordionOpen, setAccordionOpen] = useState(!narrowScreen);
  const [dropzoneVisible, setDropzoneVisible] = useState(false);
  useEffect(() => {
    setAccordionOpen(!narrowScreen);
  }, [narrowScreen]);

  const uncategorizedId = temporaryCategoryAssignment.length - 1;
  const currentlySelectedIds = temporaryCategoryAssignment[categoryId].map(
    (textItem) => textItem.id
  );
  const titleWithChildCount = `${title} (${category ? category.length : 0})`;

  /**
   * Toggle whether the accordion is open or not
   */
  const handleAccordionToggle = () => {
    setAccordionOpen(!accordionOpen);
    instance.trigger('resize');
  };

  const handleDropdownSelectOpen = () => setDropdownSelectOpen(true);

  const handleDropdownSelectClose = () => {
    applyCategoryAssignment();
    setDropdownSelectOpen(false);
    instance.trigger('resize');
  };

  const toggleTextItem = (textItemId) => {
    if (currentlySelectedIds.includes(textItemId)) {
      moveTextItem(textItemId, uncategorizedId);
    }
    else {
      moveTextItem(textItemId, categoryId);
    }
  };

  const textItems = category.map(({ id, content, shouldAnimate }) => {
    return (
      <TextItem
        key={id}
        textItemId={id}
        currentCategoryId={categoryId}
        categories={categories}
        moveTextItem={moveTextItem}
        applyAssignment={applyCategoryAssignment}
        textElement={content}
        shouldAnimate={shouldAnimate}
        removeAnimations={removeAnimations}
      />
    );
  });

  return (
    <div className="category">
      <div className="header">
        <ExpandCollapseButton expanded={accordionOpen} onClick={handleAccordionToggle} />
        <div className="title">{titleWithChildCount}</div>
        <AssignItemsButton expanded={dropdownSelectOpen} onClick={handleDropdownSelectOpen} />
      </div>
      {dropdownSelectOpen ? (
        <div className="dropdown-wrapper">
          <MultiDropdownSelect
            label={l10n.assignItemsHelpText}
            onChange={(textItemId) => toggleTextItem(textItemId)}
            onClose={handleDropdownSelectClose}
            options={allTextItems}
            currentlySelectedIds={currentlySelectedIds}
          />
        </div>
      ) : null}
      <div className={accordionOpen ? undefined : 'collapsed'}>
        <hr />
        <ul className="content">
          {textItems}
          <li>
            <Dropzone key={`dropzone-${categoryId}`} visible={dropzoneVisible} />
          </li>
        </ul>
      </div>
    </div>
  );
}

Category.propTypes = {
  categoryId: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
  moveTextItem: PropTypes.func.isRequired,
  allTextItems: PropTypes.arrayOf(
    PropTypes.exact({
      id: PropTypes.string,
      content: PropTypes.string,
      shouldAnimate: PropTypes.bool
    })
  ),
  temporaryCategoryAssignment: PropTypes.arrayOf(
    PropTypes.arrayOf(
      PropTypes.exact({
        id: PropTypes.string,
        content: PropTypes.string,
        shouldAnimate: PropTypes.bool
      })
    )
  ),
  applyCategoryAssignment: PropTypes.func.isRequired,
  textItems: PropTypes.exact({
    category: PropTypes.arrayOf(
      PropTypes.exact({
        id: PropTypes.string,
        content: PropTypes.string,
        shouldAnimate: PropTypes.bool
      })
    ),
    categories: PropTypes.arrayOf(
      PropTypes.shape({
        groupName: PropTypes.string
      })
    ),
    removeAnimations: PropTypes.func
  }).isRequired
};
