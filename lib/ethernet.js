(function() {

'use strict';

var _ = require('underscore');
var uint = require('uint-js');

var Pattern = /^([a-fA-F0-9]{1,2})(-|:)([a-fA-F0-9]{1,2})(-|:)([a-fA-F0-9]{1,2})(-|:)([a-fA-F0-9]{1,2})(-|:)([a-fA-F0-9]{1,2})(-|:)([a-fA-F0-9]{1,2})$/;

function isMAC(str) {
  return Pattern.test(str);
}
  
function consMAC(str) {
  var tmp = str.match(macPattern);
  return _(_.range(6)).map(function(i) {
    return parseInt('0x'+tmp[2*i+1]);
  });
}

function MAC(value) {
  if(value){
    if(!isMAC(value)) {
      throw 'Not a MAC';
    }
    this._value = new uint.UInt({ bits: 48, value: consMAC(value) });
  } else {
    this._value = new uint.UInt({ bits: 48, value: [0,0,0,0,0,0] });
  }
}
exports.MAC = MAC;

MAC.prototype.bytes = function() {
  return 6;
};

MAC.prototype.toView = function(view) {
  view.writeBytes(this._value);
};

MAC.prototype.fromView = function(view) {
  this._value = view.readBytes(6);
};

MAC.prototype.toString = function() {
  var array = this._value.value();
  return array[0].toString(16) + ':' +
         array[1].toString(16) + ':' +
         array[2].toString(16) + ':' +
         array[3].toString(16) + ':' +
         array[4].toString(16) + ':' +
         array[5].toString(16);
};

})();
