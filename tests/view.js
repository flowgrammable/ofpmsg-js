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
    expect(v.constrain(10).available()).to.equal(14);
  });

});


})();
