(function() {

'use strict';

var _  = require('underscore');
var uint = require('uint-js');
var util = require('./util');
var dt   = require('./data');
var msg  = require('./message');

var VERSION = 4;
exports.VERSION = VERSION;

function Hello(data){
  this.VERSION  = VERSION;
  this.Type     = Hello.Type;
  dt.Data.call(this, data);
}
util.makePayload(Hello, 0, dt.Data);


exports.Hello = function(args){
  return msg.Message({ payload: new Hello() });
};

function HelloElement(type, length, data){
  this.type   = type || null;
  this.length = length || null;
}

HelloElement.prototype.bytes = function(){
  return 4 + this.length;
};

HelloElement.prototype.fromView = function(view){
  if(view.available() < this.bytes()){
    throw util.Available('Hello Element');
  }
  this.type   = view.readUInt16();
  this.length = view.readUInt16();
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
