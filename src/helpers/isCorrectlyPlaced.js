export default function isCorrectlyPlaced(textItemId, categoryId) {
  return parseInt(textItemId[0]) === categoryId;
}
