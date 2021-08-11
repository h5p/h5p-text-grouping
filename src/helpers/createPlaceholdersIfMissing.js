// Creates two placeholder text items at a time with an increasing serial number
let placeholderOffset = 0;
const buildPlaceholders = () => {
  const placeholders = [
    `<div>Placeholder ${placeholderOffset + 1}</div>\n`,
    `<div>Placeholder ${placeholderOffset + 2}</div>\n`
  ];
  placeholderOffset += 2;
  return placeholders;
};

// Builds a placeholder category with two placeholder text items
const buildPlaceholderCategory = (id) => ({
  groupName: `Category ${id}`,
  textElements: buildPlaceholders()
});

/**
 * Creates placeholder categories and/or text items with
 * the same shape as a category from the editor if missing.
 * @param {object[]} textGroups which may or may not contain missing values
 * @returns {object[]} textGroups with all missing values replaced
 */
export default function createPlaceholdersIfMissing(textGroups) {
  // No categories: add two placeholder categories
  if (!textGroups) {
    return [buildPlaceholderCategory(1), buildPlaceholderCategory(2)];
  }

  // Fills categories with groupName and/or textElements if missing
  let newTextGroups = [];
  textGroups.forEach((textGroup, index) => {
    const id = index + 1;
    newTextGroups[index] = {
      groupName: textGroup.groupName || `Category ${id}`,
      textElements: textGroup.textElements || buildPlaceholders()
    };
  });

  // Only one category: add one placeholder category
  if (textGroups.length === 1) {
    newTextGroups[1] = buildPlaceholderCategory(2);
  }

  return newTextGroups;
}
