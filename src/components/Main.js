import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import { H5PContext } from '../context/H5PContext';
import Uncategorized from './uncategorized/Uncategorized';
import CategoryList from './categoryList/CategoryList';

import './Main.scss';
import deepCopy from '../helpers/deepCopy';

/**
 * A component that defines the top-level layout and
 * functionality.
 * @param {object} props Props object
 * @returns {JSX.Element} the main content to be displayed
 */
export default function Main({ context }) {
  const {
    params: { textGroups },
    instance,
    getRandomizedTextItems,
    triggerInteracted
  } = context;

  const [appliedCategoryAssignment, setAppliedCategoryAssignment] = useState([
    ...textGroups.map(() => []),
    getRandomizedTextItems().slice()
  ]);

  const [temporaryCategoryAssignment, setTemporaryCategoryAssignment] = useState([
    ...textGroups.map(() => []),
    getRandomizedTextItems().slice()
  ]);

  useEffect(() => {
    instance.on('reset-task', () => {
      setAppliedCategoryAssignment([...textGroups.map(() => []), getRandomizedTextItems().slice()]);
      setTemporaryCategoryAssignment([...textGroups.map(() => []), getRandomizedTextItems().slice()]);
    });
  }, []);

  const uncategorizedId = textGroups.length;

  const applyCategoryAssignment = () => {
    // Animate moved items
    temporaryCategoryAssignment.forEach((category, categoryId) => {
      category.forEach((textItem) => {
        if (
          !appliedCategoryAssignment[categoryId]
            .map((appliedTextItem) => appliedTextItem.id)
            .includes(textItem.id)
        ) {
          textItem.shouldAnimate = true;
        }
      });
    });

    setAppliedCategoryAssignment(deepCopy(temporaryCategoryAssignment));
    triggerInteracted(appliedCategoryAssignment);
  };

  /**
   * Moves a text item from its current category to a new one
   * @param {String} textItemId
   * @param {String} categoryId
   */
  const moveTextItem = (textItemId, categoryId) => {
    const newCategories = temporaryCategoryAssignment.slice();
    let textItem;

    // Remove from previous category
    newCategories.forEach((category) => {
      category.forEach((item, index) => {
        if (item.id === textItemId) {
          textItem = item;
          category.splice(index, 1);
        }
      });
    });

    // Add to new category
    newCategories[categoryId].push(textItem);
    setTemporaryCategoryAssignment(newCategories);
  };

  const removeAnimations = () => {
    const temporaryCategoryAssignmentCopy = deepCopy(temporaryCategoryAssignment);
    temporaryCategoryAssignmentCopy.flat().forEach((textItem) => {
      textItem.shouldAnimate = false;
    });
    setTemporaryCategoryAssignment(temporaryCategoryAssignmentCopy);
    applyCategoryAssignment();
  };

  return (
    <H5PContext.Provider value={context}>
      <CategoryList
        categories={appliedCategoryAssignment}
        textGroups={textGroups}
        moveTextItem={moveTextItem}
        allTextItems={getRandomizedTextItems().slice()}
        applyCategoryAssignment={applyCategoryAssignment}
        appliedCategoryAssignment={appliedCategoryAssignment}
        temporaryCategoryAssignment={temporaryCategoryAssignment}
        removeAnimations={removeAnimations}
      />
      <Uncategorized
        categoryId={uncategorizedId}
        applyCategoryAssignment={applyCategoryAssignment}
        moveTextItem={moveTextItem}
        textItems={{
          category: appliedCategoryAssignment[uncategorizedId],
          categories: [...textGroups, { groupName: 'Uncategorized' }],
          removeAnimations: removeAnimations
        }}
      />
    </H5PContext.Provider>
  );
}

Main.propTypes = {
  context: PropTypes.exact({
    params: PropTypes.object,
    l10n: PropTypes.object,
    instance: PropTypes.object,
    contentId: PropTypes.number,
    getRandomizedTextItems: PropTypes.func.isRequired,
    triggerInteracted: PropTypes.func.isRequired,
    showSelectedSolutions: PropTypes.bool
  }).isRequired
};
