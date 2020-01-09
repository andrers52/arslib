'use strict'
//http://www.tutorialspoint.com/html5/html5_indexeddb.htm

function FileStore () {

  if(!window.indexedDB) {
    window.indexedDB = window.webkitIndexedDB || window.mozIndexedDB || window.OIndexedDB || window.msIndexedDB 
  }
  window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.OIDBTransaction || window.msIDBTransaction
  window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange
  let dbVersion = 1

  this.isAvailable = function() {
    return !(!window.indexedDB)
  }

  // Create/open database
  var request = indexedDB.open('mimiFiles', dbVersion)
  
  request.onerror = function(event) {
    console.log('error: ' + event)
  }
 
  request.onsuccess = function() {
    db = request.result
    console.log('success: '+ db)
  }  
  
  let db
  let createObjectStore = function (dataBase) {
    // Create an objectStore
    console.log('Creating objectStore')
    dataBase.createObjectStore('mimi')
  }
    
  request.onupgradeneeded = function (event) {
    createObjectStore(event.target.result)
  }


  this.putFile = function (identifier, blob, successCalback, errorCallback) {

    // Open a transaction to the database
    var transaction = db.transaction(['mimi'], window.IDBTransaction.WRITE)
    transaction.onsuccess = successCalback
    transaction.onerror = errorCallback
    // Put blob into dabase
    transaction.objectStore('mimi').put(blob, identifier)
  }    

  this.getFile = function(identifier, successCallback, errorCallback) {

    // Open a transaction to the database
    var transaction = db.transaction(['mimi'], window.IDBTransaction.READ)
    transaction.onsuccess = event => { successCallback(event.target.result)  }
    transaction.onerror = errorCallback
    //retrieve blob
    transaction.objectStore('mimi').get(identifier)

  }
    
}

export {FileStore as default}
export {FileStore}
