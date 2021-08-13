// Builds a placeholder category with no text items
const buildPlaceholderCategory = (id, l10n) => ({
  groupName: `${l10n.placeholderCategory} ${id}`,
  textElements: []
});

/**
 * Creates placeholder categories with the same shape as a category
 * from the editor. If no categories are present, two are created.
 * If one is missing, then one is created.
 * @param {object[]} textGroups which may or may not contain missing values
 * @param {object} l10n translation object
 * @returns {object[]} textGroups with all missing groupName replaced
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
      textElements: textGroup.textElements || []
    };
  });

  // Only one category: add one placeholder category
  if (textGroups.length === 1) {
    newTextGroups[1] = buildPlaceholderCategory(2, l10n);
  }

  return newTextGroups;
}
