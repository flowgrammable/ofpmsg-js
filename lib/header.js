(function() {

'use strict';

var _    = require('underscore');
var util = require('./util');

function bytes() {
  return 8;
}

function Header(args) {
  if(args) {
    this.version = args.version || null;
    this.type    = args.type    || null;
    this.length  = args.length  || bytes();
    this.xid     = args.xid     || 0;
  } else {
    this.version = null;
    this.type    = null;
    this.length  = bytes();
    this.xid     = 0;
  }
}
exports.Header = function(args) {
  return new Header(args);
};

Header.prototype.isValid = function() {
  return this.length >= 8;
};

Header.prototype.bytes = bytes;

Header.prototype.toView = function(view) {
  if(!view.available(this.bytes())) {
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

  if(!this.isValid()) {
    throw 'Bad Length';
  }

  return this;
};

exports.bytes = bytes;

exports.fromView = function(view) {
  var result = new Header();
  return result.fromView(view);
};


})();
