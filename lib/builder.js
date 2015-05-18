(function() {

'use strict';

var _    = require('underscore');
var util = require('./util');

var hdr = require('./header');

function Builder() {
  this.header = null;
}

Builder.prototype.buildHeader = function(view) {
  if(!view.available(hdr.bytes())) {
    return ;
  }
  this.header        = hdr.fromView(view);
  this.payloadLength = this.header.length - 8;
};

Builder.prototype.buildPayload = function(view) {
  if(!view.available(this.payloadLength)) {
    return ;
  }
  this.payload = this.Payload(this.header.type, view.constrain(this.payloadLength));
};

Builder.prototype.fromView = function(view) {
  if(this.header === null) {
    this.buildHeader(view);
  } else {
    this.buildPayload(view);
  }
};

})();
