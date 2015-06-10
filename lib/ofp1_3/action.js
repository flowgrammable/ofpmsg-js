(function(){
var util = require('../util');
var uint = require('uint-js');
var _    = require('underscore');
var mat  = require('./match');

function bytes(){
  return new uint.UInt({bytes: 2, value: 4});
}

var Header = function(args){
  if(args){
    this.type = _(args.type).isFinite() ? args.type : null;
    this.length = args.length || bytes();
  } else {
    this.type = null;
    this.length = bytes();
  }
};
exports.Header = Header;

Header.prototype.isValid = function() {
  return this.length.value() >= 4;
};

Header.prototype.bytes = function(){
  return 4;
};

Header.prototype.fromView = function(view){
  if(view.available() < this.bytes()){
    throw util.Available('ActionHeader');
  }
  this.type   = view.readUInt16();
  this.length = view.readUInt16();
  if(!this.isValid()){
    throw 'Action Header Bad Length';
  }
  return this;
};

Header.prototype.toView = function(view){
  if(view.available() < this.bytes()){
    throw util.Available('ActionHeader');
  }
  view.writeUInt16(this.type);
  view.writeUInt16(this.length);
  return this;
};

function Action(args){
  this.header = null;
  this.payload = null;
  if(args){
    this.payload = args.payload || null;
    this.header  = args.header  || null;
  }
  if(this.header === null && this.payload){
    this.header = new Header({
      type: this.payload.Type,
      length: uint.mk(2, this.payload.bytes().value() + bytes().value())
    });
  } else if(this.header === null){
   this.header = new Header();
  }
} 

Action.prototype.toView = function(view){
  this.header.toView(view);
  this.payload.toView(view);
  return this;
};

Action.prototype.fromView = function(view){
  this.header.fromView(view);
  var payloadLength = this.header.length.value() - 4;
  this.payload = ActionVariant(Type)(this.header.type.value(), view.constrain(payloadLength));
  view.offset += this.payload.bytes().value();
  return this;
};

Action.prototype.bytes = function(){
  return uint.mk(2, 4 + this.payload.bytes().value());
};


var ActionVariant = function(Map){
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

function Output(port, max_len){
  this.Type    = uint.mk(1, Output.Type);
  this.port    = port    || uint.mk(4, 0xffffffff);
  this.max_len = max_len || uint.mk(2, 0xffff);
}
util.makePayload(Output, 0);

Output.prototype.bytes = function(){
  return uint.mk(2, 12);
};

Output.prototype.fromView = function(view){
  if(view.available() < this.bytes()){
   throw util.Available('OutputAction');
  }
 this.port    = view.readUInt32();
 this.max_len = view.readUInt16();
 util.pad(view, 6);
 //return this;
}; 

Output.prototype.toView = function(view){
  if(view.available() < this.bytes()){
    throw util.Available('OutputAction');
  }
  view.writeUInt32(this.port);
  view.writeUInt16(this.max_len);
  util.pad(view, 6);
  return this;
};

exports.Output = function(args) {
  var port    = null;
  var max_len = null;
  if(args){
    port    = args.port    || null;
    max_len = args.max_len || null;
  }
  return new Action({ payload: new Output(port, max_len) });
};

function SetField(oxm){
  this.Type    = uint.mk(1, SetField.Type);
  this.oxm     = oxm || new mat.OXM();
}
util.makePayload(SetField, 25);

SetField.prototype.bytes = function(){
  return uint.mk(2, 12);
};

SetField.prototype.fromView = function(view){
  if(view.available() < this.bytes()){
   throw util.Available('SetFieldAction');
  }
  this.oxm.fromView(view);
  var padBytes = this.oxm.bytes().value() % 8;
  util.pad(view, padBytes);
  return this;
}; 

SetField.prototype.toView = function(view){
  if(view.available() < this.bytes()){
    throw util.Available('SetField');
  }
  this.oxm.toView(view);
  var padBytes = this.oxm.bytes().value() % 8;
  util.pad(view, padBytes);
  return this;
};

exports.SetField = function(args) {
  var oxm = null;
  if(args){
    oxm = args.oxm || null;
  }
  return new Action({ payload: new SetField(oxm) });
};

var Type = util.makeIndex([
  Output,
  SetField
/*  SetVLANVID,
  SetVLANPCP,
  StripVLAN
  /*SetDLSrc,
  SetDLDst,
  SetNWSrc,
  SetNWDst,
  SetNWTos,
  SetTPSrc,
  SetTPDst,
  Enqueue,
  Vendor*/
]);
exports.Type = Type;

exports.fromTiny = function(a){
  //todo: rework
  switch(a.op){
    case 'set':
      var field = uint.mk(1, mat.OXM_FIELDS[a.protocol][a.field] << 1);
      var value = uint.mk(a.value._bytes, a.value._value);
      var length = uint.mk(1, a.value._bytes);
      var oxm = new mat.OXM(null, field, false, value, null, length);
      return new Action({ payload: new SetField(oxm) });
    default:
      break;
  }
};

exports.fromView = function(view){
  return (new Action()).fromView(view);
};

})();
