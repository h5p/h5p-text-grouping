export default function getClassNames(classNames) {
  return Object.entries(classNames)
    .filter((pair) => pair[1])
    .map((pair) => pair[0])
    .toString()
    .replaceAll(',', ' ');
}
