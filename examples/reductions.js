'use strict';

var core = require('ceci-core');
var cf = require('../index');

var infiniteRange = function*(start) {
  for (var i = start; ; i += 1)
    yield i;
};

var plus = function(a, b) { return a + b; };
var times = function(a, b) { return a * b; };

core.go(function*() {
  console.log("Integers:");
  yield cf.chain(cf.source(infiniteRange(1)),
                 [cf.take, 10],
                 [cf.each, console.log]);

  console.log();
  console.log("Triangle numbers:");
  yield cf.chain(cf.source(infiniteRange(1)),
                 [cf.reductions, plus],
                 [cf.take, 10],
                 [cf.each, console.log]);

  console.log();
  console.log("Tetrahedral numbers:");
  yield cf.chain(cf.source(infiniteRange(1)),
                 [cf.reductions, plus],
                 [cf.reductions, plus],
                 [cf.take, 10],
                 [cf.each, console.log]);

  console.log();
  console.log("Factorials:");
  yield cf.chain(cf.source(infiniteRange(1)),
                 [cf.reductions, times],
                 [cf.take, 10],
                 [cf.each, console.log]);
});
