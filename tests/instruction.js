(function(){
var expect = require('expect.js');
var ofp = require('../lib');
var uint = require('uint-js');
var view = ofp.view;
var of1_3 = ofp['1.3'];
var ins = of1_3.INSTRUCTION; 

describe('Instruction', function(){
  describe('1.3', function(){
    it('no throw', function(){
      ins.GOTO();
    });
    it('from view', function(){
      var buf = new Buffer([0,1,0,8,1,0,0,0]);
      var v = new view.View(buf);
      var gt = ins.fromView(v);

      var buf2 = new Buffer([
        0,4,0,24,
        0,0,0,0,
        0,0,0,16,
        0,0,0,1,
        0,1,0,0,
        0,0,0,0
      ]);
      var v2 = new view.View(buf2);
      var apply_outpu = ins.fromView(v2);
    });
    it('to view', function(){
      var gt = new ins.GOTO(uint.mk(1, 1));
      expect(gt.bytes().value()).to.equal(8);
      var buf = new Buffer(gt.bytes().value());
      var v = new view.View(buf);
      gt.toView(v);

    });
  });
});

})();
