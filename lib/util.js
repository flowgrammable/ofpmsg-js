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

})();
