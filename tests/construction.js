(function() {
  
'use strict';

var ofp = require('../lib/index');

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
    //FIXME
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
