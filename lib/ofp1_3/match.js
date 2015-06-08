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
  this.VERSION = uint.mk(1, 4);
  this.type   = type   || null;
  this.length = length || null;
  this.oxms   = oxms   || [];
}
exports.Match = Match;

Match.prototype.bytes = function(){
  var oxmbytes = 0; 
  _(this.oxms).forEach(function(o){
    oxmbytes += o.bytes().value();
  }, this);
  var padBytes = oxmbytes % 8;
  return uint.mk(2, 8 + oxmbytes + padBytes); 
}; 

Match.prototype.fromView = function(view){
  this.type   = view.readUInt16();
  this.length = view.readUInt16();
  util.pad(view, 4);
  this.oxms = [];
  
  // individual TLV header + payload
  var oxmView = view.constrain(this.length.value());
  while(oxmView.available()){
    var oxm = new OXM();
    oxm.fromView(oxmView);
    this.oxms.push(oxm);
  }
  // Padding
  view.advance(this.length.value());
  var extraPad = this.length.value() % 8;
  util.pad(view, extraPad);
  return this;
}; 

Match.prototype.toView = function(view){
  if(view.available() < this.bytes().value()){
    throw util.Available('Match');
  }
  view.writeUInt16(this.type);
  view.writeUInt16(this.length);
  util.pad(view, 4);
  _(this.oxms).forEach(function(o){
   o.toView(view);
  }, this);
  var extraPad = this.length.value() % 8;
  util.pad(view, extraPad); 
  return this;
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

function OXM(_class, field, has_mask, length){
  this._class   = _class   || null;
  this.field    = field    || null;
  this.has_mask = has_mask || null;
  this.length   = length   || null;
}
exports.OXM = OXM;

OXM.prototype.bytes = function(){
  return uint.mk(2, 4 + this.length.value());
};

OXM.prototype.toJSON = function(){
  return {
    _class: this._class.toString(),
    field:  this.field.toString(),
    hasMask: this.hasMask,
    length: this.length.toString(),
    payload: this.payload.toString()
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
  if(view.available() < this.length.value()){
    throw util.Available('OXM Payload' + this.field);
  }
  this.payload = view.readBytes(this.length.value());
  return this;
};

OXM.prototype.toView = function(view){
  view.writeUInt16(this._class);
  if(this.hasMask){
    view.writeUInt8(this.field.and(uint.mk(1, 1)));
  } else {
    view.writeUInt8(this.field);
  }
  view.writeUInt8(this.length);
  view.writeBytes(this.payload);
  return this;
};

})();
