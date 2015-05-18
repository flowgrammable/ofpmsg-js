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
      length:  8 + this.payload.bytes()
    });
  } else if(this.header === null) {
    this.header = hdr.Header();
  }
}
exports.Message = function(args) {
  return new Message(args);
};

Message.prototype.bytes = function() {
  return this.header.bytes() + (this.payload ? this.payload.bytes() : 0);
};

Message.prototype.toView = function(view) {
  this.header.toView(view);
  this.payload.toView(view);
};

Message.prototype.fromView = function(view) {
  this.header.fromView(view);
  var variant  = makePayload(this.header.version);
  var payloadLength = this.header.length - 8;
  this.payload = variant(this.header.type, view.constrain(payloadLength));
};

function Builder() {
  this.header  = null;
  this.payload = null;
}

Builder.prototype.recv = function(view) {
  if(this.header === null && view.available(hdr.bytes())) {
    this.header = hdr.fromView(view);
    this.variant = makePayload(this.header.version);
    this.payloadLength = this.header.length - 8;
  } else if(this.header && view.available(this.payloadLength)) {
    this.payload = this.variant(this.header.type, 
                                view.constrain(this.payloadLength));
    var result = new Message({
      header: this.header,
      payload: this.payload
    });
    this.header  = null;
    this.payload = null;
    return result;
  }
  return null;
};

})();
