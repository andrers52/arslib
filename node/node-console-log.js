// Override console.log in node to (also) write to 'log.txt' file
// Usage: import '<path-to-arslib>/arslib/node/node-console-log.js'.
// just import it and use console.log() normally,
// after that everything logged will also be sent to a 'log.txt'.
// Also, the 'log.txt' file is recreated everytime the program is run.

import { Time } from "../time/time.js";
import { Platform } from "../util/platform.js";

function NodeConsoleLog() {
  if (!Platform.isNode()) {
    console.log("These functions only work in Node");
    return;
  }

  const fs = require("fs");

  let fileToLog = "log.txt";
  let oldConsoleLog = console.log;

  // create file
  fs.writeFile(fileToLog, "---- Log start ---", (err) => {
    if (err) oldConsoleLog.log(err);
  });

  console.log = (text) => {
    fs.appendFileSync(
      fileToLog,
      `${Time.dateAs_yyyy_mm_dd_hh_mm_ss()} ${Time.currentTime()} ${text} \n`,
      (err) => {
        if (err) oldConsoleLog.log(err);
      },
    );
    oldConsoleLog(text);
  };
}
NodeConsoleLog();

export { NodeConsoleLog };
