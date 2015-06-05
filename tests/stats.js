(function(){
var ofp = require('../lib');
var uint = require('uint-js');
var view = ofp.view;
var ofp1_0 = ofp['1.0'];
var stats = ofp1_0.STATS; 

describe('stats', function(){
it('no throw', function(){
    stats.TableReq();
    var x = ofp1_0.StatsReq({ payload: stats.TableReq() });
    console.log('x:', x.bytes());
    var buf = new Buffer(12);
    var v = new view.View(buf);
    x.toView(v);
    console.log(v.buffer);
  });

/*  it('from view', function(){
    var buf = new Buffer([1,16,0,12,0,0,0,0,0,3,0,0]);
    var v = new view.View(buf);
    var msg = ofp1_0.fromView(v);
    console.log(msg);
  });*/

  it('from view', function(){
  });
});

})();
