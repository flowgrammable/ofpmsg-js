(function(){
var util = require('../util');
var uint = require('uint-js');
var _    = require('underscore');

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

Header.prototype.isValid = function(type){
  switch(type.value()){
    case 0x0:
    case 0x1:
    case 0x2:
    case 0x3:
    case 0x4:
    case 0x5:
    case 0xff:
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
 /* Flow,
  Aggregate,*/
  TableReq
  /*Port,
  Queue,
  Vendor */
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

})();
