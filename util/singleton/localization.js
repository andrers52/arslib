// Usage:
// import Localization, {setDefaultLanguage} from '<path-to_Localization.js>/Localization.js'
"use strict";

import { Assert } from "../assert.js";

let languagesToIndex = { dev: 0, "en-US": 1, "pt-BR": 2 };

/**
 * Creates a localized object with translated strings based on the specified language
 * @param {string} language - Language code, must be one of: 'dev', 'en-US', 'pt-BR'
 * @param {Object.<string, string[]>} symbols - Object mapping symbol keys to arrays of localized strings
 * The localized array must be in the order defined by 'languagesToIndex': [dev, en-US, pt-BR]
 * @returns {Object.<string, string>} Object with the same keys but values translated to the specified language
 * @example
 * // symbols format: {symbol_to_localize: ['symbol_dev', 'Localized symbol', 'Símbolo com localização']}
 */
// symbols format example: {symbol_to_localize: 'symbol_dev', 'Localized symbol', 'Símbolo com localização'}
// The localized array must be in the order defined by 'languagesToIndex' defined above
function Localization(language, symbols) {
  Assert.assertIsValidString(
    language,
    Object.keys(languagesToIndex),
    "Error: Language must be one of {$languagesToIndex}",
  );
  Assert.assertIsObject(
    symbols,
    "Error: symbols is an object that associates tokens with localized strings",
  );

  const index = languagesToIndex[language];
  let result = {};
  for (let property in symbols) {
    result[property] = symbols[property][index];
  }
  return result;
}

/**
 * Determines the default language based on environment and browser settings
 * @param {string} environment - Environment type ('dev' for development, other values for production)
 * @returns {string} Language code - 'dev' for development, 'pt-BR' for Portuguese (Brazil), 'en-US' for English (default)
 */
export function setDefaultLanguage(environment) {
  try {
    return environment === "dev"
      ? "dev"
      : navigator && (navigator.language || navigator.userLanguage) === "pt-BR"
      ? "pt-BR"
      : "en-US"; // ['pt-BR', 'en-US']
  } catch (e) {
    // We are in Node. It doesn't matter the language, we'll need to communicate in the
    // client's language.
    return "en-US";
  }
}

export { Localization };
