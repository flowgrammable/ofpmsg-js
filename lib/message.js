(function() {

'use strict';

var _    = require('underscore');
var util = require('./util');

var hdr     = require('./header');
var version = require('./versions');

function Message(args) {
  if(args) {
    this.payload = args.payload || null;
    this.header  = args.header  || null;
  }
  if(this.header === null && this.payload) {
    this.header = new hdr.Header({
      version: payload.VERSION,
      type:    payload.Type,
      length:  8 + payload.bytes()
    });
  }
}
module.exports = function(args) {
  return new Message(args);
};

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
