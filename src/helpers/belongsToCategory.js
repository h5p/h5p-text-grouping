/**
 * Checks if a textItem belongs to a category based on their ids
 * @param {string} textItemId id of the textItem on the format "CX" where C is the categoryId and X is a serial number
 * @param {number} categoryId id of the category
 * @returns {boolean} true if textItemId matches the categoryId, false otherwise
 */
export default function belongsToCategory(textItemId, categoryId) {
  return parseInt(textItemId[0]) === categoryId;
}
