'use strict';

var core = require('ceci-core');
var cc   = require('ceci-channels');


const OKAY = 0;
const SKIP = 1;
const STOP = 2;


var lift_raw = function(fn) {
  return function(input, output) {
    cc.go(function*() {
      var arg, val, okay;

      while (true) {
        arg = yield cc.pull(input);
        if (arg === undefined)
          break;

        [val, status] = fn(arg);
        if (status == SKIP)
          continue;
        else if (status == STOP)
          break;

        okay = yield cc.push(output, (val === undefined ? null : val));
        if(!okay)
          break;
      }
    });
  });
};


var lift = function(fn) {
  var lifted = lift_raw(fn);

  return function(input, output) {
    if (output == null) {
      var output = cc.chan();

      cc.go(function*() {
        yield lifted(input, output);
        cc.close(input);
        cc.close(output);
      });

      return output;
    } else
      lifted(input, output);
  });
};


var each = function(fn, input) {
  lift(function(arg) {
    return [fn(arg), SKIP];
  })(input);
};


var map = function(fn, input, output) {
  return lift(function(arg) {
    return [fn(arg), OKAY];
  })(input, output);
};


var filter = function(pred, input, output) {
  return lift(function(arg) {
    return [arg, (pred(arg) ? OKAY : SKIP)];
  })(input, output);
};


var reductions = function(fn, start, input, output) {
  var acc = start;
  return lift(function(arg) {
    return [acc = fn(acc, arg), OKAY];
  })(input, output);
};


var take = function(n, input, output) {
  if (n == 0) {
    if (output == null)
      return cc.chan();
  } else {
    var count = 0;
    return lift(function(arg) {
      ++count;
      return [arg, (count < n ? OKAY : STOP)];
    })(input, output);
  }
};
