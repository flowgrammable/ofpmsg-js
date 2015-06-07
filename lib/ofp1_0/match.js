(function() {

'use strict';

var _    = require('underscore');
var uint = require('uint-js');
var util = require('../util');

var ethernet = require('../ethernet');
var ipv4     = require('../ipv4');

var Masks = {
  internal: {
    phy_port:  new uint.UInt({ bytes: 4, value: 0x00000001 })
  },
  ethernet: {
    vlan:  new uint.UInt({ bytes: 4, value: 0x00000002 }),
    src:   new uint.UInt({ bytes: 4, value: 0x00000004 }),
    dst:   new uint.UInt({ bytes: 4, value: 0x00000008 }),
    type:  new uint.UInt({ bytes: 4, value: 0x00000010 }),
    pcp:   new uint.UInt({ bytes: 4, value: 0x00100000 })
  },
  ipv4: {
    proto: new uint.UInt({ bytes: 4, value: 0x00000020 }),
    src:   new uint.UInt({ bytes: 4, value: 0x00000000 }),
    dst:   new uint.UInt({ bytes: 4, value: 0x00000000 }),
    tos:   new uint.UInt({ bytes: 4, value: 0x00200000 })
  },
  transport: {
    src:   new uint.UInt({ bytes: 4, value: 0x00000040 }),
    dst:   new uint.UInt({ bytes: 4, value: 0x00000080 })
  },
  all:      new uint.UInt({ bytes: 4, value: 0x003fffff })
};

function Match(args) {
  // Establish the default values
  this.wildcards = uint.mk(4, 0);
  this.internal = {
    phy_port: uint.mk(2, 0)
  };
  this.ethernet = {
    src: new ethernet.MAC(),
    dst: new ethernet.MAC(),
    vlan: uint.mk(2, 0), 
    pcp:  uint.mk(1, 0),
    type: uint.mk(2, 0) 
  };
  this.ipv4 = {
    tos: uint.mk(1, 0),
    proto: uint.mk(2, 0),
    src: new ipv4.Address(),
    dst: new ipv4.Address() 
  };
  this.transport = {
    src: uint.mk(2, 0),
    dst: uint.mk(2, 0)
  };
  // Establish any parameters that may have been passed
  _(args).each(function(protovalue, protokey) {
    _(protovalue).each(function(fieldvalue, fieldkey){
      this[protokey][fieldkey] = fieldvalue;
      this.wildcards.or(Masks[protokey][fieldkey]);
    }, this);
  }, this);
  if(!args){
    this.wildcards.or(Masks.all);
  }
  return this;
}
exports.Match = Match;

Match.prototype.fromJSON = function(matchSet){
  _(matchSet).forEach(function(m){
    if(m.protocol === 'ethernet' && (m.field === 'src' || m.field === 'dst')){
      this[m.protocol][m.field]._value = uint.fromJSON(m.value);
    } else if(m.protocol === 'ipv4' && (m.field === 'src' || m.field === 'dst')){
      this[m.protocol][m.field]._value = uint.fromJSON(m.value);
    } else {
      this[m.protocol][m.field] = uint.fromJSON(m.value);
    }
    this.wildcards.or(Masks[m.protocol][m.field]);
  }, this);
};

Match.prototype.toView = function(view) {
  if(view.available() < this.bytes()) {
    throw util.Available();
  }
  view.writeUInt32(this.wildcards);
  view.writeUInt16(this.internal.phy_port);
  view.writeBytes(this.ethernet.src._value);
  view.writeBytes(this.ethernet.dst._value);
  view.writeUInt16(this.ethernet.vlan);
  view.writeUInt8(this.ethernet.pcp);
  util.pad(view, 1);
  view.writeUInt16(this.ethernet.type);
  view.writeUInt8(this.ipv4.tos);
  view.writeUInt8(this.ipv4.proto);
  util.pad(view, 2);
  view.writeUInt32(this.ipv4.src._value);
  view.writeUInt32(this.ipv4.dst._value);
  view.writeUInt16(this.transport.src);
  view.writeUInt16(this.transport.dst);
};

Match.prototype.fromView = function(view) {
  if(view.available() < this.bytes()) {
    throw util.Available('Match');
  }
  this.wildcards = view.readUInt32();
  this.internal.phy_port = view.readUInt16();
  this.ethernet.src.fromView(view);
  this.ethernet.dst.fromView(view);
  this.ethernet.vlan= view.readUInt16();
  this.ethernet.pcp = view.readUInt8();
  util.pad(view, 1);
  this.ethernet.type = view.readUInt16();
  this.ipv4.tos = view.readUInt8();
  this.ipv4.proto = view.readUInt8();
  util.pad(view, 2);
  this.ipv4.src.fromView(view);
  this.ipv4.dst.fromView(view);
  this.transport.src = view.readUInt16();
  this.transport.dst = view.readUInt16();
};

Match.prototype.toString = function(){
  return {
    wildcards: this.wildcards.toString(16),
    in_port: this.internal.phy_port.toString(16),
    dl_src: this.ethernet.src.toString(16),
    dl_dst: this.ethernet.dst.toString(16),
    dl_vlan: this.ethernet.vlan.toString(16),
    dl_pcp: this.ethernet.pcp.toString(16),
    dl_type: this.ethernet.type.toString(16),
    nw_tos: this.ipv4.tos.toString(16),
    nw_proto: this.ipv4.proto.toString(16),
    nw_src: this.ipv4.src.toString(16),
    nw_dst: this.ipv4.dst.toString(16),
    tp_src: this.transport.src.toString(16),
    tp_dst: this.transport.dst.toString(16)
  };
};

Match.prototype.bytes = function(){
  return 40;
};


})();
