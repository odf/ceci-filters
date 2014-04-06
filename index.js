'use strict';

var core = require('ceci-core');
var cc   = require('ceci-channels');


var OKAY = 0;
var SKIP = 1;
var STOP = 2;


var pipeThrough = function(fn, input, output) {
  var managed = (output == null);
  if (managed)
    output = cc.chan();

  var done = core.go(wrapGenerator.mark(function() {
    var arg, res, val, status;

    return wrapGenerator(function($ctx0) {
      while (1) switch ($ctx0.next) {
      case 0:
        if (!true) {
          $ctx0.next = 29;
          break;
        }

        $ctx0.next = 3;
        return cc.pull(input);
      case 3:
        $ctx0.t0 = arg = $ctx0.sent;

        if (!(undefined === $ctx0.t0)) {
          $ctx0.next = 8;
          break;
        }

        delete $ctx0.thrown;
        $ctx0.next = 29;
        break;
      case 8:
        $ctx0.next = 10;
        return fn(arg);
      case 10:
        res = $ctx0.sent;
        val = res[0];
        status = res[1];

        if (!(status == SKIP)) {
          $ctx0.next = 17;
          break;
        }

        delete $ctx0.thrown;
        $ctx0.next = 0;
        break;
      case 17:
        $ctx0.next = 19;
        return cc.push(output, (val === undefined ? null : val));
      case 19:
        if (!!$ctx0.sent) {
          $ctx0.next = 23;
          break;
        }

        delete $ctx0.thrown;
        $ctx0.next = 29;
        break;
      case 23:
        if (!(status == STOP)) {
          $ctx0.next = 27;
          break;
        }

        delete $ctx0.thrown;
        $ctx0.next = 29;
        break;
      case 27:
        $ctx0.next = 0;
        break;
      case 29:
        if (managed) {
          cc.close(input);
          cc.close(output);
        }

        $ctx0.rval = output;
        delete $ctx0.thrown;
        $ctx0.next = 34;
        break;
      case 34:
      case "end":
        return $ctx0.stop();
      }
    }, this);
  }));

  if (managed)
    return output;
  else
    return done;
};


exports.tapWith = function(filter, arg, input) {
  var output = cc.chan();
  core.go(wrapGenerator.mark(function() {
    return wrapGenerator(function($ctx1) {
      while (1) switch ($ctx1.next) {
      case 0:
        $ctx1.next = 2;
        return filter(arg, input, output);
      case 2:
        cc.close(output);
      case 3:
      case "end":
        return $ctx1.stop();
      }
    }, this);
  }));
  return output;
};


exports.map = function(fn, input, output) {
  return pipeThrough(
    function(arg) {
      return core.lift(Array)(fn(arg), OKAY);
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
      return core.go(wrapGenerator.mark(function() {
        var go;

        return wrapGenerator(function($ctx2) {
          while (1) switch ($ctx2.next) {
          case 0:
            $ctx2.next = 2;
            return cc.select(t, { default: true });
          case 2:
            go = $ctx2.sent.value;
            $ctx2.rval = [arg, (go ? OKAY : STOP)];
            delete $ctx2.thrown;
            $ctx2.next = 7;
            break;
          case 7:
          case "end":
            return $ctx2.stop();
          }
        }, this);
      }));
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
      return core.go(wrapGenerator.mark(function() {
        return wrapGenerator(function($ctx3) {
          while (1) switch ($ctx3.next) {
          case 0:
            $ctx3.t1 = go;

            if ($ctx3.t1) {
              $ctx3.next = 5;
              break;
            }

            $ctx3.next = 4;
            return cc.select(t, { default: true });
          case 4:
            $ctx3.t1 = !$ctx3.sent.value;
          case 5:
            go = $ctx3.t1;
            $ctx3.rval = [arg, (go ? OKAY : SKIP)];
            delete $ctx3.thrown;
            $ctx3.next = 10;
            break;
          case 10:
          case "end":
            return $ctx3.stop();
          }
        }, this);
      }));
    },
    input, output);
};


exports.scatter = function(preds, input, outputs) {
  var open = preds.map(function() { return true });
  var nrOpen = preds.length;
  var managed = outputs == null;
  if (managed)
    outputs = preds.map(function() { return cc.chan(); });

  core.go(wrapGenerator.mark(function() {
    var val, i;

    return wrapGenerator(function($ctx4) {
      while (1) switch ($ctx4.next) {
      case 0:
        $ctx4.t2 = nrOpen > 0;

        if (!$ctx4.t2) {
          $ctx4.next = 6;
          break;
        }

        $ctx4.next = 4;
        return cc.pull(input);
      case 4:
        $ctx4.t3 = val = $ctx4.sent;
        $ctx4.t2 = undefined !== $ctx4.t3;
      case 6:
        if (!$ctx4.t2) {
          $ctx4.next = 26;
          break;
        }

        i = 0;
      case 8:
        if (!(i < preds.length)) {
          $ctx4.next = 24;
          break;
        }

        if (!((preds[i] == true) || preds[i](val))) {
          $ctx4.next = 21;
          break;
        }

        $ctx4.t4 = open[i];

        if (!$ctx4.t4) {
          $ctx4.next = 15;
          break;
        }

        $ctx4.next = 14;
        return cc.push(outputs[i], val);
      case 14:
        $ctx4.t4 = !$ctx4.sent;
      case 15:
        if (!$ctx4.t4) {
          $ctx4.next = 18;
          break;
        }

        --nrOpen;
        open[i] = false;
      case 18:
        delete $ctx4.thrown;
        $ctx4.next = 24;
        break;
      case 21:
        ++i;
        $ctx4.next = 8;
        break;
      case 24:
        $ctx4.next = 0;
        break;
      case 26:
        if (managed)
          outputs.forEach(cc.close);
      case 27:
      case "end":
        return $ctx4.stop();
      }
    }, this);
  }));

  return outputs;
};


exports.merge = function(inputs, output) {
  var managed = output == null;
  if (managed)
    output = cc.chan();
  var inputs = inputs.slice();

  core.go(wrapGenerator.mark(function() {
    var res;

    return wrapGenerator(function($ctx5) {
      while (1) switch ($ctx5.next) {
      case 0:
        if (!(inputs.length > 0)) {
          $ctx5.next = 16;
          break;
        }

        $ctx5.next = 3;
        return cc.select.apply(null, inputs);
      case 3:
        res = $ctx5.sent;

        if (!(res.value === undefined)) {
          $ctx5.next = 8;
          break;
        }

        inputs.splice(inputs.indexOf(res.channel), 1);
        $ctx5.next = 14;
        break;
      case 8:
        $ctx5.next = 10;
        return cc.push(output, res.value);
      case 10:
        if (!!$ctx5.sent) {
          $ctx5.next = 14;
          break;
        }

        delete $ctx5.thrown;
        $ctx5.next = 16;
        break;
      case 14:
        $ctx5.next = 0;
        break;
      case 16:
        if (managed) {
          cc.close(output);
          inputs.forEach(cc.close);
        }
      case 17:
      case "end":
        return $ctx5.stop();
      }
    }, this);
  }));

  return output;
};


exports.zip = function(inputs, output) {
  var managed = output == null;
  if (managed)
    output = cc.chan();
  var current = new Array(inputs.length);

  core.go(wrapGenerator.mark(function() {
    var done, res, pending;

    return wrapGenerator(function($ctx6) {
      while (1) switch ($ctx6.next) {
      case 0:
        done = false;
      case 1:
        if (!!done) {
          $ctx6.next = 29;
          break;
        }

        pending = inputs.slice();
      case 3:
        if (!(pending.length > 0)) {
          $ctx6.next = 18;
          break;
        }

        $ctx6.next = 6;
        return cc.select.apply(null, pending);
      case 6:
        res = $ctx6.sent;

        if (!(res.value === undefined)) {
          $ctx6.next = 14;
          break;
        }

        done = true;
        delete $ctx6.thrown;
        $ctx6.next = 18;
        break;
      case 14:
        current[inputs.indexOf(res.channel)] = res.value;
        pending.splice(pending.indexOf(res.channel), 1);
      case 16:
        $ctx6.next = 3;
        break;
      case 18:
        $ctx6.t5 = !done;

        if (!$ctx6.t5) {
          $ctx6.next = 23;
          break;
        }

        $ctx6.next = 22;
        return cc.push(output, current.slice());
      case 22:
        $ctx6.t5 = !$ctx6.sent;
      case 23:
        if (!$ctx6.t5) {
          $ctx6.next = 27;
          break;
        }

        delete $ctx6.thrown;
        $ctx6.next = 29;
        break;
      case 27:
        $ctx6.next = 1;
        break;
      case 29:
        if (managed) {
          cc.close(output);
          inputs.forEach(cc.close);
        }
      case 30:
      case "end":
        return $ctx6.stop();
      }
    }, this);
  }));

  return output;
};
