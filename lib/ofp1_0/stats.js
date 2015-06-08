(function(){
var util = require('../util');
var dt   = require('../data');
var uint = require('uint-js');
var _    = require('underscore');
var mat  = require('./match');
var PORTS = require('./ports');

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
    case 0xffff:
      return true;
    default:
      return false;
  }
};

Header.prototype.bytes = function(){
  return uint.mk(2, 4);
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
  this.VERSION = uint.mk(1, 1); 
  this.Type    = uint.mk(1, 16); 
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
  this.VERSION = uint.mk(1, 1);
  this.Type    = uint.mk(2, 17);
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

function DescriptionReq(){ 
  this.Type    = uint.mk(2, DescriptionReq.Type); 
}
util.makePayload(DescriptionReq, 0);

DescriptionReq.prototype.bytes = function(){
  return uint.mk(2, 0);
};

DescriptionReq.prototype.fromView = function(view){
  if(view.available() < this.bytes()){
   throw util.Available('StatsReqDescriptionReq');
  }
 return this;
}; 

DescriptionReq.prototype.toView = function(view){
  if(view.available() < this.bytes()){
    throw util.Available('StatsReqDescriptionReq');
  }
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
  this.mfr_desc      = view.read(256);
  this.hw_desc       = view.read(256);
  this.sw_desc       = view.read(256);
  this.serial_num    = view.read(32);
  this.dp_desc       = view.read(256);
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

function FlowReq(match, table_id, out_port){ 
  this.Type    = uint.mk(2, FlowReq.Type); 
  this.match    = match    || new mat.Match();
  this.table_id = table_id || uint.mk(1, 0xff);
  this.out_port = out_port || uint.mk(2, PORTS['all']);
}
util.makePayload(FlowReq, 1);

FlowReq.prototype.bytes = function(){
  return uint.mk(2, 44);
};

FlowReq.prototype.toJSON = function(){
  return {
    match:    JSON.stringify(this.match.toString()),
    table_id: this.table_id.toString(),
    out_port: this.out_port.toString()
  };
};

FlowReq.prototype.fromView = function(view){
  if(view.available() < this.bytes()){
   throw util.Available('StatsReqFlowReq');
  }
  this.match.fromView(view);
  this.table_id = view.readUInt8();
  util.pad(view, 1);
  this.out_port = view.readUInt16();
 return this;
}; 

FlowReq.prototype.toView = function(view){
  if(view.available() < this.bytes()){
    throw util.Available('StatsReqFlowReq');
  }
  this.match.toView(view);
  view.writeUInt8(this.table_id);
  util.pad(view, 1);
  view.writeUInt16(this.out_port);
  return this;
};

exports.FlowReq = function(args) {
  var match    = null;
  var table_id = null;
  var out_port = null;
  if(args){
    match    = args.match    || new mat.Match();
    table_id = args.table_id || uint.mk(1, 0xff);
    out_port = args.out_port || uint.mk(2, PORTS['all']);
  }
  return new FlowReq(match, table_id, out_port);
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
  var queue_id = null;
  var data     = null;
  if(args){
    vendor_id = args.vendor_id || uint.mk(4, 0);
    data      = args.data || null;
  }
  return new VendorReq(vendor_id, data);
};

function TableReq(){
  this.Type    = uint.mk(2, TableReq.Type);
}
util.makePayload(TableReq, 3);

TableReq.prototype.bytes = function(){
  return uint.mk(2, 0);
};

TableReq.prototype.fromView = function(view){
 return this;
}; 

TableReq.prototype.toView = function(view){
  return this;
};

exports.TableReq = function(args) {
  return new TableReq();
};

function TableRes(args){
  this.VERSION = uint.mk(1, 1);
  this.Type    = uint.mk(1, TableRes.Type);
  this.table_id      = null;
  this.name          = null;
  this.wildcards     = null;
  this.max_entries   = null;
  this.active_count  = null;
  this.lookup_count  = null;
  this.matched_count = null;
  if(args){
    this.table_id      = args.table_id      || null;
    this.name          = args.name          || null;
    this.wildcards     = args.wildcards     || null;
    this.max_entries   = args.max_entries   || null;
    this.active_count  = args.active_count  || null;
    this.lookup_count  = args.lookup_count  || null;
    this.matched_count = args.matched_count || null;
  }
}
util.makePayload(TableRes, 3);

TableRes.prototype.bytes = function(){
  return uint.mk(2, 52);
};

TableRes.prototype.fromView = function(view){
  if(view.available() < this.bytes().value()){
   throw util.Available('StatsResTableRes');
  }
  this.table_id      = view.readUInt8();
  util.pad(view, 3);
  this.name          = view.read(32);
  this.wildcards     = view.readUInt32();
  this.max_entries   = view.readUInt32();
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
  view.writeBytes(this.name);
  view.writeUInt32(this.wildcards);
  view.writeUInt32(this.max_entries);
  view.writeUInt32(this.active_count);
  view.writeUInt64(this.lookup_count);
  view.writeUInt64(this.matched_count);
  return this;
};

exports.TableRes = function(args) {
  return new TableRes(args);
};


var ReqType = util.makeIndex([
  DescriptionReq,
  FlowReq,
  AggregateReq,
  TableReq,
  PortReq,
  QueueReq,
  VendorReq
]);
exports.ReqType = ReqType;

var ResType = util.makeIndex([
  DescriptionRes,
 /* Flow,
  Aggregate,*/
  TableRes
  /*Port,
  Queue,
  Vendor */
]);
exports.ResType = ResType;

exports.fromView = function(view){
  return (new StatsReq()).fromView(view);
};

var toJSON = function(){
  return this;
};
DescriptionReq.prototype.toJSON = toJSON;
AggregateReq.prototype.toJSON = toJSON;
TableReq.prototype.toJSON = toJSON;
PortReq.prototype.toJSON = toJSON;
QueueReq.prototype.toJSON = toJSON;
VendorReq.prototype.toJSON = toJSON;
})();
