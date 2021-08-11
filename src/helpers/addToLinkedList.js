/**
 * Adds item to linked list in the second last position
 * @param {Object} linkedList Linked list
 * @param {} item Item to be added to the list
 * @param {} lastItem Last item in the list
 * @returns {Object} Updated linked list
 */
export default function addToLinkedList(linkedList, item, lastItem) {
  const secondLast = linkedList[lastItem][0];
  linkedList[secondLast][1] = item;
  linkedList[lastItem][0] = item;
  linkedList[item] = [secondLast, lastItem];
  return linkedList;
}
