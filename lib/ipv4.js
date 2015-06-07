(function() {

'use strict';

var _ = require('underscore');
var uint = require('uint-js');

function Address(address) {
  if(address){
  } else {
    this._value = uint.mk(4, 0); //new uint.UInt({ bytes: 4 });
  }
}
exports.Address = Address;

Address.prototype.bytes = function(){
  return 4;
};

Address.prototype.toView = function(view){
  view.writeUInt32(this.value);
};

Address.prototype.fromView = function(view){
  this._value = view.readUInt32();
};

Address.prototype.toString = function(){
  return this._value.toString(16);
};

})();
