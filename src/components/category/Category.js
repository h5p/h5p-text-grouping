import React, { useState, useContext, useEffect, useRef } from 'react';
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
  textItems,
  textGroups,
  removeAnimation,
  assignTextItem,
  applyCategoryAssignment,
  appliedCategoryAssignment,
  temporaryCategoryAssignment,
  setContainerHeight,
  resetContainerHeight
}) {
  const { instance, l10n } = useContext(H5PContext);
  const narrowScreen = useNarrowScreen();
  const [dropdownSelectOpen, setDropdownSelectOpen] = useState(false);
  const [accordionOpen, setAccordionOpen] = useState(!narrowScreen);
  const categoryHeaderRef = useRef(null);

  useEffect(() => {
    setAccordionOpen(!narrowScreen);
  }, [narrowScreen]);

  const id = categoryId;
  const uncategorizedId = temporaryCategoryAssignment.length - 1;
  const currentlySelectedIds = temporaryCategoryAssignment[id].map((item) => item[0]);

  const textItemElements = textItems.map((textItem) => (
    <TextItem
      key={textItem[0]}
      id={textItem[0]}
      currentCategory={categoryId}
      categories={[...textGroups, { groupName: 'Uncategorized' }]}
      moveTextItem={assignTextItem}
      applyAssignment={applyCategoryAssignment}
      displayedText={textItem[1]}
      animate={textItem[2]}
      removeAnimation={() => removeAnimation(textItem[0])}
      setContainerHeight={setContainerHeight}
      resetContainerHeight={resetContainerHeight}
    />
  ));

  const titleWithChildCount = `${title} (${textItemElements ? textItemElements.length : 0})`;

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

  const setHeight = (height) => {
    setContainerHeight(
      categoryHeaderRef.current.offsetTop + height - categoryHeaderRef.current.offsetHeight
    );
  };

  return (
    <div className="category">
      <div className="header" ref={categoryHeaderRef}>
        <ExpandCollapseButton expanded={accordionOpen} onClick={handleAccordionToggle} />
        <div className="title">{titleWithChildCount}</div>
        <AssignItemsButton expanded={dropdownSelectOpen} onClick={handleDropdownSelectOpen} />
      </div>
      {dropdownSelectOpen ? (
        <div className="dropdown-wrapper">
          <DropdownSelect
            label={l10n.assignItemsHelpText}
            setContainerHeight={setHeight}
            resetContainerHeight={resetContainerHeight}
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
          {textItemElements}
          <li key="key">
            <Dropzone key="key" />
          </li>
        </ul>
      </div>
    </div>
  );
}

Category.propTypes = {
  categoryId: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
  textItems: PropTypes.arrayOf(
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.bool]))
  ).isRequired,
  textGroups: PropTypes.arrayOf(
    PropTypes.shape({
      groupName: PropTypes.string.isRequired
    })
  ).isRequired,
  removeAnimation: PropTypes.func.isRequired,
  assignTextItem: PropTypes.func.isRequired,
  applyCategoryAssignment: PropTypes.func.isRequired,
  appliedCategoryAssignment: PropTypes.arrayOf(
    PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.bool])))
  ).isRequired,
  temporaryCategoryAssignment: PropTypes.arrayOf(
    PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.bool])))
  ).isRequired,
  setContainerHeight: PropTypes.func.isRequired,
  resetContainerHeight: PropTypes.func.isRequired
};
