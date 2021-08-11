/**
 * Checks if mouse is inside a category
 * @param {number} categoryId Index of the category checked
 * @param {object} mouseCoordinates Coordinates of the mouse in the format {x, y}
 * @param {number[]} categoryEdges Coordinates of edges of category
 * @returns {boolean} true if mouse is inside the category, false otherwise
 */
export default function checkIfInsideCategory(categoryId, mouseCoordinates, categoryEdges) {
  const { x1, x2, y1, y2 } = categoryEdges[categoryId];
  return (
    x1 <= mouseCoordinates.x &&
    mouseCoordinates.x <= x2 &&
    y1 <= mouseCoordinates.y &&
    mouseCoordinates.y <= y2
  );
}
