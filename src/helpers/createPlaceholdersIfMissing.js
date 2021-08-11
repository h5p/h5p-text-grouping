// Creates two placeholder text items at a time with an increasing serial number
let placeholderOffset = 0;
const buildPlaceholders = (l10n) => {
  const placeholders = [
    `<div>${l10n.placeholderWord} ${++placeholderOffset}</div>\n`,
    `<div>${l10n.placeholderWord} ${++placeholderOffset}</div>\n`
  ];
  return placeholders;
};

// Builds a placeholder category with two placeholder text items
const buildPlaceholderCategory = (id, l10n) => ({
  groupName: `${l10n.placeholderCategory} ${id}`,
  textElements: buildPlaceholders(l10n)
});

/**
 * Creates placeholder categories and/or text items with
 * the same shape as a category from the editor if missing.
 * @param {object[]} textGroups which may or may not contain missing values
 * @param {object} l10n translations object
 * @returns {object[]} textGroups with all missing values replaced
 */
export default function createPlaceholdersIfMissing(textGroups, l10n) {
  // No categories: add two placeholder categories
  if (!textGroups) {
    return [buildPlaceholderCategory(1, l10n), buildPlaceholderCategory(2, l10n)];
  }

  // Fills categories with groupName and/or textElements if missing
  let newTextGroups = [];
  textGroups.forEach((textGroup, index) => {
    const id = index + 1;
    newTextGroups[index] = {
      groupName: textGroup.groupName || `${l10n.placeholderCategory} ${id}`,
      textElements: textGroup.textElements || buildPlaceholders(l10n)
    };
  });

  // Only one category: add one placeholder category
  if (textGroups.length === 1) {
    newTextGroups[1] = buildPlaceholderCategory(2, l10n);
  }

  return newTextGroups;
}
