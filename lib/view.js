(function() {

'use strict';
var uint = require('uint-js');
var _    = require('underscore');

function View(buffer) {
  this.buffer = buffer;
  this.offset = 0;
}
exports.View = View;

View.prototype.advance = function(bytes) {
  return new View(this.buffer.slice(bytes));
};

View.prototype.constrain = function(bytes) {
  return new View(this.buffer.slice(this.offset, this.offset + bytes));
};

View.prototype.bytes = function() {
  return this.buffer.length;
};

View.prototype.reset = function() {
  this.offset = 0;
};

View.prototype.consumed = function() {
  return this.offset;
};

View.prototype.available = function() {
  return this.buffer.length - this.offset;
};

View.prototype.readUInt8 = function() {
  var result = new uint.UInt({bits: 8, value: this.buffer.readUInt8(this.offset)});
  this.offset += 1;
  return result;
};

View.prototype.writeUInt8 = function(value) {
  this.buffer.writeUIntBE(value.value(), this.offset, 1);
  this.offset += 1;
};

View.prototype.readUInt16 = function() {
  var result = new uint.UInt({ 
    bits: 16, 
    value: this.buffer.readUInt16BE(this.offset)
  });
  this.offset += 2;
  return result;
};

View.prototype.writeUInt16 = function(value) {
  this.buffer.writeUIntBE(value.value(), this.offset, 2);
  this.offset += 2;
};

View.prototype.readUInt32 = function() {
  var result = new uint.UInt({ 
    bits: 32,
    value: this.buffer.readUInt32BE(this.offset)
  });
  this.offset += 4;
  return result;
};

View.prototype.writeUInt32 = function(value) {
  this.buffer.writeUIntBE(value.value(), this.offset, 4);
  this.offset += 4;
};

View.prototype.readUInt64 = function(){
  var val = this.buffer.slice(this.offset, this.offset + 8).toJSON().data;
  var result = new uint.UInt({
    bits: 64,
    value: val
  });
  this.offset += 8;
  return result;
};

View.prototype.writeUInt64 = function(value){
  _(value.value()).forEach(function(v){
    this.buffer.writeUIntBE(v, this.offset, 1);
    this.offset++;
  }, this);
};

View.prototype.writeBytes = function(uint){
  _(uint.value()).forEach(function(v){
    this.buffer.writeUIntBE(v, this.offset, 1);
    this.offset++;
  }, this);
};

View.prototype.readBytes = function(bytes){
  var end = bytes ? this.offset + bytes : this.buffer.length;
  var result = this.buffer.slice(this.offset, end);
  this.offset += result.length;
  var val;
  if(result.length > 4){
    val = new uint.UInt({ bytes: result.length });
    val.value(result.toJSON().data);
  } else {
    var resStr = '0x';
    _(result.toJSON().data).forEach(function(r){
      resStr = resStr.concat(r.toString(16));
    }, this);
    val = new uint.UInt({ bytes: result.length });
    val._value = parseInt(resStr, 16);
  }
  return val ? val : null;
};


View.prototype.read = function(bytes) {
  var end = bytes ? this.offset + bytes : this.buffer.length;
  var result = this.buffer.slice(this.offset, end);
  this.offset += result.length;
  return result;
};

View.prototype.write = function(buffer) {
  buffer.copy(this.buffer, this.offset);
  this.offset += buffer.length;
};

})();
