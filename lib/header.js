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
  if(view.avaiable(this.bytes()) {
    throw 'Not enough bytes';
  }

  this.version = view.readUInt8(0);
  this.type    = view.readUInt8(1);
  this.length  = view.readUInt16(2);
  this.xid     = view.readUInt32(4);
};

})();
