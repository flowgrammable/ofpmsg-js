(function() {

'use strict';

var _ = require('underscore');

exports.makePayload = function(Class, type, Base) {
  // Set the payload type
  Class.Type = type;
  // Set the payload base object if appropriate
  if(Base) {
    Class.prototype = Object.create(Base.prototype);
    Class.prototype.constructor = Class;
  }
};

exports.fromView = function(Type, view) {
  var result = new Type();
  return result.fromView(view);
};

exports.makeIndex = function(Type) {
  var result = {};
  _(Type).each(function(value) {
    result[value.Type.toString()] = value;
  });
  return result;
};

exports.Variant = function(Map) {
  return function(type, view) {
    var result;
    var key = type.toString();
    if(_(Map).has(key)) {
      // Return the actual type
      result = new Map[key]();
      result.fromView(view);
      return result;
    } else {
      // Return a blob
      result = new Data();
      result.fromView(view);
      return result;
    }
  };
};

exports.Available = function(arg) {
  return arg;
};
function Undefined() {
}

})();
