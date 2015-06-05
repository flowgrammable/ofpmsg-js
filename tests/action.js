(function(){
var ofp = require('../lib');
var uint = require('uint-js');
var view = ofp.view;
var of1_0 = ofp['1.0'];
var a = of1_0.ACTION; 

describe('action', function(){
  it('no throw', function(){
    a.Output();
    a.SetVLANVID();
  });

  it('from view', function(){
    var buf = new Buffer([0,0,0,8,0,1,0,1]);
    var v = new view.View(buf);
    var o = a.fromView(v);
    var buf2 = new Buffer(buf.length);
    var v2 = new view.View(buf2);
    o.toView(v2);
  });

  it('from view', function(){
    var buf2 = new Buffer(8);
    var v2 = new view.View(buf2);
    var o = a.Output({ port: uint.mk(2, 1), max_len: uint.mk(2, 1) });
    o.toView(v2);
  });
});

})();
