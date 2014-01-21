'use strict';

var core = require('ceci-core');
var cc   = require('ceci-channels');


const OKAY = 0;
const SKIP = 1;
const STOP = 2;


var pipeThrough = function(fn, input, output) {
  var managed = (output == null);
  if (managed)
    output = cc.chan();

  var done = core.go(function*() {
    var arg, res, val, status;

    while (true) {
      if (undefined === (arg = yield cc.pull(input)))
        break;

      res = yield fn(arg);
      val = res[0];
      status = res[1];
      if (status == SKIP)
        continue;

      if (!(yield cc.push(output, (val === undefined ? null : val))))
        break;
      if (status == STOP)
        break;
    }

    if (managed) {
      cc.close(input);
      cc.close(output);
    }

    return output;
  });

  if (managed)
    return output;
  else
    return done;
};


exports.tapWith = function(filter, arg, input) {
  var output = cc.chan();
  core.go(function*() {
    yield filter(arg, input, output);
    cc.close(output);
  });
  return output;
};


exports.source = function(gen, output) {
  var managed = output == null;
  if (managed)
    output = cc.chan();

  core.go(function*() {
    var step;

    while (true) {
      step = gen.next();
      if (step.done)
        break;
      if (!(yield cc.push(output, step.value)))
        break
    }

    if (managed)
      cc.close(output);
  });

  return output;
};


exports.each = function(fn, input) {
  return core.go(function*() {
    var val;
    while (undefined !== (val = yield cc.pull(input)))
      if (fn)
        fn(val);
  });
};


exports.map = function(fn, input, output) {
  return pipeThrough(
    function(arg) {
      return [fn(arg), OKAY];
    },
    input, output);
};


exports.filter = function(pred, input, output) {
  return pipeThrough(
    function(arg) {
      return [arg, (pred(arg) ? OKAY : SKIP)];
    },
    input, output);
};


exports.reductions = function(fn, start, input, output) {
  var acc = start;
  return pipeThrough(
    function(arg) {
      return [acc = fn(acc, arg), OKAY];
    },
    input, output);
};


exports.take = function(n, input, output) {
  if (n == 0) {
    if (output == null)
      return cc.chan();
  } else {
    var count = 0;
    return pipeThrough(
      function(arg) {
        return [arg, (++count < n ? OKAY : STOP)];
      },
      input, output);
  }
};


exports.takeUntil = function(pred, input, output) {
  return pipeThrough(
    function(arg) {
      return [arg, (pred(arg) ? STOP : OKAY)];
    },
    input, output);
};


exports.takeFor = function(ms, input, output) {
  var t = cc.timeout(ms);

  return pipeThrough(
    function(arg) {
      return core.go(function*() {
        var go = (yield cc.select(t, { default: true })).value;
        return [arg, (go ? OKAY : STOP)];
      });
    },
    input, output);
};


exports.drop = function(n, input, output) {
  var count = false;

  return pipeThrough(
    function(arg) {
      return [arg, (++count <= n ? SKIP : OKAY)];
    },
    input, output);
};


exports.dropWhile = function(pred, input, output) {
  var go = false;

  return pipeThrough(
    function(arg) {
      go = go || !pred(arg);
      return [arg, (go ? OKAY : SKIP)];
    },
    input, output);
};


exports.dropFor = function(ms, input, output) {
  var t = cc.timeout(ms);
  var go = false;

  return pipeThrough(
    function(arg) {
      return core.go(function*() {
        go = go || !(yield cc.select(t, { default: true })).value;
        return [arg, (go ? OKAY : SKIP)];
      });
    },
    input, output);
};
