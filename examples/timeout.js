'use strict';

var core = require('ceci-core');
var cc   = require('ceci-channels');
var cf   = require('../index');


var infiniteRange = function*(start) {
  for (var i = start; ; i += 1)
    yield i;
};

var ms = parseInt(process.argv[2] || "10");
var ch = cc.fromGenerator(infiniteRange(1));


core.chain(null,

           'Taking the first 10 numbers:', console.log,
           ch,
           [cf.tapWith, [cf.take, 10]],
           [cc.each, console.log],
           '', console.log,

           'Taking further numbers for ' + ms + ' miliseconds:', console.log,
           ch,
           [cf.tapWith, [cf.takeFor, ms]],
           [cc.each, console.log],
           '', console.log,

           'Taking 10 more numbers:', console.log,
           ch,
           [cf.tapWith, [cf.take, 10]],
           [cc.each, console.log],
           '', console.log,

           'Dropping numbers for ' + ms + ' miliseconds, then taking 10 more:',
           console.log,
           ch,
           [cf.tapWith, [cf.takeFor, ms]],
           [cc.each],
           ch,
           [cf.tapWith, [cf.take, 10]],
           [cc.each, console.log],
           '', console.log,

           'Taking 10 more numbers:', console.log,
           ch,
           [cf.tapWith, [cf.take, 10]],
           [cc.each, console.log],
           '', console.log,

           'Dropping 10 numbers, then taking 10 more:',
           console.log,
           ch,
           [cf.tapWith, [cf.take, 10]],
           [cc.each],
           ch,
           [cf.tapWith, [cf.take, 10]],
           [cc.each, console.log],
           '', console.log,

           'Taking 10 more numbers:', console.log,
           ch,
           [cf.tapWith, [cf.take, 10]],
           [cc.each, console.log],
           '', console.log);
