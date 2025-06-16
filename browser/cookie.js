"use strict";

import { Platform } from "../platform.js";

/**
 * Utility for browser cookie management
 */
let Cookie = {};

if (!Platform.isNode()) {
  /**
   * Sets a cookie with specified name, value, and expiration
   * @param {string} name - Cookie name
   * @param {string} value - Cookie value
   * @param {number} expirationInDays - Number of days until cookie expires (default: 10000)
   */
  Cookie.setCookie = function (name, value, expirationInDays = 10000) {
    var d = new Date();
    d.setTime(d.getTime() + expirationInDays * 24 * 60 * 60 * 1000);
    var expires = "expires=" + d.toUTCString();
    document.cookie = name + "=" + value + "; " + expires;
  };

  /**
   * Retrieves a cookie value by name
   * @param {string} name - Cookie name to retrieve
   * @returns {string} Cookie value, or empty string if not found
   */
  Cookie.getCookie = function (name) {
    name = name + "=";
    var ca = document.cookie.split(";");
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == " ") {
        c = c.substring(1);
      }
      if (c.indexOf(name) === 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  };
}

export { Cookie };
