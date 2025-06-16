import { Assert } from "../assert.js";

// Usage
// const commUtil = new CommWSUtil();
// commUtil.start(<communicatingObject>, <info>, <serverAddr>)
// send message: commUtil.remoteCall(object, method, ...args)
// receive data: CommWSUtil will call <communicatingObject> methods based on the message received
// Notes: address is in the form // 'ws://localhost:3000/' , or wss

/**
 * CommWSUtil constructor - Creates a WebSocket communication utility
 * @constructor
 */
function CommWSUtil() {
  // Private variables
  let socket = null;
  let serverAddr = null;
  let communicatingObject = null;
  let autoReconnect = false;
  const AUTOMATIC_RECONNECT_TIME = 10000;

  /**
   * Handles incoming WebSocket messages (private)
   * @param {MessageEvent} message - The WebSocket message event
   */
  const handleMessage = function (message) {
    let data = JSON.parse(message.data);
    Assert.assertHasProperties(data, ["messageType", "method", "args"]);
    Assert.assertIsEqual(
      data.messageType,
      "remoteCall",
      "Unsupported message type",
    );
    Assert.assertIsFunction(communicatingObject[data.method]);
    Assert.assertIsArray(data.args);
    communicatingObject[data.method](...data.args);
  };

  /**
   * Handles WebSocket connection close (private)
   */
  const handleClose = function () {
    if (!autoReconnect) return;

    console.log("Connection lost. Trying to reconnect...");
    setTimeout(() => {
      startConnection(communicatingObject, null, serverAddr, true);
    }, AUTOMATIC_RECONNECT_TIME);
  };

  /**
   * Starts the WebSocket connection (private)
   * @param {Object} commObj - The communicating object
   * @param {Object} info - Initial status info
   * @param {string} addr - Server address
   * @param {boolean} reconnect - Whether to auto-reconnect
   */
  const startConnection = function (commObj, info, addr, reconnect = false) {
    communicatingObject = commObj;
    serverAddr = addr;
    autoReconnect = reconnect;

    socket = new WebSocket(serverAddr);
    socket.onopen = () => {
      if (info) {
        sendStatus(info);
      }
    };

    socket.onclose = handleClose;
    socket.onmessage = handleMessage;
  };

  /**
   * Sends status information to the server (private)
   * @param {Object} info - Status information
   */
  const sendStatus = function (info) {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({
          messageType: "status",
          info,
        }),
      );
    }
  };

  /**
   * Starts the WebSocket connection
   * @param {Object} communicatingObj - The object that will handle remote calls
   * @param {Object} info - Initial status information
   * @param {string} serverAddress - WebSocket server address
   * @param {boolean} autoReconnectFlag - Whether to automatically reconnect on connection loss
   */
  this.start = function (
    communicatingObj,
    info,
    serverAddress,
    autoReconnectFlag = false,
  ) {
    startConnection(communicatingObj, info, serverAddress, autoReconnectFlag);
  };

  /**
   * Ends the WebSocket connection
   */
  this.end = function () {
    autoReconnect = false; // if end has been called, should not reconnect
    if (socket) {
      socket.close();
    }
  };

  /**
   * Sends status information to the server
   * @param {Object} info - Status information to send
   */
  this.sendStatus = function (info) {
    sendStatus(info);
  };

  /**
   * Call a method on a remotely connected client with a given user name
   * @param {string} userName - The target user name
   * @param {string} method - The method name to call
   * @param {...*} args - Arguments to pass to the method
   */
  this.remoteCallConnectedUserByUserName = function (
    userName,
    method,
    ...args
  ) {
    Assert.assert(method.charAt(0) !== "_", "Cannot call private methods");
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({
          messageType: "remoteCallConnectedUserByUserName",
          userName,
          method,
          args,
        }),
      );
    }
  };

  /**
   * Call a method on a remote object
   * @param {string} object - The target object name
   * @param {string} method - The method name to call
   * @param {...*} args - Arguments to pass to the method
   */
  this.remoteCall = function (object, method, ...args) {
    Assert.assert(method.charAt(0) !== "_", "Cannot call private methods");
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({
          messageType: "remoteCall",
          object,
          method,
          args,
        }),
      );
    }
  };
}

export { CommWSUtil };
