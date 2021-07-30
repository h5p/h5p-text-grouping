import React, { useState, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';

import { H5PContext } from '../../context/H5PContext';
import Dropzone from '../commons/Dropzone';
import DropdownSelect from '../commons/DropdownSelect';
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
  assignTextItem,
  applyCategoryAssignment,
  appliedCategoryAssignment,
  temporaryCategoryAssignment,
  textItems: {
    category, 
    currentCategory, 
    categories,
    removeAnimations
  }
}) {
  const { instance, l10n } = useContext(H5PContext);
  const narrowScreen = useNarrowScreen();
  const [dropdownSelectOpen, setDropdownSelectOpen] = useState(false);
  const [accordionOpen, setAccordionOpen] = useState(!narrowScreen);
  const [dropzoneVisible, setDropzoneVisible] = useState(false);
  useEffect(() => {
    setAccordionOpen(!narrowScreen);
  }, [narrowScreen]);

  const id = categoryId;
  const uncategorizedId = temporaryCategoryAssignment.length - 1;
  const currentlySelectedIds = temporaryCategoryAssignment[id].map((item) => item[0]);
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
      assignTextItem(textItemId, uncategorizedId);
    }
    else {
      assignTextItem(textItemId, categoryId);
    }
  };

  const textItems = (
    category.map((textItem) => {
      const [textItemId, textItemElement, textItemShouldAnimate] = textItem;
      return (
        <TextItem
          key={textItemId}
          textItemId={textItemId}
          currentCategory={currentCategory}
          categories={[...categories, { groupName: 'Uncategorized' }]}
          moveTextItem={assignTextItem}
          applyAssignment={applyCategoryAssignment}
          textElement={textItemElement}
          shouldAnimate={textItemShouldAnimate}
          removeAnimations={removeAnimations}
        />
      );
    })
  );
  
  return (
    <div className="category">
      <div className="header">
        <ExpandCollapseButton expanded={accordionOpen} onClick={handleAccordionToggle} />
        <div className="title">{titleWithChildCount}</div>
        <AssignItemsButton expanded={dropdownSelectOpen} onClick={handleDropdownSelectOpen} />
      </div>
      {dropdownSelectOpen ? (
        <div className="dropdown-wrapper">
          <DropdownSelect
            label={l10n.assignItemsHelpText}
            onChange={(textItemId) => toggleTextItem(textItemId)}
            onClose={handleDropdownSelectClose}
            options={appliedCategoryAssignment.flat()}
            currentlySelectedIds={currentlySelectedIds}
            multiSelectable={true}
          />
        </div>
      ) : null}
      <div className={accordionOpen ? undefined : 'collapsed'}>
        <hr />
        <ul className="content">
          {textItems}
          <li>
            <Dropzone key={`dropzone-${categoryId}`} visible={dropzoneVisible}/>
          </li>
        </ul>
      </div>
    </div>
  );
}

Category.propTypes = {
  title: PropTypes.string.isRequired,
  currentCategoryAssignment: PropTypes.arrayOf(
    PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string))
  ),
  children: PropTypes.arrayOf(PropTypes.element)
};
