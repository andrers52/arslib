import { Assert } from "../assert.js";

/**
 * Utility class for HTTP communication with JSON APIs
 */
class CommUtil {
  /**
   * Communicates with a server endpoint using fetch API
   * @param {string} address - The endpoint address/URL
   * @param {string} method - HTTP method ('GET', 'POST', 'PUT', 'DELETE', etc.)
   * @param {Object} body - Request body object (will be JSON stringified)
   * @returns {Promise<any>} Promise that resolves with response data or rejects with error message
   * @throws {string} Throws error message if response status indicates failure
   * @example
   * // CommUtil.communicate('/user/login', 'POST', userInfo)
   * // .then(data => console.log(data))
   * // .catch(message => console.log(message))
   */
  // Usage example:
  // CommUtil.communicate('/user/login', 'POST', userInfo)
  // .then(data => console.log(data))
  // .catch(message => console.log(message))
  async communicate(address, method, body) {
    Assert.assert(CommUtil._server_address, "No server address defined");
    const request = new Request(`${address}`, {
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
  }
}

export { CommUtil };
