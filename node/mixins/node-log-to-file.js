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

import { Time } from "../../time/time.js";
import { Assert } from "../../util/assert.js";
import { Platform } from "../../util/platform.js";

/**
 * Node.js LogToFile mixin: Adds structured logging to file functionality
 * Creates a log file in cwd/log directory with timestamped entries
 * @param {string} entityName - Name identifier for the entity being logged
 * @param {string} dataDescription - Description of the data being logged
 * @param {string[]} valuesToLog - Array of property names to log
 * @param {boolean} startRightAway - Whether to start logging immediately (default: false)
 * @example
 * // Usage: import '<path-to-arslib>/arslib/node/node-log-to-file.js'.
 * // inside the object you want to add this feature:
 * // await NodeLogToFile.call(this, '<dataDescription>','<entityName>', [<valueToLog1>,...<valueToLogN>], startRightAway = false)
 * // it will generate a file called <entityName>_<valueToLog1>..._<valueToLogN>.log in the cwd/log directory
 * // to log just call 'this.log({<valueToLog1>: <value1>,..,<valueToLogN>: <valueN>})'
 * // To start logging you need to call this.startLogging() or call NodeLogToFile with startRightAway = true
 */
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

async function NodeLogToFile(
  entityName,
  dataDescription,
  valuesToLog,
  startRightAway = false,
) {
  if (!Platform.isNode()) {
    console.log("These functions only work in Node");
    return;
  }

  const { default: fs } = await import("fs");

  Assert.assertIsString(
    dataDescription,
    "Error: dataDescription is required to create the file",
  );

  Assert.assertIsArray(
    valuesToLog,
    "Error: Values to log names are required to create the file",
  );
  Assert.assert(Platform.isNode(), "This mixin only works in Node");

  let enabled = startRightAway;
  let descriptionLine = "time";
  let valuesToLogStr = "";
  for (let valueToLog of valuesToLog) {
    valuesToLogStr += "_" + valueToLog;
    descriptionLine += "\t" + valueToLog;
  }
  descriptionLine += "\n";

  let fileToLog = `./log/${entityName}_${dataDescription}${valuesToLogStr}.txt`;

  // create file
  fs.writeFile(fileToLog, descriptionLine, (err) => {
    if (err) console.log(err);
  });

  // *** INTERFACE ***
  this.enableLog = () => {
    enabled = true;
  };
  this.disableLog = () => {
    enabled = false;
  };
  this.log = (values) => {
    if (!enabled) return;
    Assert.assertIsObject(values, "Error: log needs an object to register");
    Assert.assertHasProperties(values, valuesToLog, "Error: value missing");
    let dataLine = "";
    for (let valueToLog of valuesToLog) {
      dataLine += "\t" + values[valueToLog];
    }
    fs.appendFileSync(
      fileToLog,
      `${Time.currentTime()}${dataLine} \n`,
      (err) => {
        if (err) console.log(err);
      },
    );
  };
}
export { NodeLogToFile };
