"use strict";

var Platform = {};

Platform.isNode = () => {
  return typeof global !== "undefined";
};

Platform.isBrowser = () => {
  return (
    typeof window !== "undefined" && typeof window.document !== "undefined"
  );
};

Platform.isWorker = () => {
  return (
    typeof self !== "undefined" &&
    typeof self.postMessage === "function" &&
    !Platform.isBrowser() && // Workers are not full browser environments
    !Platform.isNode()
  );
};

export { Platform };
