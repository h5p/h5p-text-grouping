let placeholderOffset = 0;
const buildPlaceholders = () => {
  const placeholders = [
    `<div>Placeholder ${placeholderOffset + 1}</div>\n`,
    `<div>Placeholder ${placeholderOffset + 2}</div>\n`
  ];
  placeholderOffset += 2;
  return placeholders;
};

const buildPlaceholderCategory = (id) => ({
  groupName: `Category ${id}`,
  textElements: buildPlaceholders()
});

/**
 * Creates placeholder categories and/or text items with
 * the same shape as a category from the editor if missing.
 * @param {object[]} textGroups
 * @returns {object[]} textGroups with the missing values replaced
 */
export default function createPlaceholdersIfMissing(textGroups) {
  // No categories: add two placeholder categories
  if (!textGroups) {
    return [buildPlaceholderCategory(1, 0), buildPlaceholderCategory(2, 2)];
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
