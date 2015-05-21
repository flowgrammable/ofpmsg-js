(function() {

'use strict';

var _    = require('underscore');
var util = require('./util');
var dt = require('./data');
var msg = require('./message');

var VERSION     = 1;
exports.VERSION = VERSION;

function Hello(data) {
  this.VERSION = VERSION;
  this.Type    = Hello.Type;
  dt.Data.call(this, data);
}
util.makePayload(Hello, 0, dt.Data);

exports.Hello = function(data) { 
  return msg.Message({ payload: new Hello(data) });
};

function Error(type, code, data) {
  this.VERSION = VERSION;
  this.Type    = Error.Type;
  dt.Data.call(this, data);

  this.type = type || null;
  this.code = code || null;
}
util.makePayload(Error, 1, dt.Data);

exports.Error = function(args) {
  var data = null;
  var type = null;
  var code = null;
  if(args) {
    type = args.type || null;
    code = args.code || null;
    data = args.data || null;
  }
  return msg.Message({ payload: new Error(type, code, data) });
};

Error.prototype.bytes = function() {
  return 4 + dt.Data.prototype.bytes.call(this);
};

Error.prototype.toView = function(view) {
  if(view.available() < this.bytes()) {
    throw util.Available('Error');
  }

  view.writeUInt16(this.type);
  view.writeUInt16(this.code);
  dt.Data.prototype.toView.call(this, view);
};

Error.prototype.fromView = function(view) {
  if(view.available() < this.bytes()) {
    throw util.Available('Error');
  }
  this.type = view.readUInt16();
  this.code = view.readUInt16();
  dt.Data.prototype.fromView.call(this, view);
};

function EchoReq(data) {
  this.VERSION = VERSION;
  this.Type    = EchoReq.Type;
  dt.Data.call(this, data);
}
util.makePayload(EchoReq, 2, dt.Data);

exports.EchoReq = function(data) {
  return msg.Message({ payload: new EchoReq(data) });
};

function EchoRes(data) {
  this.VERSION = VERSION;
  this.Type    = EchoRes.Type;
  dt.Data.call(this, data);
}
util.makePayload(EchoRes, 3, dt.Data);

exports.EchoRes = function(data) {
  return msg.Message({ payload: new EchoRes(data) });
};

function Vendor(id, data) {
  this.VERSION = VERSION;
  this.Type    = Vendor.Type;
  dt.Data.call(this, data);
  this.id = id || null;
}
util.makePayload(Vendor, 4, dt.Data);

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
  return 4 + dt.Data.prototype.bytes.call(this);
};

Vendor.prototype.toView = function(view) {
  if(view.available() < this.bytes()) {
    throw util.Available('Vendor');
  }

  view.writeUInt32(this.id);
  dt.Data.prototype.toView.call(this);
};

Vendor.prototype.fromView = function(view) {
  if(view.available() < this.bytes()) {
    throw util.Available('Vendor');
  }

  this.id = view.readUInt32();
  dt.Data.prototype.fromView.call(this);
};

function BarrierReq(data) {
  this.VERSION = VERSION;
  this.Type = BarrierRes.Type;
  dt.Data.call(this, data);
}
util.makePayload(BarrierReq, 18, dt.Data);

exports.BarrierReq = function(args) {
  var data = null;
  if(args) {
    data = args.data || null;
  }
  return new BarrierReq(data);
};

function BarrierRes(data) {
  this.VERSION = VERSION;
  this.Type = BarrierRes.Type;
  dt.Data.call(this, data);
}
util.makePayload(BarrierRes, 19, dt.Data);

exports.BarrierRes = function(args) {
  var data = null;
  if(args) {
    data = args.data || null;
  }
  return new BarrierRes(data);
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
