(function() {

'use strict';

var _    = require('underscore');
var util = require('./util');
var hdr  = require('./header');

var VERSION     = 1;
exports.VERSION = VERSION;

function Hello() {
  util.Data.call(this);
}
Hello.prototype             = Object.create(util.Data.prototype);
Hello.prototype.constructor = Hello;
exports.Hello               = Hello;

function Error() {
  util.Data.call(this);

  this.type = null;
  this.code = null;
}
Error.prototype             = Object.create(util.Data.prototype);
Error.prototype.constructor = Error;
exports.Error               = Error;

Error.prototype.bytes = function() {
  return 4 + util.Data.bytes.call(this);
};

Error.prototype.toView = function(view) {
  if(!view.available(this.bytes())) {
    throw util.Available('Error');
  }

  view.writeUInt16(this.type);
  view.writeUInt16(this.code);
  util.Data.toView.call(this, view);
};

Error.prototype.fromView = function(view) {
  if(!view.available(this.bytes())) {
    throw util.Available('Error');
  }

  this.type = view.readUInt16();
  this.code = view.readUInt16();
  util.Data.fromView.call(this, view);
};

function EchoReq() {
  util.Data.call(this);
}
EchoReq.prototype             = Object.create(util.Data.prototype);
EchoReq.prototype.constructor = EchoReq;
exports.EchoReq               = EchoReq;

function EchoRes() {
  util.Data.call(this);
}
EchoRes.prototype             = Object.create(util.Data.prototype);
EchoRes.prototype.constructor = EchoRes;
exports.EchoRes               = EchoRes;

function Vendor() {
  this.id = null;
}
Vendor.prototype             = Object.create(util.Payload.prototype);
Vendor.prototype.constructor = Vendor;
exports.Vendor               = Vendor;

Vendor.prototype.bytes = function() {
  return 4 + util.Data.bytes.call(this);
};

Vendor.prototype.toView = function(view) {
  if(!view.available(this.bytes())) {
    throw util.Available('Vendor');
  }

  view.writeUInt32(this.id);
  util.Data.toView.call(this);
};

Vendor.prototype.fromView = function(view) {
  if(!view.available(this.bytes())) {
    throw util.Available('Vendor');
  }

  this.id = view.readUInt32();
  util.Data.fromView.call(this);
};

var Type = {
  "0": Hello,
  "1": Error,
  "2": EchoReq,
  "3": EchoRes,
  "4": Vendor
};
exports.Type = Type;

exports.Payload = util.Variant(Type);

})();
