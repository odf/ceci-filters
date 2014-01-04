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


var channels = function() {
  var chans = [];
  for (var i of 'abc'.split('').values())
    chans.push(source(i));
  return chans;
};


var linefeed = function() {
  console.log();
};


core.chain(null,
           channels, cf.merge,   [cf.take, 30], [cf.each, console.log],
           linefeed(),
           channels, cf.combine, [cf.take, 20], [cf.each, console.log],
           linefeed(),
           channels, cf.zip,     [cf.take, 20], [cf.each, console.log] );
