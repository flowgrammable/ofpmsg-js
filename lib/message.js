(function() {

'use strict';

var _    = require('underscore');
var util = require('./util');

function Message() {
  util.Msg.call(this);
}
Message.prototype             = Object.create(util.Msg.prototype);
Message.prototype.constructor = Message;
module.exports                = Message;

})();
