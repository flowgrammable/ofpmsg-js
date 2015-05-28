(function() {

'use strict';

var _  = require('underscore');
var uint = require('uint-js');
var util = require('./util');
var dt   = require('./data');
var msg  = require('./message');

var VERSION = uint.mk(1, 4);
exports.VERSION = VERSION;

function Hello(data){
  this.VERSION  = VERSION;
  this.Type     = uint.mk(1, Hello.Type);
  dt.Data.call(this, data);
}
util.makePayload(Hello, 0, dt.Data);

Hello.prototype.bytes = function(){
  return uint.mk(2, dt.Data.prototype.bytes.call(this));
};

exports.Hello = function(data){
  return msg.Message({ payload: new Hello(data) });
};

var Type = util.makeIndex([
  Hello
]);
exports.Type = Type;

exports.Payload = function() { 
  return util.Variant(Type); 
};

exports.fromView = function(view) {
  return msg.fromView(view, VERSION);
};

})();
