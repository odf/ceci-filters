'use strict';

var cf = require('../index');

var infiniteRange = function*(start) {
  for (var i = start; ; i += 1)
    yield i;
};

var preds = [
  function(n) { return n % 15 == 0 },
  function(n) { return n % 3 == 0 },
  function(n) { return n % 5 == 0 },
  true];

var intermediates = cf.scatter(preds, cf.source(infiniteRange(1)));

var fizzbuzz = cf.map(function() { return "fizzbuzz"; }, intermediates[0]);
var fizz     = cf.map(function() { return "fizz"; }, intermediates[1]);
var buzz     = cf.map(function() { return "buzz"; }, intermediates[2]);
var rest     = intermediates[3];

var ms = parseInt(process.argv[2] || "25");

cf.chain(cf.merge([fizzbuzz, fizz, buzz, rest]),
         [cf.takeWithTimeout, ms],
         [cf.each, console.log]);
