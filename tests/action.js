(function(){
var expect = require('expect.js');
var ofp = require('../lib');
var uint = require('uint-js');
var view = ofp.view;
var of1_0 = ofp['1.0'];
var of1_3 = ofp['1.3'];
var a = of1_0.ACTION; 
var a3 = of1_3.ACTION;

describe('action', function(){
  describe('ofp 1.0', function(){
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
  describe('ofp 1.3', function(){
    it('no throw', function(){
      a3.Output();
    });
    it('from view', function(){
      //output action
      var buf = new Buffer([0,0,0,16,0,0,0,1,0,128,0,0,0,0,0,0]);
      var v = new view.View(buf);
      var o = a3.fromView(v);
      expect(o.bytes().value()).to.equal(16);
      expect(o.header.length.value()).to.equal(16);

      //set field action
      var buf2 = new Buffer([
        0,25,0,16,
        128,0,6,6,
        0,1,2,3,
        4,5,0,0]);
      var v2 = new view.View(buf2);
      var sf = a3.fromView(v2);
      expect(sf.bytes().value()).to.equal(16);
      expect(sf.header.length.value()).to.equal(16);
    });
    it('to view', function(){
      var oa = a3.Output(uint.mk(4, 0xffffffff), uint.mk(2, 0xffff));
      expect(oa.bytes().value()).to.equal(16);
      expect(oa.header.length.value()).to.equal(16);
      var buf = new Buffer(oa.bytes().value());
      var v = new view.View(buf);
      oa.toView(v);
    });
  });
});

})();
