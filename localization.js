// Usage:
// import { Localization, setDefaultLanguage } from '<path-to_Localization.js>/Localization.js'
// const localizer = new Localization(language, symbols);
"use strict";

import { Assert } from "./assert.js";

/**
 * Localization constructor - Creates a localized object with translated strings
 * @constructor
 * @param {string} language - Language code, must be one of: 'dev', 'en-US', 'pt-BR'
 * @param {Object.<string, string[]>} symbols - Object mapping symbol keys to arrays of localized strings
 * The localized array must be in the order defined by 'languagesToIndex': [dev, en-US, pt-BR]
 * @example
 * // symbols format: {symbol_to_localize: ['symbol_dev', 'Localized symbol', 'Símbolo com localização']}
 * const localizer = new Localization('en-US', symbols);
 * const localizedStrings = localizer.getLocalizedStrings();
 */
function Localization(language, symbols) {
  // Private variables
  const languagesToIndex = { dev: 0, "en-US": 1, "pt-BR": 2 };
  let currentLanguage = language;
  let localizedStrings = {};

  /**
   * Validates and processes the localization data (private)
   * @param {string} lang - Language code to validate
   * @param {Object} syms - Symbols object to process
   */
  const processLocalization = function (lang, syms) {
    Assert.assertIsValidString(
      lang,
      Object.keys(languagesToIndex),
      "Error: Language must be one of {dev, en-US, pt-BR}",
    );
    Assert.assertIsObject(
      syms,
      "Error: symbols is an object that associates tokens with localized strings",
    );

    const index = languagesToIndex[lang];
    let result = {};
    for (let property in syms) {
      Assert.assertIsArray(
        syms[property],
        `Error: ${property} must be an array of localized strings`,
      );
      Assert.assert(
        syms[property].length >= Object.keys(languagesToIndex).length,
        `Error: ${property} must have translations for all supported languages`,
      );
      result[property] = syms[property][index];
    }
    return result;
  };

  // Initialize localized strings
  localizedStrings = processLocalization(language, symbols);

  /**
   * Gets the current language
   * @returns {string} Current language code
   */
  this.getCurrentLanguage = function () {
    return currentLanguage;
  };

  /**
   * Gets the localized strings object
   * @returns {Object.<string, string>} Object with keys as symbol names and values as localized strings
   */
  this.getLocalizedStrings = function () {
    return { ...localizedStrings }; // Return a copy to prevent external modification
  };

  /**
   * Gets a specific localized string by key
   * @param {string} key - The symbol key to get the localized string for
   * @returns {string} The localized string for the specified key
   */
  this.getString = function (key) {
    Assert.assertIsString(key, "Error: key must be a string");
    Assert.assert(
      localizedStrings.hasOwnProperty(key),
      `Error: key '${key}' not found in localized strings`,
    );
    return localizedStrings[key];
  };

  /**
   * Updates the language and re-processes the symbols
   * @param {string} newLanguage - New language code
   * @param {Object.<string, string[]>} newSymbols - Optional new symbols object
   */
  this.updateLanguage = function (newLanguage, newSymbols = symbols) {
    localizedStrings = processLocalization(newLanguage, newSymbols);
    currentLanguage = newLanguage;
  };

  /**
   * Gets the supported languages
   * @returns {string[]} Array of supported language codes
   */
  this.getSupportedLanguages = function () {
    return Object.keys(languagesToIndex);
  };
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
