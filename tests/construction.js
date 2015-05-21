(function() {
  
'use strict';

var ofp = require('../lib/index');
var view = ofp.view;

describe('No throw tests', function() {

  it('OFP 1.0', function() {
    var msg = ofp['1.0'];
    msg.Hello();
    msg.Error();
    msg.EchoReq();
    msg.Vendor();

    msg.Hello('aasdfsadf');
    msg.Error({
      type: 4,
      code: 6,
      data: 'aasdfasdf'
    });
    msg.EchoReq('yo');
    msg.EchoRes('bro');
    msg.Vendor({
      id: 1,
      data: 'secret stuff'
    });
  });

  it('OFP 1.1', function() {
    //FIXME
  });

  it('OFP 1.2', function() {
    //FIXME
  });

  it('OFP 1.3', function() {
    //FIXME
  });

  it('OFP 1.4', function() {
    //FIXME
  });

  it('OFP 1.5', function() {
    //FIXME
  });

});

describe('fromView tests', function() {
  
  it('OFP 1.0', function() {
    var b = new Buffer(32);
    b.fill(0);
    var v = new view.View(b);

    var msg = ofp["1.0"];
    var hello = msg.Error({ type: 1, code: 2, data: 'blah blah blah' });
    hello.toView(v);

    v.reset();
    // Version specific fromView
    var m1 = msg.fromView(v);
    v.reset();
    // General fromView
    var m2 = ofp.msg.fromView(v);
    v.reset();
    // General fromView with version called out
    var m3 = ofp.msg.fromView(v, msg.VERSION);

  });

  it('OFP 1.1', function() {
    //FIXME
  });

  it('OFP 1.2', function() {
    //FIXME
  });

  it('OFP 1.3', function() {
    //FIXME
  });

  it('OFP 1.4', function() {
    //FIXME
  });

  it('OFP 1.5', function() {
    //FIXME
  });

});

})();
