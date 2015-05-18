(function() {

'use strict';

var _ = require('underscore');

function Msg() {
}
exports.Msg = Msg;

Msg.prototype.bytes = function() {
  throw '*.bytes() Not Implemented';
};

Msg.prototype.fromTiny = function() {
  throw '*.fromTiny() Not Implemented';
};

Msg.prototype.toTiny = function() {
  throw '*.toTiny() Not Implemented';
};

Msg.prototype.fromView = function() {
  throw '*.fromView() Not Implemented';
};

Msg.prototype.toView = function() {
  throw '*.toView() Not Implemented';
};

exports.fromView = function(Type, view) {
  var result = new Type();
  return result.fromView(view);
};

function Data(data) {
  this.data = data || null;
}
exports.Data = Data;

Data.prototype.bytes = function() {
  return this.data ? this.data.length : 0;
};

Data.prototype.toView = function(view) {
  if(this.data) {
    view.write(this.data);
  }
};

Data.prototype.fromView = function(view) {
  this.data = view.read();
};

exports.Variant = function(Type) {
  return function(type, view) {
    var result;
    var key = type.toString();
    if(_(Type).has(key)) {
      // Return the actual type
      result = Type[key]();
      result.fromView(view);
      return result;
    } else {
      // Return a blob
      result = new Data();
      data.fromView(view);
      return result;
    }
  };
};

exports.makeIndex = function(Type) {
  var result = {};
  _(Type).each(function(value) {
    result[value.Type.toString()] = value;
  });
  return result;
};

function Available() {
}
function Undefined() {
}

})();
