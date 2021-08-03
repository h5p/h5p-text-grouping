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

  const [showSelectedSolutions, setShowSelectedSolutions] = useState(false);

  const [appliedCategoryAssignment, setAppliedCategoryAssignment] = useState([
    ...textGroups.map(() => []),
    getRandomizedTextItems().slice()
  ]);

  const [temporaryCategoryAssignment, setTemporaryCategoryAssignment] = useState([
    ...textGroups.map(() => []),
    getRandomizedTextItems().slice()
  ]);

  useEffect(() => {
    instance.on('xAPI', function (event) {
      if (event.getVerb() === 'answered') {
        setShowSelectedSolutions(true);
      }
    });
  }, []);

  useEffect(() => {
    instance.on('reset-task', () => {
      setShowSelectedSolutions(false);
      setAppliedCategoryAssignment([...textGroups.map(() => []), getRandomizedTextItems().slice()]);
      setTemporaryCategoryAssignment([
        ...textGroups.map(() => []),
        getRandomizedTextItems().slice()
      ]);
    });
  }, []);

  const uncategorizedId = textGroups.length;

  const [draggedTextItem, setDraggedTextItem] = useState({ textItemId: -1, categoryId: -1 });

  const applyCategoryAssignment = () => {
    setAppliedCategoryAssignment(deepCopy(temporaryCategoryAssignment));
    triggerInteracted(appliedCategoryAssignment);
  };

  /**
   * Moves a text item from its current category to a new one
   * @param {String} textItemId
   * @param {String} categoryId
   */
  const moveTextItem = (textItemId, newCategoryId, prevCategoryId = null) => {
    const newCategories = temporaryCategoryAssignment.slice();
    let textItem;

    // Remove from previous category
    let i = (prevCategoryId === null ? 0 : prevCategoryId); 
    const limit = (prevCategoryId === null ? textGroups.length : prevCategoryId);
    for (i; i <= limit; i++) {
      newCategories[i].forEach((item, index) => {
        if (item.id === textItemId) {
          textItem = item;
          textItem.shouldAnimate = true;
          newCategories[i].splice(index, 1);
        }
      });
    }

    // Add to new category
    newCategories[newCategoryId].push(textItem);
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

  const textItemDragStart = (event, textItemId, currentCategoryId) => {
    if (event.button !== 0 || event.target.className.includes('button-move-to-category')) return;
    event.preventDefault();
    setDraggedTextItem({ textItemId: textItemId, categoryId: currentCategoryId });
  };

  const textItemDragEnd = (event, categoryId = null) => {
    if (
      categoryId !== null &&
      draggedTextItem.textItemId !== -1 &&
      categoryId !== draggedTextItem.categoryId
    ) {
      moveTextItem(draggedTextItem.textItemId, categoryId, draggedTextItem.categoryId);
      applyCategoryAssignment();
    }
    setDraggedTextItem({ textItemId: -1, categoryId: -1 });
  };

  document.onmouseup = (event) => {
    let node = event.target;
    while (node.parentNode) {
      if (node.className.includes('category ')) {
        let className = node.className;
        textItemDragEnd(event, parseInt(className.replace('category ', '')));
        return;
      }
      else if (node.className === 'uncategorized') {
        textItemDragEnd(event, uncategorizedId);
      }
      node = node.parentNode;
    }
    textItemDragEnd(event);
  };

  return (
    <H5PContext.Provider value={{ ...context, showSelectedSolutions }}>
      <CategoryList
        categories={appliedCategoryAssignment}
        textGroups={textGroups}
        moveTextItem={moveTextItem}
        allTextItems={getRandomizedTextItems().slice()}
        applyCategoryAssignment={applyCategoryAssignment}
        textItemDragStart={textItemDragStart}
        draggedTextItem={draggedTextItem}
        temporaryCategoryAssignment={temporaryCategoryAssignment}
        removeAnimations={removeAnimations}
      />
      <Uncategorized
        categoryId={uncategorizedId}
        applyCategoryAssignment={applyCategoryAssignment}
        moveTextItem={moveTextItem}
        textItemDragStart={textItemDragStart}
        draggedTextItem={draggedTextItem}
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
