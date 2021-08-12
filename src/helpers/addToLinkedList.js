/**
 * Adds item to linked list in the second last position
 * @param {object} linkedList Linked list
 * @param {any} item Item to be added to the list
 * @param {any} lastItem Last item in the list
 * @returns {object} Updated linked list
 */
export default function addToLinkedList(linkedList, item, lastItem) {
  const secondLast = linkedList[lastItem][0];
  linkedList[secondLast][1] = item;
  linkedList[lastItem][0] = item;
  linkedList[item] = [secondLast, lastItem];
  return linkedList;
}
