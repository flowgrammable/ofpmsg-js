(function() {

'use strict';

var Exports = {
  hdr:  require('./header'),
  msg:  require('./message'),
  view: require('./view')
};

var versions = require('./versions');
_(versions.Version).each(function(value, key) {
  Exports[key] = value;
});

module.exports = Exports;

})();
