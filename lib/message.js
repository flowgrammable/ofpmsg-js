(function() {

'use strict';

var _    = require('underscore');
var util = require('./util');

var hdr     = require('./header');
var version = require('./versions');

function makePayload(ver) {
  var mod = _(version.Version).find(function(value) {
    return ver === value.VERSION;
  });
  if(mod === null) {
    throw 'Bad version';
  }
  return mod.Payload;
}

function Message(args) {
  this.header  = null;
  this.payload = null;
  if(args) {
    this.payload = args.payload || null;
    this.header  = args.header  || null;
  }
  if(this.header === null && this.payload) {
    this.header = new hdr.Header({
      version: this.payload.VERSION,
      type:    this.payload.Type,
      length:  8 + this.payload.bytes()
    });
  }
}
exports.Message = function(args) {
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
  var variant  = makePayload(version);
  this.payload = variant(type, view);
};

})();
