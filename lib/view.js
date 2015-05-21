(function() {

'use strict';

function View(buffer) {
  this.buffer = buffer;
  this.offset = 0;
}
exports.View = View;

View.prototype.advance = function(bytes) {
  return new View(this.buffer.slice(bytes));
};

View.prototype.constrain = function(bytes) {
  return new View(this.buffer.slice(this.offset, this.buffer.length - bytes));
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
  var result = this.buffer.readUInt8(this.offset);
  this.offset += 1;
  return result;
};

View.prototype.writeUInt8 = function(value) {
  this.buffer.writeUIntBE(value, this.offset, 1);
  this.offset += 1;
};

View.prototype.readUInt16 = function() {
  var result = this.buffer.readUInt16BE(this.offset);
  this.offset += 2;
  return result;
};

View.prototype.writeUInt16 = function(value) {
  this.buffer.writeUIntBE(value, this.offset, 2);
  this.offset += 2;
};

View.prototype.readUInt32 = function() {
  var result = this.buffer.readUInt32BE(this.offset);
  this.offset += 4;
  return result;
};

View.prototype.writeUInt32 = function(value) {
  this.buffer.writeUIntBE(value, this.offset, 4);
  this.offset += 4;
};

View.prototype.read = function() {
  var result = this.buffer.slice(this.offset);
  this.offset += result.length;
  return result;
};

View.prototype.write = function(buffer) {
  buffer.copy(this.buffer, this.offset);
  this.offset += buffer.length;
};

})();
