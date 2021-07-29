/**
 * Use with care.
 * Does not work with the following types:
 * Dates, functions, undefined, Infinity, RegExps, Maps, Sets, Blobs, FileLists, ImageDatas, sparse Arrays, Typed Arrays or other complex types
 * @param {any} item item to copy
 * @returns {any} deep copy of the item
 */
export default function deepCopy(item) {
  return JSON.parse(JSON.stringify(item));
}
