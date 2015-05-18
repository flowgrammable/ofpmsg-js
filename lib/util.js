(function() {

'use strict';

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

Data.prototype.bytes = function() {
  return this.data ? this.data.length; : 0;
};

Data.prototype.toView = function(view) {
  view.write(this.data);
};

Data.prototype.fromView = function(view) {
  this.data = view.read();
};

exports.Variant = function(Type) {
  return function(type, view) {
    var key = type.toString();
    if(_(Type).has(key)) {
      var result = Type[key]();
      result.fromView(view);
      return result;
    } else {
      throw 'Bad type';
    }
  };
};

function Available() {
}
function Undefined() {
}

})();
