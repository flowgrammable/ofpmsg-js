(function() {
  
'use strict';

var ofp = require('../lib/index');
var view = ofp.view;
var Message = ofp.msg;
var expect = require('expect.js');

describe('view', function() {

  it('advance', function() {
    var buf = new Buffer(24);
    var v   = new view.View(buf);
    expect(v.available()).equal(24);
    expect(v.advance(12).available()).to.equal(12);
    expect(v.advance(24).available()).to.equal(0);
  });

  it('constrain', function(){
    var buf = new Buffer(24);
    var v   = new view.View(buf);
    expect(v.available()).to.equal(24);
    expect(v.constrain(10).available()).to.equal(10);
  });

  it('toView', function(){
    var msg = ofp['1.0'];
    var fr = msg.FeatureReq();
    var buf = new Buffer(fr.bytes().value());
    var v = new view.View(buf);
    var x = fr.toView(v);
    expect(v.available()).to.equal(0);

    var he = msg.Hello();
    var buf2 = new Buffer(he.bytes().value());
    var v2 = new view.View(buf2);
    he.toView(v2);
    
    var er = msg.EchoRes();
    var buf3 = new Buffer(he.bytes().value());
    var v3 = new view.View(buf3);
    er.toView(v3);
  });

  it('data toView', function(){
    var buf = new Buffer(24);
    var v = new view.View(buf);
    v.read(24);
    console.log(v.buffer);
    console.log(buf);
    expect(v.available()).to.equal(0);
    var buf2 = new Buffer(24);
    var v2 = new view.View(buf2);
    v.write(v2.buffer);
  });
});


})();
