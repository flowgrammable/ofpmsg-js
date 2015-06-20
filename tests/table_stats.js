(function(){
var ofp = require('../lib');
var uint = require('uint-js');
var view = ofp.view;
var ofp1_0 = ofp['1.0'];
var ofp1_3 = ofp['1.3'];
var stats = ofp1_0.STATS; 
var tblfeature = require('../lib/ofp1_3/table_features');

describe('table stats', function(){
  describe('table feature property', function(){
    it('fromView pass', function(){
      var buf = new Buffer([
        0,0,0,16,
        0,0,0,1,
        0,0,0,2,
        0,0,0,3
        ]);
      var v = new view.View(buf);
      var tblProp = new tblfeature.TableProperty().fromView(v);
      console.log(tblProp.toString());
    });
  });
  describe('table feature property', function(){
    it('fromView pass', function(){
      var buf = new Buffer([
        0,64,1,0,
        0,0,0,0,
        0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
        0,0,0,0,0,0,0,0,
        0,0,0,0,0,0,0,0,
        0,0,0,0,
        0,0,0,0,
        0,0,0,12,
        0,0,0,1,
        0,0,0,2,
        0,0,0,0
        ]);
      var v = new view.View(buf);
      var tableFeature1 = new tblfeature.TableFeature().fromView(v);

    });
    it('fromView pass multiple tables', function(){
      var buf = new Buffer([
        4,19,0,144,
        5,5,5,5,
        0,0xc,0,0,
        0,64,1,0,
        0,0,0,0,
        0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
        0,0,0,0,0,0,0,0,
        0,0,0,0,0,0,0,0,
        0,0,0,0,
        0,0,0,0,
        0,0,0,12,
        0,0,0,1,
        0,0,0,2,
        0,0,0,0,
        0,64,2,0,
        0,0,0,0,
        0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
        0,0,0,0,0,0,0,0,
        0,0,0,0,0,0,0,0,
        0,0,0,0,
        0,0,0,0,
        0,0,0,12,
        0,0,0,1,
        0,0,0,2,
        0,0,0,0
        ]);
      var v = new view.View(buf);
      var statsResMsg = ofp1_3.fromView(v);

    });
  });
});

})();
