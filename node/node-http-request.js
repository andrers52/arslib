// Usage:
// var params = {
//   host: '127.0.0.1',
//   port: 4000,
//   method: 'GET',
//   path: '/api/v1/service'
// };
// // this is a get, so there's no post data

// promisifiedHttpRequest(params).then(function(body) {
//   console.log(body);
// });

// And these promises can be chained, too...

// promisifiedHttpRequest(params).then(function(body) {
//   console.log(body);
//   return promisifiedHttpRequest(otherParams);
// }).then(function(body) {
//   console.log(body);
//   // and so on
// });

import http from 'http'
import https from 'https'

import Assert from '../util/assert.js'
import Platform from '../util/platform.js'

Assert.assert(Platform.isNode(), 'These functions only work in Node')

var NodeHttpRequest = {}

NodeHttpRequest.promisifiedHttpRequest = (params, postData, useHttps = false) => {
  return new Promise(function(resolve, reject) {
    let libToCall = (useHttps)? https : http
    var req = libToCall.request(params, function(res) {
      // reject on bad status
      if (res.statusCode < 200 || res.statusCode >= 300) {
        return reject(new Error('statusCode=' + res.statusCode))
      }
      // cumulate data
      var body = []
      res.on('data', function(chunk) {
        body.push(chunk)
      })
      // resolve on end
      res.on('end', function() {
        try {
          body = JSON.parse(Buffer.concat(body).toString())
        } catch(e) {
          reject(e)
        }
        resolve(body)
      })
    })
    // reject on request error
    req.on('error', function(err) {
      // This is not a "Second reject", just a different sort of failure
      reject(err)
    })
    if (postData) {
      req.write(postData)
    }
    // IMPORTANT
    req.end()
  })
}


// Simpler function, just to get data from url
// There is not a single external dependency included. Usage is then rather simple, due to Promise interface:

// getContent('https://www.random.org/integers/?num=1&min=1&max=100&col=1&base=10&format=plain&rnd=new')
//   .then((html) => console.log(html))
//   .catch((err) => console.error(err));

NodeHttpRequest.getContent = (url) => {
  // return new pending promise
  return new Promise((resolve, reject) => {
    // select http or https module, depending on reqested url
    const lib = url.startsWith('https') ? https : http
    const request = lib.get(url, (response) => {
      // handle http errors
      if (response.statusCode < 200 || response.statusCode > 299) {
        console.log(response)
        reject(new Error('Failed to load page, status code: ' + response.statusCode))
      }
      // temporary data holder
      const body = []
      // on every content chunk, push it to the data array
      response.on('data', (chunk) => body.push(chunk))
      // we are done, resolve promise with those joined chunks
      response.on('end', () => resolve(body.join('')))
    })
    // handle connection errors of the request
    request.on('error', (err) => reject(err))
  })
}

export {NodeHttpRequest as default}
export {NodeHttpRequest}