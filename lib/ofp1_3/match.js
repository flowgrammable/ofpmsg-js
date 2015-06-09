(function() {

'use strict';

var _    = require('underscore');
var uint = require('uint-js');
var util = require('../util');

var ethernet = require('../ethernet');
var ipv4     = require('../ipv4');

var OFP_MATCH_TYPE = {
  0: 'OFPMT_STANDARD',
  1: 'OFPMT_OXM'
};

var OXM_CLASS = {
  0x0000: 'OFPXMC_NXM_0',
  0x0001: 'OFPXMC_NXM_1',
  0x8000: 'OFPXMC_OPENFLOW_BASIC',
  0xFFFF: 'OFPXMC_EXPERIMENTER'
};

function Match(type, length, oxms){
  this.type   = type   || null;
  this.length = length || null;
  this.oxms   = oxms   || [];
}
exports.Match = Match;

Match.prototype.bytes = function(){
  var pad =  8 - (this.length.value() % 8);
  if(pad === 8){
    pad = 0;
  }
  return uint.mk(2, this.length.value() + pad); 
}; 

Match.prototype.fromView = function(view){
  this.type   = view.readUInt16();
  this.length = view.readUInt16();
  this.oxms = [];

  var n = this.length.value() - 4;
  if(n === 0){
    util.pad(view, 4);
    return this;
  } else {
    var oxmView = view.constrain(n);
    while(oxmView.offset !== n){
      this.oxms.push(new OXM().fromView(oxmView));
    }
    // Padding
    var extraPad = 8 - (this.length.value() % 8);
    if(extraPad === 8){
      return this;
    } else {
      util.pad(view, 8);
      return this;
    }
  }
}; 

Match.prototype.toView = function(view){
  if(view.available() < this.bytes().value()){
    throw util.Available('Match');
  }
  view.writeUInt16(this.type);
  view.writeUInt16(this.length);
  _(this.oxms).forEach(function(o){
   o.toView(view);
  }, this);
  var extraPad = 8 - (this.length.value() % 8);
  if(extraPad === 8){
    return this;
  } else {
    util.pad(view, extraPad); 
    return this;
  }
};

Match.prototype.toJSON = function(){
  return {
    type: this.type.value(),
    length: this.length.value(),
    oxms: _(this.oxms).map(function(o){
        return o.toJSON();
    }, this)
  };
};

function OXM(_class, field, hasMask, length){
  this._class   = _class   || null;
  this.field    = field    || null;
  this.hasMask  = hasMask   || null;
  this.length   = length   || null;
  return this;
}
exports.OXM = OXM;

OXM.prototype.bytes = function(){
  return uint.mk(2, 4 + this.length.value());
};

OXM.prototype.toJSON = function(){
  return {
    _class: this._class.toString(16),
    field:  this.field.toString(16),
    hasMask: this.hasMask,
    length: this.length.toString(16),
    payload: this.payload.toString(16)
  };
};

OXM.prototype.fromView = function(view){
  this._class = view.readUInt16();
  this.field  = view.readUInt8();
  if(this.field.value() & 0x1){
    this.hasMask = true;
  } else {
    this.hasMask = false;
  }
  this.field = this.field.rshift(1);
  this.length = view.readUInt8();
  this.payload = view.readBytes(this.length.value());
  return this;
};

OXM.prototype.toView = function(view){
  view.writeUInt16(this._class);
  if(this.hasMask){
    this.field._value = (this.field._value << 1 ) | this.hasMask;
    view.writeUInt8(this.field);
  } else {
    view.writeUInt8(this.field);
  }
  view.writeUInt8(this.length);
  view.writeBytes(this.payload);
  return this;
};

})();
