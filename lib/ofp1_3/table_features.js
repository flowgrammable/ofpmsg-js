(function(){
var _    = require('underscore');
var uint = require('uint-js');
var util = require('../util');
var ins  = require('./instruction');
var insTypes = ins.TYPES;


function TableFeature(){
  return this;
};
exports.TableFeature = TableFeature;

TableFeature.prototype.bytes = function(){
  var propBytes = 0;
  _(this.properties).forEach(function(p){
    propBytes += p.bytes().value();
  }, this);
  return uint.mk(2, 48 + propBytes);
};

TableFeature.prototype.fromView = function(view){
  this.length         = view.readUInt16();
  this.table_id       = view.readUInt8();
  util.pad(view, 5);
  this.name           = view.readBytes(16);
  this.metadata_match = view.readUInt64();
  this.metadata_write = view.readUInt64();
  this.config         = view.readUInt32();
  this.max_entries    = view.readUInt32();
  this.properties = [];
  while(view.available()){
    var prop = new TableProperty().fromView(view);
    view.offset += prop.bytes().value();
  }
  return this;
};

exports.fromView = function(view){
  var structLen = uint.mk(2, view.buffer.slice(view.offset, view.offset + 1));
  var cview = view.constrain(structLen.value());
  return new TableFeature().fromView(cview);
};

function TableProperty(){
  return this;
}
exports.TableProperty = TableProperty;

TableProperty.prototype.toString = function(){
  var that = this;
  switch(this.type._value){
    case 0x0:
    case 0x1:
      return _(that.payload).map(function(insType){
        return insTypes[insType._value];
      });
    default:
      return '';
  }
};

TableProperty.prototype.fromView = function(view){
  this.type = view.readUInt16();
  this.length = view.readUInt16();
  var payloadView = view.constrain(this.length.value());
  this.payload = [];
  while(payloadView.available()){
    switch(this.type._value){
      case 0x0:
      case 0x1:
        var insId = payloadView.readUInt32();
        this.payload.push(insId);
        break;
      case 0x4:
      case 0x5:
      case 0x6:
      case 0x7:
        var actId = payloadView.readUInt32();
        this.payload.push(actId);
      default:
        break;
    }
  }
  return this;
};

TableProperty.prototype.bytes = function(){
  return uint.mk(2, this.length.value());
};

function Header(type, length){
  this.type   = type || uint.mk(2, 0);
  this.length = length || uint.mk(2, 0);
}

})();
