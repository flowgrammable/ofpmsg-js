(function(){
var util = require('../util');
var dt   = require('../data');
var uint = require('uint-js');
var _    = require('underscore');
var mat  = require('./match');
var PORTS = require('./ports');
var act  = require('./action');

function bytes(){
  return new uint.UInt({bytes: 2, value: 4});
}

var Header = function(args){
  if(args){
    this.type = _(args.type.value()).isFinite() ? args.type : null;
    this.flags = args.flags || uint.mk(2, 0); 
  } else {
    this.type  = null;
    this.flags = null;
  }
};
exports.Header = Header;

Header.prototype.toJSON = function(){
  return {
    type: this.type.toString(),
    flags: this.flags.toString(16)
  };
};

Header.prototype.isValid = function(type){
  switch(type.value()){
    case 0x0:
    case 0x1:
    case 0x2:
    case 0x3:
    case 0x4:
    case 0x5:
    case 0x6:
    case 0x7:
    case 0x8:
    case 0x9:
    case 0xa:
    case 0xb:
    case 0xc:
    case 0xffff:
      return true;
    default:
      return false;
  }
};

Header.prototype.bytes = function(){
  return uint.mk(2, 8);
};

Header.prototype.fromView = function(view){
  if(view.available() < this.bytes()){
    throw util.Available('StatsHeader');
  }
  this.type  = view.readUInt16();
  this.flags = view.readUInt16();

  if(!this.isValid(this.type)){
    throw util.Undefined(this.type.value());
  }

  return this;
};

Header.prototype.toView = function(view){
  if(view.available() < this.bytes().value()){
    throw util.Available('StatsHeader');
  }
  view.writeUInt16(this.type);
  view.writeUInt16(this.flags);
  return this;
};

function StatsReq(args){
  this.VERSION = uint.mk(1, 4); 
  this.Type    = uint.mk(1, 18); 
  this.header = null;
  this.payload = null;
  if(args){
    this.payload = args.payload || null;
    this.header  = args.header  || null;
  }
  if(this.header === null && this.payload){
    this.header = new Header({
      type: this.payload.Type
    });
  } else if(this.header === null){
   this.header = new Header();
  }
} 

StatsReq.prototype.toJSON = function(){
  return {
    header: this.header.toJSON(),
    payload: this.payload ? this.payload.toJSON() : null
  };
};

StatsReq.prototype.bytes = function(){
  return uint.mk(2, 4 + this.payload.bytes().value());
};

StatsReq.prototype.toView = function(view){
  this.header.toView(view);
  this.payload.toView(view);
  return this;
};

StatsReq.prototype.fromView = function(view){
  this.header.fromView(view);
  this.payload = StatsVariant(ReqType)(this.header.type.value(), view);
  return this;
};

exports.StatsReq = function(args){
  return new StatsReq(args);
};


var StatsVariant = function(Map){
  return function(type, view){
    var result;
    var key = type.toString();
    if(_(Map).has(key)){
      result = new Map[key]();
      result.fromView(view);
      return result;
    } else {
      throw new Error('missing key');
    }
  };
};

function StatsRes(args){
  this.VERSION = uint.mk(1, 4);
  this.Type    = uint.mk(2, 19);
  this.header = null;
  this.payload = null;
  if(args){
    this.payload = args.payload || null;
    this.header  = args.header  || null;
  }
  if(this.header === null && this.payload){
    this.header = new Header({
      type: this.payload.Type
    });
  } else if(this.header === null){
   this.header = new Header();
  }
} 

StatsRes.prototype.toJSON = function(){
  return {
    header: this.header.toJSON(),
    payload: this.payload.toJSON()
  };
};

StatsRes.prototype.bytes = function(){
  return uint.mk(2, this.payload.bytes().value());
};

StatsRes.prototype.toView = function(view){
  this.header.toView(view);
  this.payload.toView(view);
  return this;
};

StatsRes.prototype.fromView = function(view){
  this.header.fromView(view);
  this.payload = StatsVariant(ResType)(this.header.type.value(), view);
  return this;
};

exports.StatsRes = function(args){
  return new StatsRes(args);
};
util.makePayload(StatsRes, 19);

function DescriptionReq(){ 
  this.Type    = uint.mk(2, DescriptionReq.Type); 
}
util.makePayload(DescriptionReq, 0);

DescriptionReq.prototype.bytes = function(){
  return uint.mk(2, 4);
};

DescriptionReq.prototype.fromView = function(view){
  if(view.available() < this.bytes()){
   throw util.Available('StatsReqDescriptionReq');
  }
  util.pad(view, 4);
 return this;
}; 

DescriptionReq.prototype.toView = function(view){
  if(view.available() < this.bytes()){
    throw util.Available('StatsReqDescriptionReq');
  }
  util.pad(view, 4);
  return this;
};

exports.DescriptionReq = function(args) {
  return new DescriptionReq();
};

function DescriptionRes(args){
  this.Type    = uint.mk(1, DescriptionRes.Type);
  this.mfr_desc      = null;
  this.hw_desc       = null;
  this.sw_desc       = null;
  this.serial_num    = null;
  this.dp_desc       = null;
  if(args){
    this.mfr_desc    = args.mfr_desc   || null;
    this.hw_desc     = args.hw_desc    || null;
    this.sw_desc     = args.sw_desc    || null;
    this.serial_num  = args.serial_num || null;
    this.dp_desc     = args.dp_desc    || null;
  }
}
util.makePayload(DescriptionRes, 0);

DescriptionRes.prototype.bytes = function(){
  return uint.mk(2, 1056);
};

DescriptionRes.prototype.fromView = function(view){
  if(view.available() < this.bytes().value()){
   throw util.Available('StatsResDescriptionRes');
  }
  this.mfr_desc      = view.readBytes(256);
  this.hw_desc       = view.readBytes(256);
  this.sw_desc       = view.readBytes(256);
  this.serial_num    = view.readBytes(32);
  this.dp_desc       = view.readBytes(256);
  return this;
}; 

DescriptionRes.prototype.toView = function(view){
  if(view.available() < this.bytes()){
    throw util.Available('StatsResDescriptionRes');
  }
  view.writeBytes(this.mfr_desc);
  view.writeBytes(this.hw_desc);
  view.writeBytes(this.sw_desc);
  view.writeBytes(this.serial_num);
  view.writeBytes(this.dp_desc);
  return this;
};

exports.DescriptionRes = function(args) {
  return new DescriptionRes(args);
};

function FlowReq(table_id, out_port, out_group, cookie, cookie_mask, match){ 
  this.Type    = uint.mk(2, FlowReq.Type); 

  this.table_id    = table_id    || uint.mk(1, 0xff);
  this.out_port    = out_port    || uint.mk(4, PORTS['all']);
  this.out_group   = out_group   || uint.mk(4, 0);
  this.cookie      = cookie      || uint.mk(8, 0);
  this.cookie_mask = cookie_mask || uint.mk(8, 0);
  this.match       = match       || new mat.Match();
}
util.makePayload(FlowReq, 1);

FlowReq.prototype.bytes = function(){
  return uint.mk(2, 32 + this.match.bytes().value());
};

FlowReq.prototype.toJSON = function(){
  return {
    table_id: this.table_id.toString(),
    out_port: this.out_port.toString(),
    out_group: this.out_group.toString(),
    cookie:   this.cookie.toString(),
    cookie_mask: this.cookie_mask.toString(),
    match:    JSON.stringify(this.match.toString())
  };
};

FlowReq.prototype.fromView = function(view){
  if(view.available() < this.bytes()){
   throw util.Available('StatsReqFlowReq');
  }
  this.table_id = view.readUInt8();
  util.pad(view, 3);
  this.out_port  = view.readUInt32();
  this.out_group = view.readUInt32();
  util.pad(view, 4);
  this.cookie      = view.readUInt64();
  this.cookie_mask = view.readUInt64();
  this.match.fromView(view);
 return this;
}; 

FlowReq.prototype.toView = function(view){
  if(view.available() < this.bytes()){
    throw util.Available('StatsReqFlowReq');
  }
  view.writeUInt8(this.table_id);
  util.pad(view, 3);
  view.writeUInt32(this.out_port);
  view.writeUInt32(this.out_group);
  util.pad(view, 4);
  view.writeUInt64(this.cookie);
  view.writeUInt64(this.cookie_mask);
  this.match.toView(view);
  return this;
};

exports.FlowReq = function(args) {
  var match    = null;
  var table_id = null;
  var out_group = null;
  var out_port = null;
  var cookie   = null;
  var cookie_mask = null;
  if(args){
    table_id    = args.table_id  || uint.mk(1, 0xff);
    out_port    = args.out_port  || uint.mk(4, PORTS['all']);
    out_group   = args.out_group || uint.mk(4, 0);
    cookie      = args.cookie    || uint.mk(8, 0xffffffffffffffff);
    cookie_mask = args.cookie    || uint.mk(8, 0xffffffffffffffff);
    match       = args.match     || new mat.Match();
  }
  return new FlowReq(table_id, out_port, out_group, cookie, cookie_mask, match);
};

function FlowRes(length, table_id, duration_sec,
    duration_nsec, priority, idle_timeout, hard_timeout, flags,
    cookie, packet_count, byte_count, match, instructions){ 
  this.Type    = uint.mk(2, FlowRes.Type);
  this.length = length || null;
  this.table_id = table_id || null;
  this.match    = match    || new mat.Match();
  this.duration_nsec = duration_nsec || null;
  this.duration_sec = duration_sec || null;
  this.priority     = priority     || null;
  this.idle_timeout = idle_timeout || null;
  this.hard_timeout = hard_timeout || null;
  this.cookie       = cookie       || null;
  this.packet_count = packet_count || null;
  this.byte_count   = byte_count   || null;
  this.actions      = actions      || [];
}
util.makePayload(FlowRes, 1);

FlowRes.prototype.bytes = function(){
  var val = 88;
  _(this.actions).forEach(function(a){
    val += a.bytes();
  }, this);
  return uint.mk(2, val); 
};

FlowRes.prototype.toJSON = function(){
  return this;
};

FlowRes.prototype.fromView = function(view){
  if(view.available() < this.bytes()){
   throw util.Available('StatsReqFlowRes');
  }
  this.length = view.readUInt16();
  this.table_id = view.readUInt8();
  util.pad(view, 1);
  this.match.fromView(view);
  this.duration_sec = view.readUInt32();
  this.duration_nsec = view.readUInt32();
  this.priority = view.readUInt16();
  this.idle_timeout = view.readUInt16();
  this.hard_timeout = view.readUInt16();
  util.pad(view, 6);
  this.cookie = view.readUInt64();
  this.packet_count = view.readUInt64();
  this.byte_count = view.readUInt64();
  this.actions = [];
  var actionsLen = this.length.value() - this.match.bytes() - 44;
  console.log('action len:', actionsLen, view.available());
  while(view.available() > actionsLen){
    var a = act.fromView(view);
    console.log(a);
    this.actions.push(a);
  }
  return this;
}; 

FlowRes.prototype.toView = function(view){
  if(view.available() < this.bytes()){
    throw util.Available('StatsReqFlowRes');
  }
  view.writeUInt16(this.length);
  view.writeUInt8(this.table_id);
  util.pad(view, 1);
  this.match.toView(view);
  view.writeUInt32(this.duration_sec);
  view.writeUInt32(this.duration_nsec);
  view.writeUInt16(this.priority);
  view.writeUInt16(this.idle_timeout);
  view.writeUInt16(this.hard_timeout);
  util.pad(view, 6);
  view.writeUInt64(this.cookie);
  view.writeUInt64(this.packet_count);
  view.writeUInt64(this.byte_count);
  _(this.actions).forEach(function(a){
    a.toView(view);
  }, this);
  return this;
};

exports.FlowRes = function(args) {
  var length        = null;
  var table_id      = null;
  var match         = null;
  var duration_sec  = null;
  var duration_nsec = null;
  var priority      = null;
  var idle_timeout  = null;
  var hard_timeout  = null;
  var cookie        = null;
  var packet_count  = null;
  var byte_count    = null;
  var actions       = [];
  if(args){
    length        = args.length        || uint.mk(2, 0);
    table_id      = args.table_id      || null;
    match         = args.match         || new mat.Match(); 
    duration_sec  = args.duration_sec  || null;
    duration_nsec = args.duration_nsec || null;
    priority      = args.priority      || null;
    idle_timeout  = args.idle_timeout  || null;
    hard_timeout  = args.hard_timeout  || null;
    cookie        = args.cookie        || null;
    packet_count  = args.packet_count  || null;
    byte_count    = args.byte_count    || null;
    actions       = args.actions       || [];
  }
  return new FlowRes(length, table_id, match, duration_sec, duration_nsec,
      priority, idle_timeout, hard_timeout, cookie, packet_count, byte_count, actions);
};

function AggregateReq(match, table_id, out_port){ 
  this.Type    = uint.mk(2, AggregateReq.Type); 
  this.match    = match    || new mat.Match();
  this.table_id = table_id || uint.mk(1, 0xff);
  this.out_port = out_port || uint.mk(2, PORTS['all']);
}
util.makePayload(AggregateReq, 2);

AggregateReq.prototype.bytes = function(){
  return uint.mk(2, 44);
};

AggregateReq.prototype.fromView = function(view){
  if(view.available() < this.bytes()){
   throw util.Available('StatsReqAggregateReq');
  }
  this.match.fromView(view);
  this.table_id = view.readUInt8();
  util.pad(view, 1);
  this.out_port = view.readUInt16();
 return this;
}; 

AggregateReq.prototype.toView = function(view){
  if(view.available() < this.bytes()){
    throw util.Available('StatsReqAggregateReq');
  }
  this.match.toView(view);
  view.writeUInt8(this.table_id);
  util.pad(view, 1);
  view.writeUInt16(this.out_port);
  return this;
};

exports.AggregateReq = function(args) {
  var match    = null;
  var table_id = null;
  var out_port = null;
  if(args){
    match    = args.match    || new mat.Match();
    table_id = args.table_id || uint.mk(1, 0xff);
    out_port = args.out_port || uint.mk(2, PORTS['all']);
  }
  return new AggregateReq(match, table_id, out_port);
};

function AggregateRes(packet_count, byte_count, flow_count){ 
  this.Type    = uint.mk(2, AggregateRes.Type); 
  this.packet_count = packet_count || null;
  this.byte_count   = byte_count   || null;
  this.flow_count   = flow_count   || null;
}
util.makePayload(AggregateRes, 2);

AggregateRes.prototype.bytes = function(){
  return uint.mk(2, 24);
};

AggregateRes.prototype.fromView = function(view){
  if(view.available() < this.bytes()){
   throw util.Available('StatsReqAggregateRes');
  }
  this.packet_count = view.readUInt64();
  this.byte_count   = view.readUInt64();
  this.flow_count   = view.readUInt32();
  util.pad(view, 4);
  return this;
}; 

AggregateRes.prototype.toView = function(view){
  if(view.available() < this.bytes()){
    throw util.Available('StatsReqAggregateRes');
  }
  view.writeUInt64(this.packet_count);
  view.writeUInt64(this.byte_count);
  view.writeUInt32(this.flow_count);
  util.pad(view, 4);
  return this;
};

exports.AggregateRes = function(args) {
  var packet_count = null;
  var byte_count   = null;
  var flow_count   = null;
  if(args){
    packet_count = args.packet_count || null;
    byte_count   = args.byte_count   || null;
    flow_count   = args.flow_count   || null;
  }
  return new AggregateRes(packet_count, byte_count, flow_count);
};

function PortReq(port_id){ 
  this.Type    = uint.mk(2, PortReq.Type); 
  this.port_id = port_id || uint.mk(2, PORTS['all']);
}
util.makePayload(PortReq, 4);

PortReq.prototype.bytes = function(){
  return uint.mk(2, 8);
};

PortReq.prototype.fromView = function(view){
  if(view.available() < this.bytes()){
   throw util.Available('StatsReqPortReq');
  }
  this.port_id = view.readUInt16();
  util.pad(view, 6);
  return this;
}; 

PortReq.prototype.toView = function(view){
  if(view.available() < this.bytes()){
    throw util.Available('StatsReqPortReq');
  }
  view.writeUInt16(this.port_id);
  util.pad(view, 6);
  return this;
};

exports.PortReq= function(args) {
  var port_id = null;
  if(args){
    port_id = args.port_id || uint.mk(2, PORTS['all']);
  }
  return new PortReq(port_id);
};

function PortRes(port_no, rx_pkts, tx_pkts, rx_bytes, tx_bytes, rx_dropped, tx_dropped,
    rx_errors, tx_errors, rx_frame_err, rx_over_err, rx_crc_err, collisions){
  this.Type    = uint.mk(2, PortRes.Type); 
  this.port_no = null;
  this.rx_pkts = rx_pkts || null;
  this.tx_pkts = tx_pkts || null;
  this.rx_bytes = rx_bytes || null;
  this.tx_bytes = tx_bytes || null;
  this.rx_dropped = rx_dropped || null;
  this.tx_dropped = tx_dropped || null;
  this.rx_errors  = rx_errors || null;
  this.tx_errors  = tx_errors || null;
  this.rx_frame_err = rx_frame_err || null;
  this.rx_over_err = rx_over_err || null;
  this.rx_crc_err  = rx_crc_err || null;
  this.collisions = collisions || null;
}
util.makePayload(PortRes, 4);

PortRes.prototype.bytes = function(){
  return uint.mk(2, 104);
};

PortRes.prototype.fromView = function(view){
  if(view.available() < this.bytes()){
   throw util.Available('StatsReqPortRes');
  }
  this.port_no  = view.readUInt16();
  util.pad(view, 6);
  this.rx_packets = view.readUInt64();
  this.tx_packets = view.readUInt64();
  this.rx_bytes = view.readUInt64();
  this.tx_bytes = view.readUInt64();
  this.rx_dropped = view.readUInt64();
  this.tx_dropped = view.readUInt64();
  this.rx_errors  = view.readUInt64();
  this.tx_errors  = view.readUInt64();
  this.rx_frame_err = view.readUInt64();
  this.rx_over_err = view.readUInt64();
  this.rx_crc_err  = view.readUInt64();
  this.collisions = view.readUInt64();
  return this;
}; 

PortRes.prototype.toView = function(view){
  if(view.available() < this.bytes()){
    throw util.Available('StatsReqPortRes');
  }
  view.writeUInt16(this.port_no);
  util.pad(view, 6);
  view.writeUInt64(this.rx_packets);
  view.writeUInt64(this.tx_packets);
  view.writeUInt64(this.rx_bytes);
  view.writeUInt64(this.tx_bytes);
  view.writeUInt64(this.rx_dropped);
  view.writeUInt64(this.tx_dropped);
  view.writeUInt64(this.rx_errors);
  view.writeUInt64(this.tx_errors);
  view.writeUInt64(this.rx_frame_err);
  view.writeUInt64(this.rx_over_err);
  view.writeUInt64(this.rx_crc_err);
  view.writeUInt64(this.collisions);
  return this;
};

exports.PortRes = function(args) {
  var port_no = null;
  var tx_packets = null;
  var rx_packets = null;
  var rx_bytes = null;
  var tx_bytes = null;
  var rx_dropped = null;
  var tx_dropped = null;
  var rx_errors = null;
  var tx_errors = null;
  var rx_frame_err = null;
  var rx_over_err = null;
  var rx_crc_err  = null;
  var collisions = null;
  if(args){
    port_no = args.port_no || null;
    tx_packets = args.tx_packets || null;
    rx_packets = args.rx_packets || null;
    rx_bytes = args.rx_bytes || null;
    tx_bytes = args.tx_bytes || null;
    rx_dropped = args.rx_dropped || null;
    tx_dropped = args.tx_dropped || null;
    rx_errors = args.rx_errors || null;
    tx_errors = args.tx_errors || null;
    rx_frame_err = args.rx_frame_err || null;
    rx_over_err = args.rx_over_err || null;
    rx_crc_err  = args.rx_crc_err || null;
    collisions = args.collisions || null;
  }
  return new PortRes(port_no, rx_packets, tx_packets, rx_bytes, tx_bytes, rx_dropped, tx_dropped,
      rx_errors, tx_errors, rx_frame_err, rx_over_err, rx_crc_err, collisions); 
};

function QueueReq(port_id, queue_id){ 
  this.Type     = uint.mk(2, QueueReq.Type); 
  this.port_id  = port_id  || uint.mk(2, PORTS['all']);
  this.queue_id = queue_id || uint.mk(4, 0xffffffff);
}
util.makePayload(QueueReq, 5);

QueueReq.prototype.bytes = function(){
  return uint.mk(2, 8);
};

QueueReq.prototype.fromView = function(view){
  if(view.available() < this.bytes()){
   throw util.Available('StatsReqQueueReq');
  }
  this.port_id = view.readUInt16();
  util.pad(view, 2);
  this.queue_id = view.readUInt32();
  return this;
}; 

QueueReq.prototype.toView = function(view){
  if(view.available() < this.bytes()){
    throw util.Available('StatsReqQueueReq');
  }
  view.writeUInt16(this.port_id);
  util.pad(view, 2);
  view.writeUInt32(this.queue_id);
  return this;
};

exports.QueueReq = function(args) {
  var port_id  = null;
  var queue_id = null;
  if(args){
    port_id = args.port_id   || uint.mk(2, PORTS['all']);
    queue_id = args.queue_id || uint.mk(4, 0xffffffff);
  }
  return new QueueReq(port_id, queue_id);
};

function QueueRes(length, queue_id, tx_bytes, tx_packets, tx_errors){ 
  this.Type     = uint.mk(2, QueueRes.Type); 
  this.length   = length || null;
  this.queue_id = queue_id || null;
  this.tx_bytes = tx_bytes || null;
  this.tx_packets = tx_packets || null;
  this.tx_errors = tx_errors || null;
}
util.makePayload(QueueRes, 5);

QueueRes.prototype.bytes = function(){
  return uint.mk(2, 32);
};

QueueRes.prototype.fromView = function(view){
  if(view.available() < this.bytes()){
   throw util.Available('StatsReqQueueRes');
  }
  this.length = view.readUInt16();
  util.pad(view, 2);
  this.queue_id = view.readUInt32();
  this.tx_bytes = view.readUInt64();
  this.tx_packets = view.readUInt64();
  this.tx_errors = view.readUInt64();
  return this;
}; 

QueueRes.prototype.toView = function(view){
  if(view.available() < this.bytes()){
    throw util.Available('StatsReqQueueRes');
  }
  view.writeUInt16(this.length);
  util.pad(view, 2);
  view.writeUInt32(this.queue_id);
  view.writeUInt64(this.tx_bytes);
  view.writeUInt64(this.tx_packets);
  view.writeUInt64(this.tx_errors);
  return this;
};

exports.QueueRes = function(args) {
  var length = null;
  var queue_id = null;
  var tx_bytes = null;
  var tx_packets = null;
  var tx_errors = null;
  if(args){
    length = args.length || null;
    queue_id = args.queue_id || null;
    tx_bytes = args.tx_bytes || null;
    tx_packets = args.tx_packets || null;
    tx_errors = args.tx_errors || null;
  }
  return new QueueRes(length, queue_id, tx_bytes, tx_packets, tx_errors);
};

function VendorReq(vendor_id, data){ 
  this.Type     = uint.mk(2, VendorReq.Type); 
  this.vendor_id = vendor_id || uint.mk(4, 0); 
  dt.Data.call(this, data);
}
util.makePayload(VendorReq, 0xffff);

VendorReq.prototype.bytes = function(){
  return uint.mk(2, 4 + dt.Data.prototype.bytes.call(this));
};

VendorReq.prototype.fromView = function(view){
  if(view.available() < this.bytes()){
   throw util.Available('StatsReqVendorReq');
  }
  this.vendor_id = view.readUInt32();
  dt.Data.prototype.fromView.call(this, view);
  return this;
}; 

VendorReq.prototype.toView = function(view){
  if(view.available() < this.bytes()){
    throw util.Available('StatsReqVendorReq');
  }
  view.writeUInt32(this.vendor_id);
  dt.Data.prototype.toView.call(this, view);
  return this;
};

exports.VendorReq = function(args) {
  var vendor_id = null;
  var data      = null;
  if(args){
    vendor_id = args.vendor_id || uint.mk(4, 0);
    data      = args.data || null;
  }
  return new VendorReq(vendor_id, data);
};

function VendorRes(vendor_id, data){ 
  this.Type     = uint.mk(2, VendorRes.Type); 
  this.vendor_id = vendor_id || uint.mk(4, 0); 
  dt.Data.call(this, data);
}
util.makePayload(VendorRes, 0xffff);

VendorRes.prototype.bytes = function(){
  return uint.mk(2, 4 + dt.Data.prototype.bytes.call(this));
};

VendorRes.prototype.fromView = function(view){
  if(view.available() < this.bytes()){
   throw util.Available('StatsReqVendorRes');
  }
  this.vendor_id = view.readUInt32();
  dt.Data.prototype.fromView.call(this, view);
  return this;
}; 

VendorRes.prototype.toView = function(view){
  if(view.available() < this.bytes()){
    throw util.Available('StatsReqVendorRes');
  }
  view.writeUInt32(this.vendor_id);
  dt.Data.prototype.toView.call(this, view);
  return this;
};

exports.VendorRes = function(args) {
  var vendor_id = null;
  var data      = null;
  if(args){
    vendor_id = args.vendor_id || uint.mk(4, 0);
    data      = args.data || null;
  }
  return new VendorRes(vendor_id, data);
};

function TableReq(){
  this.Type    = uint.mk(2, TableReq.Type);
}
util.makePayload(TableReq, 3);

TableReq.prototype.bytes = function(){
  return uint.mk(2, 4);
};

TableReq.prototype.fromView = function(view){
 util.pad(view, 4);
 return this;
}; 

TableReq.prototype.toView = function(view){
  util.pad(view, 4);
  return this;
};

exports.TableReq = function(args) {
  return new TableReq();
};

function TableRes(args){
  this.VERSION = uint.mk(1, 1);
  this.Type    = uint.mk(1, TableRes.Type);
  this.table_id      = null;
  this.active_count  = null;
  this.lookup_count  = null;
  this.matched_count = null;
  if(args){
    this.table_id      = args.table_id      || null;
    this.active_count  = args.active_count  || null;
    this.lookup_count  = args.lookup_count  || null;
    this.matched_count = args.matched_count || null;
  }
}
util.makePayload(TableRes, 3);

TableRes.prototype.bytes = function(){
  return uint.mk(2, 24);
};

TableRes.prototype.fromView = function(view){
  if(view.available() < this.bytes().value()){
   throw util.Available('StatsResTableRes');
  }
  this.table_id      = view.readUInt8();
  util.pad(view, 3);
  this.active_count  = view.readUInt32();
  this.lookup_count  = view.readUInt64();
  this.matched_count = view.readUInt64();
  return this;
}; 

TableRes.prototype.toView = function(view){
  if(view.available() < this.bytes()){
    throw util.Available('StatsResTableRes');
  }
  view.writeUInt8(this.table_id);
  util.pad(view, 3);
  view.writeUInt32(this.active_count);
  view.writeUInt64(this.lookup_count);
  view.writeUInt64(this.matched_count);
  return this;
};

exports.TableRes = function(args) {
  return new TableRes(args);
};

function TableFeatureReq(){
  this.Type    = uint.mk(2, TableFeatureReq.Type);
}
util.makePayload(TableFeatureReq, 0xc);

TableFeatureReq.prototype.bytes = function(){
  return uint.mk(2, 4);
};

TableFeatureReq.prototype.fromView = function(view){
 util.pad(view, 4);
 return this;
}; 

TableFeatureReq.prototype.toView = function(view){
  util.pad(view, 4);
  return this;
};

exports.TableFeatureReq = function(args) {
  return new TableFeatureReq();
};

function TableFeatureRes(){
  this.Type    = uint.mk(2, TableFeatureRes.Type);
}
util.makePayload(TableFeatureReq, 0xc);

TableFeatureRes.prototype.bytes = function(){
  var propBytes = 0;
  _(this.properties).forEach(function(p){
    propBytes += p.bytes().value();
  }, this);
  return uint.mk(2, 48 + propBytes);
};

TableFeatureRes.prototype.fromView = function(view){
  if(view.available() < this.bytes().value()){
    throw util.Available('TableFeatureRes');
  }
  this.tables = [];
  while(view.available()){
    var tblFeature = tblfeat.fromView(view);
    view.offset += tblFeature.bytes().value();
  };

  return this;
}; 


TableFeatureReq.prototype.toView = function(view){
  util.pad(view, 4);
  return this;
};

exports.TableFeatureReq = function(args) {
  return new TableFeatureReq();
};

var ReqType = util.makeIndex([
  DescriptionReq,
  //FlowReq,
  //AggregateReq,
  TableReq,
  TableFeatureReq
  //PortReq,
  //QueueReq,
  //VendorReq
]);
exports.ReqType = ReqType;

var ResType = util.makeIndex([
  DescriptionRes,
  //FlowRes,
  //AggregateRes,
  TableRes,
  TableFeatureRes
  //PortRes,
  //QueueRes,
  //VendorRes
]);
exports.ResType = ResType;

exports.fromView = function(view){
  return (new StatsReq()).fromView(view);
};

var toJSON = function(){
  return this;
};
DescriptionReq.prototype.toJSON = toJSON;
DescriptionRes.prototype.toJSON = toJSON;
FlowRes.prototype.toJSON = toJSON;
AggregateReq.prototype.toJSON = toJSON;
AggregateRes.prototype.toJSON = toJSON;
TableReq.prototype.toJSON = toJSON;
TableRes.prototype.toJSON = toJSON;
PortReq.prototype.toJSON = toJSON;
PortRes.prototype.toJSON = toJSON;
QueueReq.prototype.toJSON = toJSON;
QueueRes.prototype.toJSON = toJSON;
VendorReq.prototype.toJSON = toJSON;
VendorRes.prototype.toJSON = toJSON;
})();

