'use strict'

var Platform = {}

Platform.isNode = () => {
  return typeof global !== 'undefined'
}

export default Platform
