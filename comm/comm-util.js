import { Assert } from "../assert.js";

// Usage
// const commUtil = new CommUtil();
// commUtil.communicate('/user/login', 'POST', userInfo)
//   .then(data => console.log(data))
//   .catch(message => console.log(message))

/**
 * CommUtil constructor - Creates an HTTP communication utility
 * @constructor
 */
function CommUtil() {
  // Private variables
  let serverAddress = null;

  /**
   * Sets the server address for communication
   * @param {string} address - The server address/URL
   */
  this.setServerAddress = function(address) {
    serverAddress = address;
  };

  /**
   * Gets the current server address
   * @returns {string|null} The server address or null if not set
   */
  this.getServerAddress = function() {
    return serverAddress;
  };

  /**
   * Communicates with a server endpoint using fetch API
   * @param {string} address - The endpoint address/URL
   * @param {string} method - HTTP method ('GET', 'POST', 'PUT', 'DELETE', etc.)
   * @param {Object} body - Request body object (will be JSON stringified)
   * @returns {Promise<any>} Promise that resolves with response data or rejects with error message
   * @throws {string} Throws error message if response status indicates failure
   */
  this.communicate = async function(address, method, body) {
    Assert.assert(serverAddress, "No server address defined. Use setServerAddress() first.");
    const request = new Request(`${serverAddress}${address}`, {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    // only proceed once promise is resolved
    const response = await fetch(request);

    // only proceed once second promise is resolved
    const result = await response.json();
    if (response.status < 200 || response.status >= 300) {
      throw result.message;
    }
    return result.data;
  };
}

export { CommUtil };
