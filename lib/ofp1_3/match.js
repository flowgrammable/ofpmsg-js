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
exports.MATCHTYPE = OFP_MATCH_TYPE;

var OXM_CLASS = {
  0x0000: 'OFPXMC_NXM_0',
  0x0001: 'OFPXMC_NXM_1',
  0x8000: 'OFPXMC_OPENFLOW_BASIC',
  0xFFFF: 'OFPXMC_EXPERIMENTER'
};

function Match(type, length, oxms){
  this.type   = type   || null;
  this.length = length || uint.mk(2, 4);
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
      var tmp = new OXM().fromView(oxmView);
      this.oxms.push(tmp);
    }
    view.offset += n;
    // Padding
    var extraPad = 8 - (this.length.value() % 8);
    if(extraPad === 8){
      return this;
    } else {
      util.pad(view, extraPad);
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

Match.prototype.fromTiny = function(matchSet){
  this.type = uint.mk(2, 1);
  this.length = uint.mk(2, 4);
  _(matchSet).forEach(function(m){
    var hasMask = m.mask ? true : false;
    var len = hasMask ? (m.value._bytes * 2) : m.value._bytes;
    var mask = hasMask ? uint.copy(m.mask) : null;
    var o = new OXM(
      uint.mk(2, 0x8000),
      uint.mk(1, OXM_FIELDS[m.protocol][m.field]),
      hasMask,
      uint.copy(m.value),
      mask,
      uint.mk(1, len)
      );
    this.length._value += o.bytes().value();
    this.oxms.push(o);
   }, this);        
  return this;
};

function OXM(_class, field, hasMask, value, mask, length){
  this._class   = _class   || uint.mk(2, 0x8000);
  this.field    = field    || null;
  this.hasMask  = hasMask  || false;
  this.length   = length   || uint.mk(1, 0);
  this.value    = value    || null;
  this.mask     = mask     || null;
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
    value: this.value.toString(16),
    mask: this.mask ? this.mask.toString(16) : null
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
  this.length = view.readUInt8();
  if(this.hasMask){
    var tmp = this.length.value() / 2;
    this.value = view.readBytes(tmp);
    this.mask  = view.readBytes(tmp);
  } else {
    this.value = view.readBytes(this.length.value());
    this.mask  = null;
  }
  return this;
};

OXM.prototype.toView = function(view){
  view.writeUInt16(this._class);
  if(this.hasMask){
    this.field._value = ( this.field._value << 1 ) | 1;
  } 
    view.writeUInt8(this.field);
    view.writeUInt8(this.length);
  if(this.hasMask){
    view.writeBytes(this.value);
    view.writeBytes(this.mask);
  } else {
    view.writeBytes(this.value);
  }
  return this;
};

var OXM_FIELDS = {
  internal: {
      in_port: 0,
      phy_port: 1
  },
  ethernet: {
      dst: 3,
      src: 4,
      type: 5
  },
  ipv4: {
      src: 11,
      dst: 12,
      proto: 10
        }
};
exports.OXM_FIELDS = OXM_FIELDS;

})();
