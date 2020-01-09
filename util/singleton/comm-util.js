import Assert from '../assert.js'
class CommUtil {
  static setServerAddr(serverAddr) {
    CommUtil._server_address = serverAddr
  }
  // Usage example:
  // CommUtil.communicate('/user/login', 'POST', userInfo)
  // .then(data => console.log(data))
  // .catch(message => console.log(message))
  static async communicate(address, method, body) {
    Assert.assert(CommUtil._server_address, 'No server address defined')
    const request =
      new Request(
        `${CommUtil._server_address}${address}`, {
          method: method,
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body)
        }
      )
    // only proceed once promise is resolved
    const response = await fetch(request)

    // only proceed once second promise is resolved
    const result = await response.json()
    if (response.status < 200 || response.status >= 300) {
      throw result.message
    }
    return result.data
  }
}

export {CommUtil as default}
export {CommUtil}
