'use strict';

var core = require('ceci-core');
var cc   = require('../index');

var infiniteRange = function*(start) {
  for (var i = start; ; i += 1)
    yield i;
};

var ms = parseInt(process.argv[2] || "10");
var ch = cc.source(infiniteRange(1));

cc.chain(null,

         'Taking the first 10 numbers:', console.log,
         ch,
         [cc.take, 10, { keepInput: true }],
         [cc.each, console.log],
         '', console.log,

         'Taking further numbers for ' + ms + ' miliseconds:', console.log,
         ch,
         [cc.takeWithTimeout, ms, { keepInput: true }],
         [cc.each, console.log],
         '', console.log,

         'Taking 10 more numbers:', console.log,
         ch,
         [cc.take, 10, { keepInput: true }],
         [cc.each, console.log]);
