#!/usr/bin/env node
(function(){
var _    = require('underscore');
var prog = require('commander');
var path = require('path');
var os   = require('os');
var fs   = require('fs');
var bufEq = require('buffer-equal');

var ofp  = require('../lib');
var view = ofp.view;
var Message = ofp.msg;
var pass = 0;
var fail = 0;

prog
  .option('-v, --verbose', 'print buffers')
  .parse(process.argv);

var fileName = process.argv[prog.verbose ? 3 : 2];
if(fs.lstatSync(fileName).isDirectory()){
  var files = fs.readdirSync(fileName);
  _(files).forEach(function(f){
    var filePath = fileName +'/'+f;
    var result = testWrap(f, filePath);
    printResult(filePath, result);
  });
  console.log('Coverage:', pass / (pass + fail));
} else {
  var filePath = path.join(__dirname, fileName);
  var result = testWrap(fileName, filePath);
  printResult(filePath, result);
}

function printResult(file, result){
  if(_(result).isString()){
    console.log(file+'....'+result);
    if(result === 'pass'){
      pass += 1;
    } else {
      fail += 1;
    }
  }
}

function test(filePath){
  var file = fs.readFileSync(filePath); 
  var v = new view.View(file);
  if(prog.verbose){
    console.log('file:  ', v.buffer);
    console.log('file length:', file.length);
  }
  var msg = Message.fromView(v);
  if(prog.verbose){
    console.log('msg:', msg.toJSON());
    console.log('msg bytes(): ', msg.bytes().value());
  }
  var v2 = new view.View(new Buffer(msg.bytes().value()));
  msg.toView(v2);
  if(prog.verbose){
    console.log('result:', v2.buffer);
  }
  return bufEq(v2.buffer, v.buffer);
}

function testWrap(fileName, filePath){
  var testType = fileName.split('.')[1];
  var result;
  if(testType === 'pass'){
    if(prog.verbose){
      result = test(filePath) ? 'pass' : 'fail';
    } else {
      try {
        result = test(filePath) ? 'pass' : 'fail';
      } catch(e) {
        result = 'fail';
      }
    }
    return result;
  } else {
    //TODO: fail test
    return;
  }
}

})();
