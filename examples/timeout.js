'use strict';

var core = require('ceci-core');
var cc   = require('../index');

var infiniteRange = function*(start) {
  for (var i = start; ; i += 1)
    yield i;
};

var print = function(text) {
  return function() {
    console.log(text);
  };
};

var constant = function(val) {
  return function() {
    return val;
  }
};

var ms = parseInt(process.argv[2] || "10");
var ch = cc.source(infiniteRange(1));

cc.chain(null,

         print('Taking the first 10 numbers:'),
         constant(ch),
         [cc.take, 10, { keepInput: true }],
         [cc.each, console.log],
         print(''),

         print('Taking further numbers for ' + ms + ' miliseconds:'),
         constant(ch),
         [cc.takeWithTimeout, ms, { keepInput: true }],
         [cc.each, console.log],
         print(''),

         print('Taking 10 more numbers:'),
         constant(ch),
         [cc.take, 10, { keepInput: true }],
         [cc.each, console.log]);

