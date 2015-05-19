(function() {

'use strict';

var _    = require('underscore');
var util = require('./util');
var msg = require('./message');

var VERSION     = 1;
exports.VERSION = VERSION;

function Hello(data) {
  this.VERSION = VERSION;
  this.Type    = Hello.Type;
  util.Data.call(this, data);
}
Hello.Type = 0;
Hello.prototype             = Object.create(util.Data.prototype);
Hello.prototype.constructor = Hello;

exports.Hello = function(data) { 
  return msg.Message({ payload: new Hello(data) });
};

function Error(type, code, data) {
  this.VERSION = VERSION;
  this.Type    = Error.Type;
  util.Data.call(this, data);

  this.type = type || null;
  this.code = code || null;
}
Error.Type = 1;
Error.prototype             = Object.create(util.Data.prototype);
Error.prototype.constructor = Error;

exports.Error = function(args) {
  var data = null;
  var type = null;
  var code = null;
  if(args) {
    type = args.type || null;
    code = args.code || null;
  }
  return msg.Message({ payload: new Error(type, code, data) });
};

Error.prototype.bytes = function() {
  return 4 + util.Data.prototype.bytes.call(this);
};

Error.prototype.toView = function(view) {
  if(!view.available(this.bytes())) {
    throw util.Available('Error');
  }

  view.writeUInt16(this.type);
  view.writeUInt16(this.code);
  util.Data.prototype.toView.call(this, view);
};

Error.prototype.fromView = function(view) {
  if(!view.available(this.bytes())) {
    throw util.Available('Error');
  }

  this.type = view.readUInt16();
  this.code = view.readUInt16();
  util.Data.prototype.fromView.call(this, view);
};

function EchoReq(data) {
  this.VERSION = VERSION;
  this.Type    = EchoReq.Type;
  util.Data.call(this, data);
}
EchoReq.Type = 2;
EchoReq.prototype             = Object.create(util.Data.prototype);
EchoReq.prototype.constructor = EchoReq;

exports.EchoReq = function(data) {
  return msg.Message({ payload: new EchoReq(data) });
};

function EchoRes(data) {
  this.VERSION = VERSION;
  this.Type    = EchoRes.Type;
  util.Data.call(this, data);
}
EchoRes.Type = 3;
EchoRes.prototype             = Object.create(util.Data.prototype);
EchoRes.prototype.constructor = EchoRes;

exports.EchoRes = function(data) {
  return msg.Message({ payload: new EchoRes(data) });
};

function Vendor(id, data) {
  this.VERSION = VERSION;
  this.Type    = Vendor.Type;
  util.Data.call(this, data);
  this.id = id || null;
}
Vendor.Type = 4;
Vendor.prototype             = Object.create(util.Data.prototype);
Vendor.prototype.constructor = Vendor;

exports.Vendor = function(args) {
  var id = null;
  var data = null;
  if(args) {
    id = args.id     || null;
    data = args.data || null;
  }
  return msg.Message({ payload: new Vendor(id, data) });
};

Vendor.prototype.bytes = function() {
  return 4 + util.Data.prototype.bytes.call(this);
};

Vendor.prototype.toView = function(view) {
  if(!view.available(this.bytes())) {
    throw util.Available('Vendor');
  }

  view.writeUInt32(this.id);
  util.Data.prototype.toView.call(this);
};

Vendor.prototype.fromView = function(view) {
  if(!view.available(this.bytes())) {
    throw util.Available('Vendor');
  }

  this.id = view.readUInt32();
  util.Data.prototype.fromView.call(this);
};

var Type = util.makeIndex([
  Hello,
  Error,
  EchoReq,
  EchoRes,
  Vendor
]);
exports.Type = Type;

exports.Payload = function() { 
  return util.Variant(Type); 
};

exports.fromView = function(view) {
  return msg.fromView(view, VERSION);
};

})();
