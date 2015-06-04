(function() {

'use strict';

var _    = require('underscore');
var uint = require('uint-js');
var util = require('./util');

var ethernet = require('./ethernet');
var ipv4     = require('./ipv4');

var Masks = {
  in_port:  new uint.UInt({ bytes: 4, value: 0x00000001 }),
  dl_vlan:  new uint.UInt({ bytes: 4, value: 0x00000002 }),
  dl_src:   new uint.UInt({ bytes: 4, value: 0x00000004 }),
  dl_dst:   new uint.UInt({ bytes: 4, value: 0x00000008 }),
  dl_type:  new uint.UInt({ bytes: 4, value: 0x00000010 }),
  nw_proto: new uint.UInt({ bytes: 4, value: 0x00000020 }),
  tp_src:   new uint.UInt({ bytes: 4, value: 0x00000040 }),
  tp_dst:   new uint.UInt({ bytes: 4, value: 0x00000080 }),
  nw_src:   new uint.UInt({ bytes: 4, value: 0x00000000 }),
  nw_dst:   new uint.UInt({ bytes: 4, value: 0x00000000 }),
  dl_pcp:   new uint.UInt({ bytes: 4, value: 0x00100000 }),
  nw_tos:   new uint.UInt({ bytes: 4, value: 0x00200000 }),
  all:      new uint.UInt({ bytes: 4, value: 0x003fffff })
};

function Match(args) {
  // Establish the default values
  this.wildcards = new uint.UInt({ bytes: 4 });
  this.in_port   = new uint.UInt({ bytes: 2 });
  this.dl_src    = new ethernet.MAC();
  this.dl_dst    = new ethernet.MAC();
  this.dl_vlan   = new uint.UInt({ bytes: 2 });
  this.dl_pcp    = new uint.UInt({ bytes: 1 });
  this.dl_type   = new uint.UInt({ bytes: 2 });
  this.nw_tos    = new uint.UInt({ bytes: 1 });
  this.nw_proto  = new uint.UInt({ bytes: 1 });
  this.nw_src    = new ipv4.Address();
  this.nw_dst    = new ipv4.Address();
  this.tp_src    = new uint.UInt({ bytes: 2 });
  this.tp_dst    = new uint.UInt({ bytes: 2 });
  // Establish any parameters that may have been passed
  _(args).each(function(value, key) {
    if(_(this).has(key)) {
      if(value === '*') {
        this.wildcards.or(Masks[key]);
      } else if(/\//.test(value)) {
        var match = value.splict('/');
        this[key].value(match[0]);
        this.wildcards.or();
      } else {
        this[key].value(value);
      }
    }
  });
}
exports.Match = Match;

Match.prototype.toView = function(view) {
  if(view.available() < this.bytes()) {
    throw util.Available();
  }
  view.writeUInt32(this.wildcards);
  view.writeUInt16(this.in_port);
  this.dl_src.toView(view);
  this.dl_dst.toView(view);
  view.writeUInt16(this.dl_vlan);
  view.writeUInt8(this.dl_pcp);
  util.pad(view, 1);
  view.writeUInt16(this.dl_type);
  view.writeUInt8(this.nw_tos);
  view.writeUInt8(this.nw_proto);
  util.pad(view, 2);
  this.nw_src.toView(view);
  this.nw_dst.toView(view);
  view.writeUInt16(this.tp_src);
  view.writeUInt16(this.tp_dst);
};

Match.prototype.fromView = function(view) {
  if(view.available() < this.bytes()) {
    throw util.Available('Match');
  }
  this.wildcards = view.readUInt32();
  this.in_port  = view.readUInt16();
  this.dl_src.fromView(view);
  this.dl_dst.fromView(view);
  this.dl_vlan = view.readUInt16();
  this.dl_pcp = view.readUInt8();
  util.pad(view, 1);
  this.dl_type = view.readUInt16();
  this.nw_tos = view.readUInt8();
  this.nw_proto = view.readUInt8();
  util.pad(view, 2);
  this.nw_src.fromView(view);
  this.nw_dst.fromView(view);
  this.tp_src = view.readUInt16();
  this.tp_dst = view.readUInt16();
};

Match.prototype.toString = function(){
  return {
    wildcards: this.wildcards.toString(16),
    in_port: this.in_port.toString(16),
    dl_src: this.dl_src.toString(16),
    dl_dst: this.dl_dst.toString(16),
    dl_vlan: this.dl_vlan.toString(16),
    dl_pcp: this.dl_pcp.toString(16),
    dl_type: this.dl_type.toString(16),
    nw_tos: this.nw_tos.toString(16),
    nw_proto: this.nw_proto.toString(16),
    nw_src: this.nw_src.toString(16),
    nw_dst: this.nw_dst.toString(16),
    tp_src: this.tp_src.toString(16),
    tp_dst: this.tp_dst.toString(16)
  };
};

Match.prototype.bytes = function(){
  return 40;
};


})();
