/**
 * Reduces an object with string keys based on boolean values into a string used for CSS classes.
 * Classes are separated with space.
 * @example <caption>Example usage of getClassNames.</caption>
 * // returns "yes also-yes"
 * getClassNames({ yes: true, "also-yes": true, nope: false })
 * @param {object} classNames
 * @returns {string} all the classes marked as true, separated by spaces
 */
export default function getClassNames(classNames) {
  return Object.entries(classNames)
    .flatMap((pair) => {
      const [className, included] = pair;
      if (included) {
        return className;
      }
      return [];
    })
    .toString()
    .replaceAll(',', ' ');
}
