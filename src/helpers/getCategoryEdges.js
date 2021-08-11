/**
 * Return position of edges for each category
 * @param 
 */
export default function getCategoryEdges(numberOfCategories) {
  const categoryEdges = {};
  for (let i = 0; i < numberOfCategories; i++) {
    // Set all edges to 0 if category does not exist
    if (document.getElementById(`category ${i}`) === null) {
      categoryEdges[i] = { x1: 0, x2: 0, y1: 0, y2: 0 };
      continue;
    }

    const clientRect = document.getElementById(`category ${i}`).getBoundingClientRect();
    categoryEdges[i] = {
      x1: clientRect.x,
      x2: clientRect.x + clientRect.width,
      y1: clientRect.y,
      y2: clientRect.y + clientRect.height
    };
  }
  return categoryEdges;
}
