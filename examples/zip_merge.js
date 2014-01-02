'use strict';

var core = require('ceci-core');
var cc   = require('ceci-channels');
var cf   = require('../index');

var source = function(x) {
  var ch = cc.chan();
  core.go(function*() {
    for (var i = 0; ; ++i) {
      yield cc.pull(cc.timeout(Math.random() * 100));
      if (!(yield cc.push(ch, "" + x + "." + i)))
        break;
    }
    cc.close(ch);
  });

  return ch;
};

var makeChannels = function() {
  var chans = [];
  for (var i of 'abc'.split('').values())
    chans.push(source(i));
  return chans;
};

core.go(function*() {
  yield cf.chain(cf.merge(makeChannels()),
                 [cf.take, 30],
                 [cf.each, console.log]);

  console.log();

  yield cf.chain(cf.combine(makeChannels()),
                 [cf.take, 20],
                 [cf.each, console.log]);

  console.log();

  yield cf.chain(cf.zip(makeChannels()),
                 [cf.take, 20],
                 [cf.each, console.log]);
});
