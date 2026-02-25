

export class Platform {
  static isNode = () => {
  return typeof global !== "undefined" && typeof window === "undefined";
};

  static isBrowser = () => {
  return (
    typeof window !== "undefined" && typeof window.document !== "undefined"
  );
};

  static isWorker = () => {
  return (
    typeof self !== "undefined" &&
    typeof self.postMessage === "function" &&
    !Platform.isBrowser() && // Workers are not full browser environments
    !Platform.isNode()
  );
};


}
