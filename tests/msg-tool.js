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
} else {
  var filePath = path.join(__dirname, fileName);
  var result = testWrap(fileName, filePath);
  printResult(filePath, result);
}

function printResult(file, result){
  if(_(result).isString()){
    console.log(file+'....'+result);
  }
}

function test(filePath){
  var file = fs.readFileSync(filePath); 
  var v = new view.View(file);
  var msg = Message.fromView(v);
  var v2 = new view.View(new Buffer(file.length));
  msg.toView(v2);
  if(prog.verbose){
    console.log('file:  ', v.buffer);
    console.log('result:', v2.buffer);
  }
  return bufEq(v2.buffer, file);
}

function testWrap(fileName, filePath){
  var testType = fileName.split('.')[1];
  var result;
  if(testType === 'pass'){
    try {
      result = test(filePath) ? 'pass' : 'idk';
  } catch(e) {
      result = 'fail';
 }
    return result;
  } else {
    //TODO: fail test
    return;
  }
}

})();
