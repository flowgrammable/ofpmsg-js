#!/usr/bin/env node
var ofp = require('../lib/index.js');
var view = ofp.view;
var Header = ofp.hdr;
var Message = ofp.msg;
var msg = ofp['1.0'];

var fr = msg.FeatureReq();
var buf = new Buffer(fr.bytes().value());
var v = new view.View(buf);
var x = fr.toView(v);
console.log(v);
