(function() {

'use strict';

var _ = require('underscore');

var Exports = {
  hdr:  require('./header'),
  msg:  require('./message'),
  view: require('./view'),
  action: require('./action')
};

var versions = require('./versions');
_(versions.Version).each(function(value, key) {
  Exports[key] = value;
});
module.exports = Exports;

})();
