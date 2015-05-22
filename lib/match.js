(function() {

'use strict';

var _    = require('underscore');
var uint = require('uint-js');

var ehternet = require('./ethernet');
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

})();
