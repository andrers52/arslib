// Usage:
// import Localization, {setDefaultLanguage} from '<path-to_Localization.js>/Localization.js'
'use strict'

import Assert from '../assert.js'

let languagesToIndex = {'dev': 0,'en-US': 1,'pt-BR': 2}

// symbols format example: {symbol_to_localize: 'symbol_dev', 'Localized symbol', 'Símbolo com localização'}
// The localized array must be in the order defined by 'languagesToIndex' defined above
function Localization (language, symbols) {
  Assert.assertIsValidString(
    language,
    Object.keys(languagesToIndex),
    'Error: Language must be one of {$languagesToIndex}')
  Assert.assertIsObject(
    symbols,
    'Error: symbols is an object that associates tokens with localized strings')
  
  const index = languagesToIndex[language]
  let result = {}
  for (let property in symbols) {
    result[property] = symbols[property][index]
  }
  return result
}

export function setDefaultLanguage (environment) {
  try {
    return (environment === 'dev') ?
      'dev' :
      (navigator && (navigator.language || navigator.userLanguage) === 'pt-BR') ?
        'pt-BR' :
        'en-US' // ['pt-BR', 'en-US']
  } catch (e) {
    // We are in Node. It doesn't matter the language, we'll need to communicate in the
    // client's language.
    return 'en-US'
  }
}

export {Localization as default}
export {Localization}
