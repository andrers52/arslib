// node LogToFile mixin:
// Adds a 'log' method that sends the current time and its argument
// to the file name specified at creation.
// Usage: import
// '<path-to-arslib>/arslib/node/node-log-to-file.js'.
// inside the object you want to add this feature:
// NodeLogToFile.call(this, '<dataDescription>','<entityName>', [<valueToLog1>,...<valueToLogN>], startRightAway = false)
// it will generate a file called <entityName>_<valueToLog1>..._<valueToLogN>.log in the cwd/log directory
// to log just call 
// 'this.log({<valueToLog1>: <value1>,..,<valueToLog1>: <value1>})'
// To start logging you need to call this.startLoggin()
// or call NodeLogToFile with startRightAway = true

import fs from 'fs'
import Assert from '../../util/assert.js'
import Platform from '../../util/platform.js'
import Time from '../../time/time.js'

function NodeLogToFile (entityName, dataDescription, valuesToLog, startRightAway = false) {
  Assert.assert(entityName, 'Error: Entity name is required to create the file')
  Assert.assertIsString(dataDescription, 'Error: dataDescription is required to create the file')

  Assert.assertIsArray(valuesToLog, 'Error: Values to log names are required to create the file')
  Assert.assert(Platform.isNode(), 'This mixin only works in Node')

  let enabled = startRightAway
  let descriptionLine = 'time'
  let valuesToLogStr = ''
  for(let valueToLog of valuesToLog) {
    valuesToLogStr += '_' + valueToLog
    descriptionLine += '\t' + valueToLog
  }
  descriptionLine += '\n'

  let fileToLog = `./log/${entityName}_${dataDescription}${valuesToLogStr}.txt`

  
  // create file
  fs.writeFile(fileToLog, descriptionLine, (err) => {
    if (err) console.log(err)
  })

  // *** INTERFACE ***
  this.enableLog = () => {enabled = true}
  this.disableLog = () => {enabled = false}
  this.log = (values) => {
    if(!enabled) return
    Assert.assertIsObject(values, 'Error: log needs an object to register')
    Assert.assertHasProperties(
      values,
      valuesToLog,
      'Error: value missing')
    let dataLine = ''
    for(let valueToLog of valuesToLog) {
      dataLine += '\t' + values[valueToLog]
    }
    fs.appendFileSync(fileToLog, `${Time.currentTime()}${dataLine} \n`, (err) => {
      if (err) console.log(err)
    })
  }
}

export {NodeLogToFile as default}
export {NodeLogToFile}
