/**
 * Calculates and returns coordinates of all the edges for each category
 * @param {number} numberOfCategories Total number of categories
 * @param {object} categoryRefs Refs to all categories
 * @returns {object} Object containing coordinates of all edges of all categories
 */
export default function getCategoryEdges(numberOfCategories, categorysRef) {
  const categoryEdges = {};
  for (let i = 0; i < numberOfCategories; i++) {
    // Set all edges to 0 if category does not exist
    if (categorysRef.current[i] === null) {
      categoryEdges[i] = { x1: 0, x2: 0, y1: 0, y2: 0 };
      continue;
    }

    const clientRect = categorysRef.current[i].getBoundingClientRect();
    categoryEdges[i] = {
      x1: clientRect.x,
      x2: clientRect.x + clientRect.width,
      y1: clientRect.y,
      y2: clientRect.y + clientRect.height
    };
  }
  return categoryEdges;
}
