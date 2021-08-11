
/**
 * Converts a doubly linked list to an array
 * Does not include the first and last items in the linked list
 * @param {Object} linkedList The linked list that is to be converted
 * @param {} firstItem First item in the linked list
 * @param {} lastItem Last item in the linked list
 * @returns @param {Array} array Array with the contents of the linked list
 */
export default function convertLinkedListToArray(linkedList, firstItem, lastItem) {
  const array = [];
  let item = linkedList[firstItem];
  while (item[1] !== lastItem) {
    array.push(item[1]);
    item = linkedList[item[1]];
  }
  return array;
}
