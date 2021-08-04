/**
 * Checks if a textItem is placed in the correct category
 * @param {string} textItemId id of the textItem on the format "CX" where C is the categoryId and X is a serial number
 * @param {number} categoryId id of the category
 * @returns {boolean} true if the textItem is placed correctly, false otherwise
 */
export default function isCorrectlyPlaced(textItemId, categoryId) {
  return parseInt(textItemId[0]) === categoryId;
}
