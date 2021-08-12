/**
 * Removes item from linked list
 * @param {object} linkedList Linked list
 * @param {any} item Item to be removed from the list
 * @returns {object} Updated linked list
 */
export default function removeFromLinkedList(linkedList, item) {
  const [before, after] = linkedList[item];
  linkedList[before][1] = after;
  linkedList[after][0] = before;
  linkedList[item] = undefined;
  return linkedList;
}
