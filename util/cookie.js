'use strict'
class Cookie {
  static setCookie (name, value, expirationInDays = 10000) {
    var d = new Date()
    d.setTime(d.getTime() + (expirationInDays*24*60*60*1000))
    var expires = 'expires='+d.toUTCString()
    document.cookie = name + '=' + value + '; ' + expires
  }

  static getCookie (name) {
    name = name + '='
    var ca = document.cookie.split(';')
    for(var i = 0; i < ca.length; i++) {
      var c = ca[i]
      while (c.charAt(0) == ' ') {
        c = c.substring(1)
      }
      if (c.indexOf(name) === 0) {
        return c.substring(name.length, c.length)
      }
    }
    return ''
  }

}

export {Cookie as default}
export {Cookie}
