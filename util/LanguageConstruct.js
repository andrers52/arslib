
import Assert from './assert.js'
import EArray from '../enhancements/e-array.js'

var LanguageConstruct = {}

// Call format: LanguageConstruct.probabilitySwitch(func1, prob1, func2, prob2,..., funcN, probN)
// Returns result of selected function
LanguageConstruct.probabilitySwitch = function(...functionsAndProbabilities) {
  Assert.assertIsArray(functionsAndProbabilities)
  Assert.assert(functionsAndProbabilities.length%2===0, 'Expecting an even number of parameters')
  
  let functions = []
  let probabilities = []
  for (var i=0;i<functionsAndProbabilities.length;i++)
    (((i+2)%2===0)? functions : probabilities)
      .push(functionsAndProbabilities[i])
  
  functions.forEach(func => Assert.assertIsFunction(func, 'Expected (func1, prob1, func2, prob2,..., funcN, probN)'))
  probabilities.forEach(prob => Assert.assertIsNumber(prob, 'Expected (func1, prob1, func2, prob2,..., funcN, probN)'))

  //let probabilitiesSum = probabilities.reduce((sum, value) => sum + value, 0);
  //Assert.assert(probabilitiesSum, 'Probability sum must be 1');

  return EArray.choiceWithProbabilities(functions, probabilities)()
}

export default LanguageConstruct