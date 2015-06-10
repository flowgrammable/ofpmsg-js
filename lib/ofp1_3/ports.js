(function(){

var PORTS = {
  'in_port'   : 0xfffffff8,
  'table'     : 0xfffffff9,
  'normal'    : 0xfffffffa,
  'flood'     : 0xfffffffb,
  'all'       : 0xfffffffc,
  'controller': 0xfffffffd,
  'local'     : 0xfffffffe,
  'any'       : 0xffffffff
};
module.exports = PORTS;

})();
