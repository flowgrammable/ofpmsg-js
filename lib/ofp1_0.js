(function() {

'use strict';

var _    = require('underscore');
var uint = require('uint-js');
var util = require('./util');
var dt = require('./data');
var msg = require('./message');

var VERSION     = uint.mk(1, 1);
exports.VERSION = VERSION;

function Hello(data) {
  this.VERSION = VERSION;
  this.Type    = uint.mk(1, Hello.Type);
  dt.Data.call(this, data);
}
util.makePayload(Hello, 0, dt.Data);

Hello.prototype.bytes = function(){
  return uint.mk( 2, dt.Data.prototype.bytes.call(this) );
};

exports.Hello = function(data) { 
  return msg.Message({ payload: new Hello(data) });
};

function Error(type, code, data) {
  this.VERSION = VERSION;
  this.Type    = uint.mk(1, Error.Type);
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
  return uint.mk(2, 4 + dt.Data.prototype.bytes.call(this));
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
  this.Type    = uint.mk(1, EchoReq.Type);
  dt.Data.call(this, data);
}
util.makePayload(EchoReq, 2, dt.Data);

EchoReq.prototype.bytes = function() {
  return uint.mk(2, dt.Data.prototype.bytes.call(this));
};

exports.EchoReq = function(data) {
  return msg.Message({ payload: new EchoReq(data) });
};

function EchoRes(data) {
  this.VERSION = VERSION;
  this.Type    = uint.mk(1, EchoRes.Type);
  dt.Data.call(this, data);
}
util.makePayload(EchoRes, 3, dt.Data);

EchoRes.prototype.bytes = function() {
  return uint.mk(2, dt.Data.prototype.bytes.call(this));
};

exports.EchoRes = function(data) {
  return msg.Message({ payload: new EchoRes(data) });
};

function Vendor(id, data) {
  this.VERSION = VERSION;
  this.Type    = uint.mk(1, Vendor.Type);
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
  return uint.mk(2, 4 + dt.Data.prototype.bytes.call(this));
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

function FeatureReq(){
  this.VERSION = VERSION; 
  this.Type    = uint.mk(1, FeatureReq.Type);
}
util.makePayload(FeatureReq, 5, dt.Data);

exports.FeatureReq = function(args){
  return msg.Message({ header: new FeatureReq(args) });
};

function FeatureRes(datapathId, nBuffers, nTbls, featureCaps, featureActs, ports){
  this.VERSION = VERSION;
  this.TYPE    = uint.mk(1, FeatureRes.Type);
  this.datapathId = datapathId || null;
  this.nBuffers   = nBuffers   || null;
  this.nTbls      = nTbls      || null;
  this.featureCaps = featureCaps || null;
  this.featureActs = featureActs || null;
  this.ports       = ports       || null;
  dt.Data.call(this, ports);
}
util.makePayload(FeatureRes, 6);

FeatureRes.prototype.bytes = function(){
  return uint.mk(2, 24 + dt.Data.prototype.bytes.call(this));
};

FeatureRes.prototype.fromView = function(view){
  if(view.available() < this.bytes()){
    throw util.Available('FeatureRes');
  }
  this.datapathId = view.readUInt64();
  this.nBuffers   = view.readUInt32();
  this.nTbls      = view.readUInt8();
  util.pad(view, 3);
  this.featureCaps = view.readUInt32();
  this.featureActs = view.readUInt32();
  dt.Data.prototype.fromView.call(this, view);
};

FeatureRes.prototype.toView = function(view){
  if(view.available() < this.bytes()){
    throw util.Available('FeatureRes');
  }
  view.writeUInt64(this.datapathId);
  view.writeUInt32(this.nBuffers);
  view.writeUInt8(this.nTbls);
  util.pad(view, 3);
  view.writeUInt32(this.featureCaps);
  view.writeUInt32(this.featureActs);
  dt.Data.prototype.toView.call(this, view);
};

exports.FeatureRes = function(args){
  return msg.Message({ payload: new FeatureRes(args) });
};

function PacketIn(bufferId, totalLen, inPort, reason, data){
  this.VERSION = VERSION;
  this.TYPE    = uint.mk(1, PacketIn.Type);
  dt.Data.call(this, data);

  this.bufferId = bufferId || null;
  this.totalLen = totalLen || null;
  this.inPort   = inPort   || null;
  this.reason   = reason   || null;

}
util.makePayload(PacketIn, 10);

PacketIn.prototype.fromView = function(view){
  if(view.available() < this.bytes()){
    throw util.Available('PacketIn');
  }
  this.bufferId = view.readUInt32();
  this.totalLen = view.readUInt16();
  this.inPort   = view.readUInt16();
  this.reason   = view.readUInt8();
  view.readUInt8();
  dt.Data.prototype.fromView.call(this, view);
};

PacketIn.prototype.toView = function(view){
  if(view.available() < this.bytes()){
    throw util.Available('PacketIn');
  }
  view.writeUInt32(this.bufferId);
  view.writeUInt16(this.totalLen);
  view.writeUInt16(this.inPort);
  view.writeUInt8(this.reason);
  view.writeUInt8(0x00);
  dt.Data.prototype.toView.call(this, view);
};

PacketIn.prototype.bytes = function(){
  return 10 + dt.Data.prototype.bytes.call(this);
};

exports.PacketIn = function(args){
 var bufferId = null;
 var totalLen = null;
 var inPort   = null;
 var reason   = null;
 var data     = null;
 if(args){
  bufferId = args.bufferId || null;
  totalLen = args.totalLen || null;
  inPort   = args.inPort   || null;
  reason   = args.reason   || null; 
  data     = args.data     || null;
 }
 return msg.Message({ payload: new PacketIn(bufferId, totalLen, inPort, reason, data) });
};


function Match() {
  this.wildcards = null;
  this.in_port = 0;
  this.dl_src = null;
  this.dl_dst = null;
  this.dl_vlan = null;
  this.dl_pcp = null;
  this.dl_type = null;
  this.nw_tos = null;
  this.nw_proto = null;
  this.nw_src = null;
  this.nw_dst = null;
  this.tp_src = null;
  this.tp_dst = null;
}

Match.prototype.bytes = function() {
  return 40;
};

Match.prototype.fromView = function(view) {
  if(view.available() < this.bytes()) {
    throw util.Available();
  }
  this.wildcard = view.readUInt32();
};

Match.prototype.toView = function(view) {
  if(view.available() < this.bytes()) {
    throw util.Available();
  }
};

function FlowMod(args) {
  this.match        = new Match();
  this.cookie       = 0;
  this.command      = 0;
  this.idle_timeout = 0;
  this.hard_timeout = 0;
  this.priority     = 0;
  this.buffer_id    = 0;
  this.out_port     = 0;
  this.flags        = 0;
  this.actions      = [];
  if(args) {
    if(args.match)        { this.match        = args.match;        }
    if(args.cookie)       { this.cookie       = args.cookie;       }
    if(args.command)      { this.command      = args.command;      }
    if(args.idle_timeout) { this.idle_timeout = args.idle_timeout; }
    if(args.hard_timeout) { this.hard_timeout = args.hard_timeout; }
    if(args.priority)     { this.priority     = args.priority;     }
    if(args.buffer_id)    { this.buffer_id    = args.buffer_id;    }
    if(args.out_port)     { this.out_port     = args.out_port;     }
    if(args.flags)        { this.flags        = args.flags;        }
    if(args.actions)      { this.actions      = args.actions;      }
  }
}
util.makePayload(FlowMod, 14);

exports.FlowMod = function(args) {
  return new FlowMod(args);
};

FlowMod.prototype.bytes = function() {
  return this.match.bytes() + 
         24 + 
         _(this.action).reduce(function(bytes, action) { 
           return bytes + action.bytes(); 
         }, 0);
};

FlowMod.prototype.toView = function(view) {

};

FlowMod.prototype.fromView = function(view) {
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
  this.Type    = BarrierRes.Type;
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
  Vendor,
  FeatureReq,
  FeatureRes,
  PacketIn
]);
exports.Type = Type;

exports.Payload = function() { 
  return util.Variant(Type); 
};

exports.fromView = function(view) {
  return msg.fromView(view, VERSION);
};

})();
