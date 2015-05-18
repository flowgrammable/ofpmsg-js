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

function Builder(version) {
  this.version = version || null;
  this.header  = null;
  this.payload = null;
}

Builder.prototype.recv = function(view) {
  if(this.header === null && view.available(hdr.bytes())) {
    this.header = hdr.fromView(view);
    this.variant = makePayload(this.version || this.header.version);
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
