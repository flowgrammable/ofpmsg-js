(function() {

'use strict';

var _  = require('underscore');
var uint = require('uint-js');
var util = require('../util');
var dt   = require('../data');
var msg  = require('../message');
var mat  = require('./match');
exports.MATCH = mat;

var CAPABILITIES = {
  0x1: 'FLOW_STATS',
  0x2: 'TABLE_STATS',
  0x4: 'PORT_STATS',
  0x8: 'GROUP_STATS',
  0x10: 'RESERVED',
  0X20: 'IP_REASM',
  0X40: 'QUEUE_STATS',
  0x100: 'PORT_BLOCKED'
};

var VERSION = uint.mk(1, 4);
exports.VERSION = VERSION;

function Hello(data){
  this.VERSION  = VERSION;
  this.Type     = uint.mk(1, Hello.Type);
  dt.Data.call(this, data);
}
util.makePayload(Hello, 0, dt.Data);

Hello.prototype.bytes = function(){
  return uint.mk(2, dt.Data.prototype.bytes.call(this));
};

exports.Hello = function(data){
  return msg.Message({ payload: new Hello(data) });
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

function FeatureReq(){
  this.VERSION = VERSION; 
  this.Type    = uint.mk(1, FeatureReq.Type);
}
util.makePayload(FeatureReq, 5, dt.Data);

FeatureReq.prototype.bytes = function(){
  return uint.mk(2, 0);
};

exports.FeatureReq = function(args){
  return msg.Message({ payload: new FeatureReq(args) });
};

FeatureReq.prototype.toJSON = function() {
  return this;
};

function FeatureRes(datapathId, nBuffers, nTbls, featureCaps, aux_id){
  this.VERSION = VERSION;
  this.TYPE    = uint.mk(1, FeatureRes.Type);
  this.datapathId = datapathId || null;
  this.nBuffers   = nBuffers   || null;
  this.nTbls      = nTbls      || null;
  this.aux_id     = aux_id     || null;
  this.featureCaps = featureCaps || null;
}
util.makePayload(FeatureRes, 6);

FeatureRes.prototype.bytes = function(){
  return uint.mk(2, 24);
};

FeatureRes.prototype.fromView = function(view){
  if(view.available() < this.bytes().value()){
    throw util.Available('FeatureRes');
  }
  this.datapathId = view.readUInt64();
  this.nBuffers   = view.readUInt32();
  this.nTbls      = view.readUInt8();
  this.aux_id     = view.readUInt8();
  util.pad(view, 2);
  this.featureCaps = view.readUInt32();
  util.pad(view, 4);
};

FeatureRes.prototype.toView = function(view){
  if(view.available() < this.bytes()){
    throw util.Available('FeatureRes');
  }
  view.writeUInt64(this.datapathId);
  view.writeUInt32(this.nBuffers);
  view.writeUInt8(this.nTbls);
  view.writeUInt8(this.aux_id);
  util.pad(view, 2);
  view.writeUInt32(this.featureCaps);
  util.pad(view, 4);
};

FeatureRes.prototype.toString = function(){
  return 'Datapath ID: ' + this.datapathId.toString(16) + '\n' +
         'Buffers:     ' + this.nBuffers.toString() + '\n' +
         'Tables:      ' + this.nTbls.toString() + '\n' +
         'Aux ID:      ' + this.aux_id.toString() + '\n' +
         'Capabilities ' + util.bmToString(this.featureCaps.value(), CAPABILITIES);
};

exports.FeatureRes = function(args){
  return msg.Message({ payload: new FeatureRes(args) });
};


function GetConfigReq(){
  this.VERSION  = VERSION;
  this.Type     = uint.mk(1, GetConfigReq.Type);
}
util.makePayload(GetConfigReq, 7);

GetConfigReq.prototype.bytes = function(){
  return uint.mk(2, 0);
};

GetConfigReq.prototype.fromView = function(view){
  return this;
};

GetConfigReq.prototype.toView = function(view){
  return this;
};

GetConfigReq.prototype.toJSON = toJSON;

exports.GetConfigReq = function(){
  return msg.Message({ payload: new GetConfigReq() });
};

function GetConfigRes(args){
  this.VERSION  = VERSION;
  this.Type     = uint.mk(1, GetConfigRes.Type);
  this.flags = null;
  this.miss_send_len = null;
  if(args){
    this.flags         = args.flags || null;
    this.miss_send_len = args.miss_send_len || null;
  }
}
util.makePayload(GetConfigRes, 8);

GetConfigRes.prototype.bytes = function(){
  return uint.mk(2, 4);
};

GetConfigRes.prototype.fromView = function(view){
  this.flags = view.readUInt16();
  this.miss_send_len = view.readUInt16();
  return this;
};

GetConfigRes.prototype.toView = function(view){
  if(view.available() < this.bytes().value()){
    throw util.Available('GetConfigRes');
  }
  view.writeUInt16(this.flags);
  view.writeUInt16(this.miss_send_len);
  return this;
};

exports.GetConfigRes = function(args){
  return msg.Message({ payload: new GetConfigRes(args) });
};

function SetConfig(args){
  this.VERSION  = VERSION;
  this.Type     = uint.mk(1, SetConfig.Type);
  this.flags = null;
  this.miss_send_len = null;
  if(args){
    this.flags         = args.flags || null;
    this.miss_send_len = args.miss_send_len || null;
  }
}
util.makePayload(SetConfig, 9);

SetConfig.prototype.bytes = function(){
  return uint.mk(2, 4);
};

SetConfig.prototype.fromView = function(view){
  this.flags = view.readUInt16();
  this.miss_send_len = view.readUInt16();
  return this;
};

SetConfig.prototype.toView = function(view){
  if(view.available() < this.bytes().value()){
    throw util.Available('SetConfig');
  }
  view.writeUInt16(this.flags);
  view.writeUInt16(this.miss_send_len);
  return this;
};

exports.SetConfig = function(args){
  return msg.Message({ payload: new SetConfig(args) });
};

function PacketIn(bufferId, totalLen, reason, table_id, cookie, match, data){
  this.VERSION = VERSION;
  this.TYPE    = uint.mk(1, PacketIn.Type);

  this.bufferId = bufferId || null;
  this.totalLen = totalLen || null;
  this.reason   = reason   || null;
  this.table_id = table_id || null;
  this.cookie   = cookie   || null;
  this.match    = match    || new mat.Match();
  dt.Data.call(this, data);
}
util.makePayload(PacketIn, 10);

var PacketInReason = {
  0x0: 'NoMatch',
  0x1: 'Action',
  0x2: 'InvalidTTL'
};
exports.PacketInReason = PacketInReason;

PacketIn.prototype.fromView = function(view){
  this.bufferId = view.readUInt32();
  this.totalLen = view.readUInt16();
  if(view.available() < this.bytes()){
    throw util.Available('PacketIn');
  }
  this.reason   = view.readUInt8();
  this.table_id = view.readUInt8();
  this.cookie   = view.readBytes(8);

  this.match.fromView(view);
  util.pad(view, 2);
  if(this.totalLen.value()){
    dt.Data.prototype.fromView.call(this, view);
  }
};

PacketIn.prototype.toView = function(view){
  if(view.available() < this.bytes()){
    throw util.Available('PacketIn');
  }
  view.writeUInt32(this.bufferId);
  view.writeUInt16(this.totalLen);
  view.writeUInt8(this.reason);
  view.writeUInt8(this.table_id);
  view.writeBytes(this.cookie);
  this.match.toView(view);
  util.pad(view, 2);
  if(this.totalLen.value()){
    dt.Data.prototype.toView.call(this, view);
  }
};

PacketIn.prototype.toJSON = function(){
  return {
    buffer_id: this.bufferId.toString(16),
    total_len: this.totalLen.toString(16),
    reason: this.reason.toString(16),
    table_id: this.table_id.toString(16),
    cookie: this.cookie.toString(16),
    match: this.match.toJSON()
  };
};

PacketIn.prototype.bytes = function(){
  return (18 + 
      4 + 
      this.totalLen.value() );
};

exports.PacketIn = function(args){
 var bufferId = null;
 var totalLen = null;
 var reason   = null;
 var table_id = null;
 var cookie   = null;
 var match    = null;
 var data     = null;
 if(args){
  bufferId = args.bufferId || null;
  totalLen = args.totalLen || null;
  reason   = args.reason   || null; 
  table_id = args.table_id || null;
  cookie   = args.cookie   || null;
  match    = args.match    || null;
  data     = args.data     || null;
 }
 return msg.Message({ payload: new PacketIn(bufferId, totalLen, reason, table_id,
      cookie, match, data) });
};

function FlowRemoved(cookie, priority, reason, table_id, duration_sec, 
    duration_nsec, idle_timeout, hard_timeout, packet_count, byte_count, match){
  this.VERSION = VERSION;
  this.TYPE    = uint.mk(1, FlowRemoved.Type);

  this.cookie   = cookie   || null;
  this.priority = priority || null;
  this.reason   = reason   || null;
  this.table_id = table_id || null;
  this.duration_sec = duration_sec || null;
  this.duration_nsec = duration_nsec || null;
  this.idle_timeout = idle_timeout || null;
  this.packet_count = packet_count || null;
  this.byte_count = byte_count || null;
  this.match    = match    || new mat.Match();
}
util.makePayload(FlowRemoved, 11);

var FlowRemovedReason = {
  0x0: 'IdleTimeout',
  0x1: 'HardTimeout',
  0x2: 'Delete',
  0x3: 'GroupDelete'
};

FlowRemoved.prototype.fromView = function(view){
  if(view.available() < this.bytes()){
    throw util.Available('FlowRemoved');
  }
  this.cookie        = view.readUInt64();
  this.priority      = view.readUInt16();
  this.reason        = view.readUInt8();
  this.table_id      = view.readUInt8();
  this.duration_sec  = view.readUInt32();
  this.duration_nsec = view.readUInt32();
  this.idle_timeout = view.readUInt16();
  this.hard_timeout = view.readUInt16();
  this.packet_count = view.readUInt64();
  this.byte_count = view.readUInt64();
  this.match.fromView(view);
};

FlowRemoved.prototype.toView = function(view){
  if(view.available() < this.bytes()){
    throw util.Available('FlowRemoved');
  }
  view.writeUInt64(this.cookie);
  view.writeUInt16(this.priority);
  view.writeUInt8(this.reason);
  view.writeUInt8(this.table_id);
  view.writeUInt32(this.duration_sec);
  view.writeUInt32(this.duration_nsec);
  view.writeUInt16(this.idle_timeout);
  view.writeUInt16(this.hard_timeout);
  view.writeUInt64(this.packet_count);
  view.writeUInt64(this.byte_count);
  this.match.toView(view);
};

FlowRemoved.prototype.bytes = function(){
  return uint.mk(2, 40 + this.match.bytes().value());
};

exports.FlowRemoved = function(args){
 var match    = null;
 var cookie   = null;
 var priority = null;
 var reason   = null;
 var table_id = null;
 var duration_sec  = null;
 var duration_nsec = null;
 var idle_timeout = null;
 var hard_timeout = null;
 var packet_count = null;
 var byte_count   = null;
 if(args){
  match = args.match || new mat.Match();
  cookie = args.cookie || null;
  priority = args.priority || null;
  reason = args.reason || null;
  table_id = args.table_id || null;
  duration_sec = args.duration_sec || null;
  duration_nsec = args.duraction_nsec || null;
  idle_timeout = args.idle_timeout || null;
  hard_timeout = args.hard_timeout || null;
  packet_count = args.packet_count || null;
  byte_count = args.byte_count || null;
 }
 return msg.Message({ payload: new FlowRemoved(cookie, priority, reason, 
       table_id, duration_sec, duration_nsec, idle_timeout, hard_timeout, 
       packet_count, byte_count, match) });
};

var Type = util.makeIndex([
  Hello,
  EchoReq,
  EchoRes,
  FeatureReq,
  FeatureRes,
  GetConfigReq,
  GetConfigRes,
  SetConfig,
  PacketIn,
  FlowRemoved
]);
exports.Type = Type;

exports.Payload = function() { 
  return util.Variant(Type); 
};

exports.fromView = function(view) {
  return msg.fromView(view, VERSION);
};

var toJSON = function(){
  return this;
};
Hello.prototype.toJSON = toJSON;
EchoReq.prototype.toJSON = toJSON;
EchoRes.prototype.toJSON = toJSON;
FeatureReq.prototype.toJSON = toJSON;
FeatureRes.prototype.toJSON = toJSON;
GetConfigReq.prototype.toJSON = toJSON;
GetConfigRes.prototype.toJSON = toJSON;
SetConfig.prototype.toJSON = toJSON;
FlowRemoved.prototype.toJSON = toJSON;
})();
