'use strict';

var core = require('ceci-core');
var cc   = require('ceci-channels');
var cf   = require('../src/experimental');


var infiniteRange = function*(start) {
  for (var i = start; ; i += 1)
    yield i;
};

var ms = parseInt(process.argv[2] || "10");
var ch = cf.source(infiniteRange(1));


core.chain(null,

           'Taking the first 10 numbers:', console.log,
           ch,
           [cf.tapWith, [cf.take, 10]],
           [cf.each, console.log],
           '', console.log,

           'Taking further numbers for ' + ms + ' miliseconds:', console.log,
           ch,
           [cf.tapWith, [cf.takeFor, ms]],
           [cf.each, console.log],
           '', console.log,

           'Taking 10 more numbers:', console.log,
           ch,
           [cf.tapWith, [cf.take, 10]],
           [cf.each, console.log]);
