(function() {

'use strict';

var _    = require('underscore');
var uint = require('uint-js');
var util = require('../util');
var dt = require('../data');
var msg = require('../message');
var mat = require('./match');
var act = require('./action');
var stats = require('./stats');
var ports = require('./ports');
var VERSION     = uint.mk(1, 1);

exports.VERSION = VERSION;
exports.MATCH   = mat;
exports.STATS   = stats;
exports.ACTION  = act;
exports.PORTS   = ports;

var CAPABILITIES = {
  0x1: 'FLOW_STATS',
  0x2: 'TABLE_STATS',
  0x4: 'PORT_STATS',
  0x8: 'STP',
  0x10: 'RESERVED',
  0X20: 'IP_REASM',
  0X40: 'QUEUE_STATS',
  0X80: 'ARP_MATCH_IP'
};

var ACTIONS = {
  0x1: 'OUTPUT',
  0x2: 'SET_VLAN_VID',
  0x4: 'SET_VLAN_PCP',
  0x8: 'STRIP_VLAN',
  0x10: 'SET_DL_SRC',
  0x20: 'SET_DL_DST',
  0x40: 'SET_NW_SRC',
  0x80: 'SET_NW_DST',
  0x100: 'SET_NW_TOS',
  0x200: 'SET_TP_SRC',
  0x400: 'SET_TP_DST',
  0X800: 'ENQUEUE'
};  
  
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

  this.type = type || null;
  this.code = code || null;
  dt.Data.call(this, data);
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

Error.prototype.toJSON = function(){
  return {
    type: this.type.toString(),
    code: this.code.toString()
  };
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

Vendor.prototype.toJSON = function() {
  return this;
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

FeatureReq.prototype.bytes = function(){
  return uint.mk(2, 0);
};

exports.FeatureReq = function(args){
  return msg.Message({ payload: new FeatureReq(args) });
};

FeatureReq.prototype.toJSON = function() {
  return this;
};

function FeatureRes(datapathId, nBuffers, nTbls, featureCaps, featureActs, ports){
  this.VERSION = VERSION;
  this.TYPE    = uint.mk(1, FeatureRes.Type);
  this.datapathId = datapathId || null;
  this.nBuffers   = nBuffers   || null;
  this.nTbls      = nTbls      || null;
  this.featureCaps = featureCaps || null;
  this.featureActs = featureActs || null;
  this.ports       = ports       || [] ;
}
util.makePayload(FeatureRes, 6);

FeatureRes.prototype.bytes = function(){
  return uint.mk(2, 24 + (this.ports.length * 48));
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
  this.ports = [];
  _((view.available() / 48)).times(function(i){
    var p = new Port();
    p.fromView(view);
    this.ports.push(p);
  }, this);
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
  //TODO: port to view
  if(view.available() && ((view.available() % 48) === 0)){
    _(this.ports).forEach(function(p){
      p.toView(view);
    }, this);
  }
};

FeatureRes.prototype.toString = function(){
  return 'Datapath ID: ' + this.datapathId.toString(16) + '\n' +
         'Buffers:     ' + this.nBuffers.toString() + '\n' +
         'Tables:      ' + this.nTbls.toString() + '\n' +
         'Capabilities ' + util.bmToString(this.featureCaps.value(), CAPABILITIES) + '\n' +
         'Actions:     ' + util.bmToString(this.featureActs.value(), ACTIONS);
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

var PacketInReason = {
  0x0: 'TableMiss',
  0x1: 'Action'
};
exports.PacketInReason = PacketInReason;

PacketIn.prototype.fromView = function(view){
  if(view.available() < this.bytes()){
    throw util.Available('PacketIn');
  }
  this.bufferId = view.readUInt32();
  this.totalLen = view.readUInt16();
  this.inPort   = view.readUInt16();
  this.reason   = view.readUInt8();
  util.pad(view, 1);
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
  util.pad(view, 1);
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

function FlowRemoved(match, cookie, priority, reason, duration_sec, duration_nsec,
    idle_timeout, packet_count, byte_count){
  this.VERSION = VERSION;
  this.TYPE    = uint.mk(1, FlowRemoved.Type);

  this.match    = match    || new mat.Match();
  this.cookie   = cookie   || null;
  this.priority = priority || null;
  this.reason   = reason   || null;
  this.duration_sec = duration_sec || null;
  this.duration_nsec = duration_nsec || null;
  this.idle_timeout = idle_timeout || null;
  this.packet_count = packet_count || null;
  this.byte_count = byte_count || null;
}
util.makePayload(FlowRemoved, 11);

var FlowRemovedReason = {
  0x0: 'IdleTimeout',
  0x1: 'HardTimeout',
  0x2: 'Delete'
};

FlowRemoved.prototype.fromView = function(view){
  if(view.available() < this.bytes()){
    throw util.Available('FlowRemoved');
  }
  this.match.fromView(view);
  this.cookie = view.readUInt64();
  this.priority = view.readUInt16();
  this.reason   = view.readUInt8();
  util.pad(view, 1);
  this.duration_sec = view.readUInt32();
  this.duration_nsec = view.readUInt32();
  this.idle_timeout = view.readUInt16();
  util.pad(view, 2);
  this.packet_count = view.readUInt64();
  this.byte_count = view.readUInt64();
};

FlowRemoved.prototype.toView = function(view){
  if(view.available() < this.bytes()){
    throw util.Available('FlowRemoved');
  }
  this.match.toView(view);
  view.writeUInt64(this.cookie);
  view.writeUInt16(this.priority);
  view.writeUInt8(this.reason);
  util.pad(view, 1);
  view.writeUInt32(this.duration_sec);
  view.writeUInt32(this.duration_nsec);
  view.writeUInt16(this.idle_timeout);
  util.pad(view, 2);
  view.writeUInt64(this.packet_count);
  view.writeUInt64(this.byte_count);
};

FlowRemoved.prototype.bytes = function(){
  return uint.mk(2, 80);
};

exports.FlowRemoved = function(args){
 var match    = null;
 var cookie   = null;
 var priority = null;
 var reason   = null;
 var duration_sec  = null;
 var duration_nsec = null;
 var idle_timeout = null;
 var packet_count = null;
 var byte_count   = null;
 if(args){
  match = args.match || new mat.Match();
  cookie = args.cookie || null;
  priority = args.priority || null;
  reason = args.reason || null;
  duration_sec = args.duration_sec || null;
  duration_nsec = args.duraction_nsec || null;
  idle_timeout = args.idle_timeout || null;
  packet_count = args.packet_count || null;
  byte_count = args.byte_count || null;
 }
 return msg.Message({ payload: new FlowRemoved(match, cookie, priority, reason, 
       duration_sec, duration_nsec, idle_timeout, packet_count, byte_count) });
};

function PacketOut(buffer_id, in_port, actions_len, actions, data) {
  this.VERSION = VERSION;
  this.TYPE    = uint.mk(1, PacketOut.Type);

  this.buffer_id = buffer_id || null;
  this.in_port   = in_port   || null;
  this.actions   = actions || [];
  var actlen = uint.mk(2, 0);
  _(this.actions).forEach(function(a){ 
    actlen = actlen.plus(a.length);
  });
  this.actions_len = actions_len || actlen;
  dt.Data.call(this, data);
}
util.makePayload(PacketOut, 13);

PacketOut.prototype.fromView = function(view){
  if(view.available() < this.bytes()){
    throw util.Available('PacketOut');
  }
  this.buffer_id = view.readUInt32();
  this.in_port   = view.readUInt16();
  this.actions_len = view.readUInt16();
  this.actions = [];
  while(this.actions_len.value() && (view.available() >= this.actions_len.value())){
    this.actions.push(act.fromView(view));
  }
  dt.Data.prototype.fromView.call(this, view);
};

PacketOut.prototype.toView = function(view){
  if(view.available() < this.bytes()){
    throw util.Available('FlowRemoved');
  }
  view.writeUInt32(this.buffer_id);
  view.writeUInt16(this.in_port);
  view.writeUInt16(this.actions_len);
  _(this.actions).forEach(function(a){
    a.toView(view);
  }, this);
  dt.Data.prototype.toView.call(this, view);
};

PacketOut.prototype.bytes = function(){
  return uint.mk(2, 8 + this.actions_len.value() + dt.Data.prototype.bytes.call(this));
};

exports.PacketOut = function(args){
 var buffer_id   = null;
 var in_port     = null;
 var actions_len = null;
 var actions     = [];
 var data        = null;
 if(args){
   buffer_id   = args.buffer_id || uint.mk(4, 0xffffffff);
   in_port     = args.in_port   || uint.mk(2, 0);
   actions_len = args.actions_len || null;
   actions     = actions || [];
   data        = data || null;
 }
 return msg.Message({ payload: new PacketOut(buffer_id, in_port, actions_len, actions, data) });
};

function Port(){
  this.portId = null;
  this.hwAddr = null;
  this.name   = null;
  this.config = null;
  this.state  = null;
  this.curr   = null;
  this.advertised = null;
  this.supported = null;
  this.peer = null;
}

Port.prototype.bytes = function(){
  return uint.mk(2, 48);
};

Port.prototype.fromView = function(view){
  if(view.available() < this.bytes()){
    throw util.Available('Port');
  }
  this.portId = view.readUInt16();
  this.hwAddr = view.readBytes(6);
  this.name   = view.readBytes(16);
  this.config = view.readUInt32();
  this.state  = view.readUInt32();
  this.curr   = view.readUInt32();
  this.advertised = view.readUInt32();
  this.supported = view.readUInt32();
  this.peer = view.readUInt32();
};

Port.prototype.toView = function(view){
  if(view.available() < this.bytes()){
    throw util.Available('Port');
  }
  view.writeUInt16(this.portId);
  view.writeBytes(this.hwAddr);
  view.writeBytes(this.name);
  view.writeUInt32(this.config);
  view.writeUInt32(this.state);
  view.writeUInt32(this.curr);
  view.writeUInt32(this.advertised);
  view.writeUInt32(this.supported);
  view.writeUInt32(this.peer);
};

function PortStatus(reason, port){
  this.VERSION = VERSION;
  this.TYPE    = uint.mk(1, PortStatus.Type);

  this.reason = reason || null;
  this.port   = port   || null;
}
util.makePayload(PortStatus, 12);

PortStatus.prototype.bytes = function(){
  return uint.mk(2, 56);
};

PortStatus.prototype.fromView = function(view){
  if(view.available() < this.bytes()){
    throw util.Available('PortStatus');
  }
  this.reason   = view.readUInt8();
  util.pad(view, 7);
  this.port     = new Port();
  this.port.fromView(view);
};

PortStatus.prototype.toView = function(view){
  if(view.available() < this.bytes()){
    throw util.Available('PortStatus');
  }
  view.writeUInt8(this.reason);
  util.pad(view, 7);
  this.port.toView(view);
};

exports.PortStatus = function(args){
 var reason = null;
 var port = null;
 if(args){
  reason = args.reason || null;
  port = args.port || null;
 }
 return msg.Message({ payload: new PortStatus(reason, reason) });
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
  this.VERSION = VERSION;
  this.Type    = uint.mk(1, FlowMod.Type); 
  this.match        = new mat.Match();
  this.cookie       = uint.mk(8, 0);
  this.command      = uint.mk(2, 0);
  this.idle_timeout = uint.mk(2, 0); 
  this.hard_timeout = uint.mk(2, 0);
  this.priority     = uint.mk(2, 0);
  this.buffer_id    = uint.mk(4, 0);
  this.out_port     = uint.mk(2, 0);
  this.flags        = uint.mk(2, 0);
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
  return msg.Message({ payload: new FlowMod(args) });
};

FlowMod.prototype.bytes = function() {
  return uint.mk(2, this.match.bytes() + 
         24 + 
         _(this.actions).reduce(function(bytes, action) { 
           return bytes + action.bytes(); 
         }, 0) );
};

FlowMod.prototype.toView = function(view) {
  if(view.available() < this.bytes()){
    throw util.Available('FlowMod');
  }
  this.match.toView(view);
  view.writeUInt64(this.cookie);
  view.writeUInt16(this.command);
  view.writeUInt16(this.idle_timeout);
  view.writeUInt16(this.hard_timeout);
  view.writeUInt16(this.priority);
  view.writeUInt32(this.buffer_id);
  view.writeUInt16(this.out_port);
  view.writeUInt16(this.flags);
  _(this.actions).forEach(function(a){
    a.toView(view);
  }, this);
};

FlowMod.prototype.fromView = function(view) {
  if(view.available() < this.bytes()){
    throw util.Available('FlowMod');
  }
  this.match.fromView(view);
  this.cookie       = view.readUInt64();
  this.command      = view.readUInt16();
  this.idle_timeout = view.readUInt16();
  this.hard_timeout = view.readUInt16();
  this.priority     = view.readUInt16();
  this.buffer_id    = view.readUInt32();
  this.out_port     = view.readUInt16();
  this.flags        = view.readUInt16();
  this.actions      = [];
  while(view.available() >= 4){
    this.actions.push(act.fromView(view));
  }
};

util.makePayload(stats.StatsReq, 16);
exports.StatsReq = function(args){
  return msg.Message({ payload: new stats.StatsReq(args) });
};

util.makePayload(stats.StatsRes, 17);
exports.StatsRes = function(args){
  return msg.Message({ payload: new stats.StatsRes(args) });
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
  GetConfigReq,
  GetConfigRes,
  SetConfig,
  PacketIn,
  FlowRemoved,
  PortStatus,
  PacketOut,
  FlowMod,
  stats.StatsReq,
  stats.StatsRes
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
GetConfigReq.prototype.toJSON = toJSON;
GetConfigRes.prototype.toJSON = toJSON;
SetConfig.prototype.toJSON = toJSON;
PacketIn.prototype.toJSON = toJSON;
FlowRemoved.prototype.toJSON = toJSON;
PortStatus.prototype.toJSON = toJSON;
PacketOut.prototype.toJSON = toJSON;
FlowMod.prototype.toJSON = toJSON;

})();
