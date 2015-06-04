(function() {

'use strict';

var _    = require('underscore');
var util = require('./util');

var hdr     = require('./header');
var version = require('./versions');

function makePayload(ver) {
  var mod = _(version.Version).find(function(value) {
    return ver === value.VERSION.value();
  });
  if(mod === undefined) {
    // Return an empty variant
    return util.Variant({});
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
    this.header = hdr.Header({
      version: this.payload.VERSION,
      type:    this.payload.Type,
      length:  hdr.bytes().plus(this.payload.bytes())
    });
  } else if(this.header === null) {
    this.header = hdr.Header();
  }
}

exports.Message = function(args) {
  return new Message(args);
};

Message.prototype.bytes = function() {
  if(this.payload){
    return this.header.bytes().plus(this.payload.bytes());
  } else {
    return this.header.bytes();
  }
};

Message.prototype.toView = function(view) {
  this.header.toView(view);
  this.payload.toView(view);
  return this;
};

Message.prototype.fromView = function(view, version) {
  this.header.fromView(view);
  var variant       = makePayload(version || this.header.version.value())();
  var payloadLength = this.header.length.value() - 8;
  this.payload      = variant(this.header.type, view.constrain(payloadLength));
  return this;
};

exports.fromView = function(view, version) {
  return (new Message()).fromView(view, version);
};

})();
