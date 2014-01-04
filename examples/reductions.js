'use strict';

var cf = require('../index');

var infiniteRange = function*(start) {
  for (var i = start; ; i += 1)
    yield i;
};

var numbers = function() {
  return cf.source(infiniteRange(1));
};

var plus = function(a, b) { return a + b; };
var times = function(a, b) { return a * b; };


cf.chain(null,

         'Integers:', console.log,
         numbers,
         [cf.take, 10], [cf.each, console.log],
         '', console.log,

         'Triangle numbers:', console.log,
         numbers, [cf.reductions, plus],
         [cf.take, 10], [cf.each, console.log],
         '', console.log,

         'Tetrahedral numbers:', console.log,
         numbers, [cf.reductions, plus], [cf.reductions, plus],
         [cf.take, 10], [cf.each, console.log],
         '', console.log,

         'Factorials:', console.log,
         numbers, [cf.reductions, times],
         [cf.take, 10], [cf.each, console.log]);
