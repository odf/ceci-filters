'use strict';

var cf = require('../index');

var infiniteRange = function*(start) {
  for (var i = start; ; i += 1)
    yield i;
};

var numbers = function() {
  return cf.source(infiniteRange(1));
};

var print = function(text) {
  return function() {
    console.log(text);
  };
};

var plus = function(a, b) { return a + b; };
var times = function(a, b) { return a * b; };


cf.chain(null,

         print('Integers:'),
         numbers,
         [cf.take, 10], [cf.each, console.log],

         print(''),

         print('Triangle numbers:'),
         numbers, [cf.reductions, plus],
         [cf.take, 10], [cf.each, console.log],

         print(''),

         print('Tetrahedral numbers:'),
         numbers, [cf.reductions, plus], [cf.reductions, plus],
         [cf.take, 10], [cf.each, console.log],

         print(''),

         print('Factorials:'),
         numbers, [cf.reductions, times],
         [cf.take, 10], [cf.each, console.log]);
