// node LogToFile mixin:
// Adds a 'log' method that sends the current time and its argument
// to the file name specified at creation.
// Usage: import
// '<path-to-arslib>/arslib/node/node-log-to-file.js'.
// inside the object you want to add this feature:
// await NodeLogToFile.call(this, '<dataDescription>','<entityName>', [<valueToLog1>,...<valueToLogN>], startRightAway = false)
// it will generate a file called <entityName>_<valueToLog1>..._<valueToLogN>.log in the cwd/log directory
// to log just call
// 'this.log({<valueToLog1>: <value1>,..,<valueToLog1>: <value1>})'
// To start logging you need to call this.startLoggin()
// or call NodeLogToFile with startRightAway = true

import { Assert } from "../../assert.js"; // Corrected path
import { Platform } from "../../platform.js"; // Corrected path
import { Time } from "../../time/time.js";

/**
 * Node.js LogToFile mixin: Adds structured logging to file functionality
 * Creates a log file in cwd/log directory with timestamped entries
 * @this {object} The object to which logging functionality will be added.
 * @param {string} entityName - Name identifier for the entity being logged
 * @param {string} dataDescription - Description of the data being logged
 * @param {string[]} valuesToLog - Array of property names to log
 * @param {boolean} [startRightAway=false] - Whether to start logging immediately (default: false)
 * @example
 * // Usage: import { NodeLogToFile } from '<path-to-arslib>/arslib/node/mixins/node-log-to-file.js';
 * // inside the object you want to add this feature:
 * // await NodeLogToFile.call(thisObject, 'entityName', 'dataDescription', ['valueToLog1', 'valueToLogN'], false);
 * // to log just call 'thisObject.log({valueToLog1: value1, valueToLogN: valueN})'
 * // To start logging you need to call thisObject.enableLog() or apply the mixin with startRightAway = true
 */
async function NodeLogToFile(
  entityName,
  dataDescription,
  valuesToLog,
  startRightAway = false,
) {
  if (!Platform.isNode()) {
    // console.warn("NodeLogToFile: Mixin applied in a non-Node.js environment. Logging will be disabled.");
    this.enableLog = () => {
      /* console.warn("NodeLogToFile: Logging not available in this environment."); */
    };
    this.disableLog = () => {};
    this.log = () => {
      /* console.warn("NodeLogToFile: Logging not available in this environment."); */
    };
    return;
  }

  const { default: fs } = await import("fs");
  const { default: path } = await import("path"); // For robust path joining

  Assert.assertIsString(
    entityName,
    "Error: entityName is required for the log file name.",
  );
  Assert.assertIsString(
    dataDescription,
    "Error: dataDescription is required to create the file header.",
  );
  Assert.assertIsArray(
    valuesToLog,
    "Error: valuesToLog (array of property names) is required.",
  );

  let enabled = startRightAway;
  let descriptionHeader = "time";
  let valuesToLogFilenamePart = "";
  for (let valueToLog of valuesToLog) {
    valuesToLogFilenamePart += "_" + valueToLog;
    descriptionHeader += "\\t" + valueToLog;
  }
  descriptionHeader += "\\n";

  const logDir = "./log";
  let fileToLog;

  try {
    // Ensure log directory exists
    if (!fs.existsSync(logDir)) {
      await fs.promises.mkdir(logDir, { recursive: true });
    }

    const fileName = `${entityName}_${dataDescription}${valuesToLogFilenamePart}.txt`;
    fileToLog = path.join(logDir, fileName);

    // Create/truncate file with header
    await fs.promises.writeFile(fileToLog, descriptionHeader);
  } catch (err) {
    console.error(
      `NodeLogToFile: Error initializing log file '${fileToLog || "unknown"}':`,
      err,
    );
    // Define no-op methods if setup fails
    this.enableLog = () =>
      console.error("NodeLogToFile: Logging disabled due to setup error.");
    this.disableLog = () => {};
    this.log = () =>
      console.error("NodeLogToFile: Logging disabled due to setup error.");
    return;
  }

  // *** INTERFACE ***
  this.enableLog = () => {
    enabled = true;
  };

  this.disableLog = () => {
    enabled = false;
  };

  this.log = (values) => {
    if (!enabled) return;
    Assert.assertIsObject(
      values,
      "Error: log needs an object to register values.",
    );
    Assert.assertHasProperties(
      values,
      valuesToLog,
      "Error: One or more specified valuesToLog are missing from the provided log data object.",
    );
    let dataLine = "";
    for (let valueToLog of valuesToLog) {
      dataLine +=
        "\\t" +
        (values[valueToLog] !== undefined ? values[valueToLog] : "undefined");
    }
    try {
      fs.appendFileSync(fileToLog, `${Time.currentTime()}${dataLine} \\n`);
    } catch (err) {
      console.error(
        `NodeLogToFile: Error appending to log file '${fileToLog}':`,
        err,
      );
      // Optionally disable logging or handle error
    }
  };
}
export { NodeLogToFile };
