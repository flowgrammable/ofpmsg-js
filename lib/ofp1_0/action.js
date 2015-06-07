(function(){
var util = require('../util');
var uint = require('uint-js');
var _    = require('underscore');
function Actions(){

}

Actions.prototype.fromView = function(view){
    
};

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
  this.type = view.readUInt16();
  this.length = view.readUInt16();

  if(!this.isValid()){
    throw 'Bad Length';
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
  return this;
};

Action.prototype.bytes = function(){
  return 4 + this.payload.bytes().value();
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
  this.port    = port    || uint.mk(2, 0xffff);
  this.max_len = max_len || uint.mk(2, 0xffff);
}
util.makePayload(Output, 0);

Output.prototype.bytes = function(){
  return uint.mk(2, 4);
};

Output.prototype.fromView = function(view){
  if(view.available() < this.bytes()){
   throw util.Available('OutputAction');
  }
 this.port = view.readUInt16();
 this.max_len = view.readUInt16();
 return this;
}; 

Output.prototype.toView = function(view){
  if(view.available() < this.bytes()){
    throw util.Available('OutputAction');
  }
  view.writeUInt16(this.port);
  view.writeUInt16(this.max_len);
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

function SetVLANVID(vlanvid){
  this.Type    = uint.mk(1, SetVLANVID.Type);
  this.vlanvid = vlanvid || null;
}
util.makePayload(SetVLANVID, 1);

SetVLANVID.prototype.bytes = function(){
  return uint.mk(2, 4);
};

SetVLANVID.prototype.fromView = function(view){
  if(view.available() < this.bytes()){
   throw util.Available('SetVLANVID');
  }
 this.vlanvid = view.readUInt16();
 util.pad(view, 2);
 return this;
}; 

SetVLANVID.prototype.toView = function(view){
  if(view.available() < this.bytes()){
    throw util.Available('SetVLANVid');
  }
  view.writeUInt16(this.vlanvid);
  util.pad(view, 2);
  return this;
};

exports.SetVLANVID = function(args) {
  var vlanvid = null;
  if(args){
    vlanvid = args.vlanvid || null;
  }
  return new Action({ payload: new SetVLANVID(vlanvid) });
};
var Type = util.makeIndex([
  Output,
  SetVLANVID
  /*SetVLANPCP,
  StripVLAN,
  SetDLSrc,
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
  if(a.protocol === 'internal' && a.op === 'set'){
    var PORTS = module.parent.exports.PORTS;
    var port = _(PORTS).has(a.value) ? PORTS[a.value] : a.value;
    return new Action({ payload: new Output(uint.mk(2, port)) });
  }
};

exports.fromView = function(view){
  return (new Action()).fromView(view);
};

})();
