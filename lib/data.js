(function() {

'use strict';

var _ = require('underscore');

function Data(data) {
  if(_(data).isString()) {
    this.data = new Buffer(data);
  } else {
    this.data = data || null;
  }
}
exports.Data = Data;

Data.prototype.bytes = function() {
  return this.data ? this.data.length : 0;
};

Data.prototype.toView = function(view) {
  if(this.data) {
    var buf = new Buffer(this.data);
    view.write(buf);
  }
};

Data.prototype.fromView = function(view) {
  this.data = view.read();
};

})();
