(function(){
var util = require('../util');
var uint = require('uint-js');
var _    = require('underscore');
var act  = require('./action');

var OFP_INSTRUCTION_TYPE = {
  0x1: 'GOTO_TABLE',
  0x2: 'METADATA',
  0x3: 'WRITE_ACTIONS',
  0x4: 'APPLY_ACTIONS',
  0x5: 'CLEAR_ACTIONS',
  0x6: 'METER',
  0xfff: 'EXPERIMENTER'
};
exports.TYPES = OFP_INSTRUCTION_TYPE;

function bytes(){
  return new uint.UInt({bytes: 2, value: 4});
}

var Header = function(args){
  if(args){
    this.type = _(args.type).isFinite() ? args.type : null;
    this.length = args.length || bytes();
  } else {
    this.type = null;
    this.length = bytes();
  }
};
exports.Header = Header;

Header.prototype.isValid = function() {
  return this.length.value() >= 4;
};

Header.prototype.bytes = function(){
  return uint.mk(2, 4);
};

Header.prototype.fromView = function(view){
  console.log('ins header form view:', view);
  if(view.available() < this.bytes()){
    throw util.Available('InstructionHeader');
  }
  this.type    = view.readUInt16();
  this.length  = view.readUInt16();

  if(!this.isValid()){
    throw 'Instruction HEader Bad Length';
  }
  return this;
};

Header.prototype.toView = function(view){
  if(view.available() < this.bytes()){
    throw util.Available('InstructionHeader');
  }
  view.writeUInt16(this.type);
  view.writeUInt16(this.length);
  return this;
};

function Instruction(args){
  this.header = null;
  this.payload = null;
  if(args){
    this.payload = args.payload || null;
    this.header  = args.header  || null;
  }
  if(this.header === null && this.payload){
    this.header = new Header({
      type: this.payload.Type,
      length: uint.mk(2, this.payload.bytes().value() + bytes().value())
    });
  } else if(this.header === null){
   this.header = new Header();
  }
} 

Instruction.prototype.toView = function(view){
  this.header.toView(view);
  this.payload.toView(view);
  return this;
};

Instruction.prototype.fromView = function(view){
  this.header.fromView(view);
  var payloadLength = this.header.length.value() - 4;
  this.payload = InstructionVariant(Type)(this.header.type.value(), view.constrain(payloadLength));
  return this;
};

Instruction.prototype.bytes = function(){
  return uint.mk(2, 4 + this.payload.bytes().value());
};


var InstructionVariant = function(Map){
  return function(type, view){
    var result;
    var key = type.toString();
    if(_(Map).has(key)){
      result = new Map[key]();
      result.fromView(view);
      return result;
    } else {
      throw new Error('missing key');
    }
  };
};

function GOTO(table_id){
  this.Type     = uint.mk(1, GOTO.Type);
  this.table_id = table_id || uint.mk(1, 0x1);
}
util.makePayload(GOTO, 1);

GOTO.prototype.bytes = function(){
  return uint.mk(2, 4);
};

GOTO.prototype.fromView = function(view){
  if(view.available() < this.bytes()){
   throw util.Available('GOTO');
  }
 this.table_id = view.readUInt8();
 util.pad(view, 3);
 return this;
}; 

GOTO.prototype.toView = function(view){
  if(view.available() < this.bytes()){
    throw util.Available('GOTO');
  }
  view.writeUInt8(this.table_id);
  util.pad(view, 3);
  return this;
};

exports.GOTO = function(args) {
  var table_id = null;
  if(args){
    table_id = args.table_id || null;
  }
  return new Instruction({ payload: new GOTO(table_id) });
};

function APPLY_ACTIONS(actions){
  this.Type     = uint.mk(1, APPLY_ACTIONS.Type);
  this.actions = actions || [];
}
util.makePayload(APPLY_ACTIONS, 4);

APPLY_ACTIONS.prototype.bytes = function(){
  var actsLen = 0;
  _(this.actions).forEach(function(a){
    actsLen += a.bytes().value();
  }, this);
  return uint.mk(2, 4 + actsLen);
};

APPLY_ACTIONS.prototype.fromView = function(view){
  if(view.available() < this.bytes()){
    throw util.Available('APPLY_ACTIONS');
  }
  util.pad(view, 4); 
  this.actions = []; 
  while(view.offset !== view.buffer.length){
   var a = act.fromView(view);
   this.actions.push(a);
  }
  return this;
}; 

APPLY_ACTIONS.prototype.toView = function(view){
  if(view.available() < this.bytes()){
    throw util.Available('APPLY_ACTIONS');
  }
  util.pad(view, 4);
  _(this.actions).forEach(function(a){
    a.toView(view);
  }, this);
  return this;
};

exports.APPLY_ACTIONS = function(args) {
  var actions = null;
  if(args){
    actions = args.actions || null;
  }
  return new Instruction({ payload: new APPLY_ACTIONS(actions) });
};

var Type = util.makeIndex([
  GOTO,
  /*METADATA,
   *WRITE_ACTIONS,*/
   APPLY_ACTIONS
   /*CLEAR_ACTIONS,
   *METER*/ 
]); 
exports.Type = Type; 

exports.fromTiny = function(ins, insName){
  //todo: rework
  switch(insName){
    case 'apply':
      var applyActions = [];
      _(ins).forEach(function(a){
        applyActions.push(act.fromTiny(a));
      }, this);
      return new Instruction({ 
        payload: new APPLY_ACTIONS(applyActions)
      });
    case 'goto_':
       var tableValue = uint.fromJSON(ins);
       return new Instruction({
         payload: new GOTO(tableValue)
       });
    default:
       break;
  }
};

exports.fromView = function(view){
  return (new Instruction()).fromView(view);
};

})();
