(function() {

'use strict';

var _    = require('underscore');
var util = require('./util');

function Header(args) {
  util.Base.call(this);
  if(args) {
  } else {
  }
}
Header.prototype             = Object.create(util.Msg.prototype);
Header.prototype.constructor = Header;
module.exports               = Header;

Header.prototype.bytes = function() {
  return 8;
};

Header.prototype.toView = function(view) {
  if(!view.avaiable(this.bytes())) {
    throw util.Available('Header');
  }

  this.version = view.readUInt8();
  this.type    = view.readUInt8();
  this.length  = view.readUInt16();
  this.xid     = view.readUInt32();

  return this;
};

Header.prototype.fromView = function(view) {
  if(!view.available(this.bytes())) {
    throw util.Available('Header');
  }
  
  view.writeUInt8(this.version);
  view.writeUInt8(this.type);
  view.writeUInt16(this.length);
  view.writeUInt32(this.xid);

  return this;
};

exports.bytes = function() { 
  return 8; 
};

exports.fromView = function(view) {
  var result = new hdr.Header();
  return result.fromView(view);
};

})();
