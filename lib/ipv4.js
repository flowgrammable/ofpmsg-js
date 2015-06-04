(function() {

'use strict';

var _ = require('underscore');
var uint = require('uint-js');

function Address(address) {
  if(address){
  } else {
    this.value = new uint.UInt({ bytes: 4 });
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
  this.value = view.readUInt32();
};

Address.prototype.toString = function(){
  return this.value.toString(16);
};

})();
