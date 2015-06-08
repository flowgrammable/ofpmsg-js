(function(){
var expect = require('expect.js');
var ofp = require('../lib');
var uint = require('uint-js');
var view = ofp.view;
var ofp1_3 = ofp['1.3'];
var mat    = ofp1_3.MATCH; 

describe('match', function(){
  describe('1.3', function(){
    it('match set fromView', function(){
      var mt = new mat.Match();
      var buf = new Buffer([
        0, 1, 0, 10,       // type, length
        0, 0, 0, 0,       // pad
        128, 0, 6, 6,     // ofp tlv type, ethernet (no mask), length
        0, 1, 2, 3, 4, 5, // value
        0, 0              // padding
        ]);
      var v = new view.View(buf);
      var d = mt.fromView(v);
      expect(d.bytes().value()).to.equal(20);
    });
    it('match set toView', function(){
      var mt = new mat.Match();
      var buf = new Buffer([
        0, 1, 0, 16,       // type, length
        0, 0, 0, 0,       // pad
        128, 0, 7, 12,    // ofp tlv type, ethernet (no mask), length
        0, 1, 2, 3, 4, 5, // value
        1, 1, 1, 1, 1, 1  // mask
        ]);
      var v = new view.View(buf);
      var d = mt.fromView(v);
      expect(d.bytes().value()).to.equal(24);
      var b2 = new Buffer(d.bytes().value());
      var v2 = new view.View(b2);
      d.toView(v2);
    });
    it('oxm fromview toview', function(){
      var ox = new mat.OXM();
      var buf = new Buffer([
        128, 0, 6, 6,    // ofp tlv type, ethernet (no mask), length
        0, 1, 2, 3, 4, 5 // value
        ]);
      var v = new view.View(buf);
      ox.fromView(v);
      expect(ox.bytes().value()).to.equal(10);
      var b2 = new Buffer(ox.bytes().value());
      var v2 = new view.View(b2);
      ox.toView(v2);
    });
  });
});
})();
