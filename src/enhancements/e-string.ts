

export class EString {
/**
 * Capitalizes the first character of a string
 * @param {string} string - The string to capitalize
 * @returns {string} The string with first character capitalized
 */
  static capitalize = (string: any) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

/**
 * Replaces all occurrences of a search string with a replacement string
 * @param {string} string - The original string
 * @param {string} search - The substring to search for
 * @param {string} replacement - The string to replace occurrences with
 * @returns {string} The string with all occurrences replaced
 */
  static replaceAll = (string: any, search: any, replacement: any) =>
  string.split(search).join(replacement);

/**
 * Creates a simple hash from a string using a basic hash algorithm
 * @param {string} string - The string to hash
 * @returns {string} A hash string representation of the input
 */
  static createHash = (string: any) => {
  var hash = 0,
    stringSize = string.length,
    counter = 0;
  if (stringSize <= 0) return "0";
  while (counter < stringSize)
    hash = ((hash << 5) - hash + string.charCodeAt(counter++)) | 0;
  return hash.toString();
};


}
