(function(){
var path = require('path');
var fs = require('fs');
var bt = require('buffertools');
var expect = require('expect.js');
var ofp = require('../lib');
var uint = require('uint-js');
var view = ofp.view;
var ofp1_3 = ofp['1.3'];
var mat    = ofp1_3.MATCH; 
var Message = ofp.msg;

describe('match', function(){
  describe('1.3', function(){
    it('tiny construction no mask', function(){
      var tMatch = [{
        protocol: 'ethernet',
        field: 'src',
        value: {
          _value: [0, 0, 0, 0, 0, 0],
          _bytes: 6,
          _bits: 0
        }
      }];
      var m = new mat.Match();
      m.fromTiny(tMatch);
      expect(m.type.toString(16)).to.equal('0x0001');
      expect(m.length.toString(16)).to.equal('0x000e');
      expect(m.oxms[0]._class.toString(16)).to.equal('0x8000');
      expect(m.oxms[0].field.toString(16)).to.equal('0x04');
      expect(m.oxms[0].hasMask).to.equal(false);
      expect(m.oxms[0].length.toString(16)).to.equal('0x06');
      expect(m.bytes().value()).to.equal(16);
      var buf = new Buffer(m.bytes().value());
      var v = new view.View(buf);
      m.toView(v);

    });
    it('tiny construction mask', function(){
      var tMatch = [{
        protocol: 'ethernet',
        field: 'src',
        value: {
          _value: [0, 0, 0, 0, 0, 0],
          _bytes: 6,
          _bits: 0
        },
        mask: {
          _value: [1, 1, 1, 1, 1, 1],
          _bytes: 6,
          _bits: 0
       }
      }];
      var m = new mat.Match();
      m.fromTiny(tMatch);
      expect(m.type.toString(16)).to.equal('0x0001');
      expect(m.length.toString(16)).to.equal('0x0014');
      expect(m.oxms[0]._class.toString(16)).to.equal('0x8000');
      expect(m.oxms[0].field.toString(16)).to.equal('0x04');
      expect(m.oxms[0].hasMask).to.equal(true);
      expect(m.oxms[0].length.toString(16)).to.equal('0x0c');
      expect(m.bytes().value()).to.equal(24);
      var buf = new Buffer(m.bytes().value());
      var v = new view.View(buf);
      m.toView(v);

    });
    it('match struct zero OXM TLVs fromView', function(){
      var buf = new Buffer([
        0, 1, 0, 4,
        0, 0, 0, 0
        ]);
      var mt = new mat.Match();
      var v = new view.View(buf);
      mt.fromView(v);
      expect(mt.bytes().value()).to.equal(8);
    });
    it('match struct zero OXM TLVs toView', function(){
      var buf = new Buffer([
        0, 1, 0, 4,
        0, 0, 0, 0
        ]);
      var mt = new mat.Match();
      var v = new view.View(buf);
      mt.fromView(v);
      expect(mt.bytes().value()).to.equal(8);
      v.reset();
      mt.toView(v);
    });
    it('match struct single OXM TLVs fromView', function(){
      var mt = new mat.Match();
      var buf = new Buffer([
        0, 1, 0, 14,       // type, length
        128, 0, 6, 6,     // ofp tlv type, ethernet (no mask), length
        0, 1, 2, 3,       // eth[0-3]
        4, 5, 0, 0        // eth[4-5], padding,
        ]);
      var v = new view.View(buf);
      var d = mt.fromView(v);
      expect(d.length.value()).to.equal(14);
      expect(d.bytes().value()).to.equal(16);
      expect(d.oxms[0].bytes().value()).to.equal(10);
    });
    it('match struct multiple OXM TLVs fromView', function(){
      var mt = new mat.Match();
      var buf = new Buffer([
        0, 1, 0, 34,       // type, length
        128, 0, 6, 6,     // ofp tlv type, ethernet (no mask), length
        0, 1, 2, 3,       // eth[0-3]
        4, 5, 128, 0,
        6, 6, 0, 1,
        2, 3, 4, 5,
        128, 0, 6, 6,
        1, 2, 3, 4,
        5, 6, 0, 0,
        0, 0, 0, 0
        ]);
      var v = new view.View(buf);
      var d = mt.fromView(v);
      expect(d.length.value()).to.equal(34);
      expect(d.bytes().value()).to.equal(40);
      expect(d.oxms[0].bytes().value()).to.equal(10);
      expect(d.oxms[1].bytes().value()).to.equal(10);
    });
   it('match struct single OXM TLVs mask fromView', function(){
      var mt = new mat.Match();
      var buf = new Buffer([
        0, 1, 0, 20,       // type, length
        128, 0, 7, 12,     // ofp tlv type, ethernet (no mask), length
        0, 1, 2, 3,       // eth[0-3]
        4, 5, 1, 1,       // eth[4-5], mask[0-1]
        1, 1, 1, 1,
        0, 0, 0, 0
        ]);
      var v = new view.View(buf);
      var d = mt.fromView(v);
      expect(d.oxms[0].bytes().value()).to.equal(16);
      expect(d.length.value()).to.equal(20);
      expect(d.bytes().value()).to.equal(24);
    });
   it('single OXM TLV toView', function(){
      var mt = new mat.Match();
      var buf = new Buffer([
        0, 1, 0, 20,       // type, length
        128, 0, 7, 12,    // ofp tlv type, ethernet (no mask), length
        0, 1, 2, 3, 4, 5, // value
        1, 1, 1, 1, 1, 1,  // mask
        0, 0, 0, 0
        ]);
      var v = new view.View(buf);
      var d = mt.fromView(v);
      expect(d.bytes().value()).to.equal(24);
      var b2 = new Buffer(d.bytes().value());
      var v2 = new view.View(b2);
      d.toView(v2);
    });
   it('multiple OXM TLV toView', function(){
      var mt = new mat.Match();
      var buf = new Buffer([
        0, 1, 0, 30,       // type, length
        128, 0, 7, 12,    // ofp tlv type, ethernet (no mask), length
        0, 1, 2, 3,       // eth[0-3]
        4, 5, 1, 1,       // eth[4-5], mask[0-1] 
        1, 1, 1, 1,       // mask[2-5]
        128, 0, 6, 6,     // eth2
        1, 2, 3, 4,
        5, 6, 0, 0
        ]);
      var v = new view.View(buf);
      var d = mt.fromView(v);
      expect(d.bytes().value()).to.equal(32);
      expect(d.length.value()).to.equal(30);
      var b2 = new Buffer(d.bytes().value());
      var v2 = new view.View(b2);
      d.toView(v2);
    });
   it('packet in', function(){
     var filePath = path.join(__dirname, 'openflow-messages/v1_3/rep/rep_10_00002.pass');
     var file = fs.readFileSync(filePath);
     var v = new view.View(file);
     expect(v.buffer.length).to.equal(42);
     var pi = Message.fromView(v);
     expect(pi.header.version.value()).to.equal(4);
     expect(pi.payload.match.bytes().value()).to.equal(16);
     var buf = new Buffer(2);
     var vt = new view.View(buf);
     vt.writeUInt16(pi.payload.match.type);
     var buf2 = new Buffer(2);
     var vt2 = new view.View(buf2);
     vt2.writeUInt16(pi.payload.match.length);
     expect(pi.payload.match.type.toString(16)).to.equal('0x0001');

     var vr = new view.View(new Buffer(pi.bytes().value()));
     expect(vr.buffer.length).to.equal(42);
     pi.toView(vr);
   });

  });
});
})();
