(function() {

'use strict';

exports.Version = {
  "1.0": require('./ofp1_0'),
  "1.1": require('./ofp1_1'),
  "1.2": require('./ofp1_2'),
  "1.3": require('./ofp1_3'),
  "1.4": require('./ofp1_4'),
  "1.5": require('./ofp1_5'),
};

exports.makePayload = function(version) {
  var mod = _(Version).find(function(value) {
    return version === value.VERSION;
  });
  if(mod === null) {
    throw 'Bad version';
  }
  return mod.Payload
};

})();
