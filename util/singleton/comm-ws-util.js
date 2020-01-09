import Assert from '../assert.js'


// Usage
// import CommWSUtil
// CommWSUtil.start(<communicatingObject>, <info>, <serverAddr>)
// send message: remoteCall(object, method, ...args) 
// receive data: CommWSUtil will call <communicatingObject> methods based on the message received
// Notes: address is in the form // 'ws://localhost:3000/' , or wss

// 
const AUTOMATIC_RECONNECT_TIME = 10000
class CommWSUtil {


  static start(
    communicatingObject, 
    info, 
    serverAddr,
    autoReconnect = false) {
    CommWSUtil._serverAddr = serverAddr
    CommWSUtil._communicatingObject = communicatingObject
    CommWSUtil._autoReconnect = autoReconnect

    CommWSUtil.socket = new WebSocket(serverAddr)
    CommWSUtil.socket.onopen = () => { CommWSUtil.sendStatus(info) }

    CommWSUtil.socket.onclose = () => { 
      if(!CommWSUtil._autoReconnect) return
      
      console.log('Connection lost. Trying to reconnect...')
      setTimeout(
        () => {
          CommWSUtil.start(communicatingObject, info, serverAddr, true)
        },
        AUTOMATIC_RECONNECT_TIME)

    }
    

    CommWSUtil.socket.onmessage = function (message) {
      let data = JSON.parse(message.data)
      Assert.assertHasProperties(data, ['messageType', 'method','args'])
      Assert.assertIsEqual(data.messageType, 'remoteCall', 'Unsupported message type')
      Assert.assertIsFunction(CommWSUtil._communicatingObject[data.method])
      Assert.assertIsArray(data.args)
      CommWSUtil._communicatingObject[data.method](...data.args)
    }
  }
  static end() {
    CommWSUtil._autoReconnect = false //if end has been called, should not reconnect
    CommWSUtil.socket.close()
  }

  static sendStatus(info) {
    CommWSUtil.socket && CommWSUtil.socket.send(JSON.stringify({
      messageType: 'status',
      info
    }))
  }

  //call a method on a remotelly connected client with a given user name
  static remoteCallConnectedUserByUserName(userName, method, ...args) {
    Assert.assert(method.charAt(0) !== '_', 'Cannot call private methods')
    CommWSUtil.socket.send(JSON.stringify({
      messageType: 'remoteCallConnectedUserByUserName',
      userName,
      method,
      args
    }))
  }

  static remoteCall(object, method, ...args) {
    Assert.assert(method.charAt(0) !== '_', 'Cannot call private methods')
    CommWSUtil.socket.send(JSON.stringify({
      messageType: 'remoteCall',
      object,
      method,
      args
    }))
  }
}

export {CommWSUtil as default}
export {CommWSUtil}
