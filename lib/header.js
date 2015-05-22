(function() {

'use strict';

var _    = require('underscore');
var util = require('./util');

function bytes() {
  return 8;
}

function Header(args) {
  if(args) {
    this.version = _(args.version).isFinite() ? args.version : null;
    this.type    = _(args.type).isFinite() ? args.type : null;
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

Header.prototype.fromView = function(view) {
  if(view.available() < this.bytes()) {
    throw util.Available('Header');
  }

  this.version = view.readUInt8();
  this.type    = view.readUInt8();
  this.length  = view.readUInt16();
  this.xid     = view.readUInt32();
  
  if(!this.isValid()) {
    throw 'Bad Length';
  }

  return this;
};

Header.prototype.toView = function(view) {
  if(view.available() < this.bytes()) {
    throw util.Available('Header');
  }
  
  view.writeUInt8(this.version);
  view.writeUInt8(this.type);
  view.writeUInt16(this.length);
  view.writeUInt32(this.xid);

  return this;
};

Header.prototype.toString = function() {
  return "v: " + this.version + ", t: " + this.type + ", l: " + this.length + 
         ", x: " + this.xid;
};

exports.bytes = bytes;

exports.fromView = function(view) {
  var result = new Header();
  return result.fromView(view);
};


})();
