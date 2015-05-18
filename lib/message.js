(function() {

'use strict';

var _    = require('underscore');
var util = require('./util');

var hdr     = require('./header');
var version = require('./version');

function Message(payload) {
  this.payload = payload || null;
  this.header  = null;
  if(this.payload) {
    this.header = new hdr.Header({
      version: payload.version,
      type: payload.type,
      length: 8 + payload.bytes();
    });
  } 
}
module.exports = Message;

Message.prototype.bytes = function() {
  return this.header.bytes() + this.payload.bytes();
};

Message.prototype.toView = function(view) {
  this.header.toView(view);
  this.payload.toView(view);
};

Message.prototype.fromView = function(view) {
  this.header.fromView(view);
  var variant  = version.makePayload(version);
  this.payload = variant(type, view);
};

})();
