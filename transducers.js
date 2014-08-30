'use strict';


var Reduced = function(val) {
  this.val = val;
};


var reduced = function(val) {
  return new Reduced(val);
};


var isReduced = function(val) {
  return val != null && val.constructor == Reduced;
};


var completing = function(f) {
  return function(x, y) {
    if (y === undefined) {
      if (x === undefined)
        return f();
      else
        return x;
    } else
      return f(x, y);
  };
};


var transduce = function(xform, f, reduce, init, coll) {
  if (coll === undefined) {
    coll = init;
    init = f();
  }

  var xf = xform(completing(f));
  var ret = reduce(coll, xf, init);
  ret = f(isReduced(ret) ? ret.val : ret);
  return isReduced(ret) ? ret.val : ret;
};


// ===

var map = function(f) {
  return function(f1) {
    return function(result, input) {
      if (input === undefined)
        return f1(result);
      else
        return f1(result, f(input));
    };
  };
};

var filter = function(pred) {
  return function(f1) {
    return function(result, input) {
      if (input === undefined)
        return f1(result);
      else if (pred(input))
        return f1(result, input);
      else
        return result;
    };
  };
};


var take = function(n) {
  return function(f1) {
    return function(result, input) {
      if (input === undefined)
        return f1(result);
      else if (n > 0) {
        n -= 1;
        return f1(result, input);
      } else
        return reduced(result);
    };
  };
};


var mapcat = function(f) {
  return function(f1) {
    return function(result, input) {
      if (input === undefined)
        return f1(result);
      else
        return f(input).reduce(f1, result);
    };
  };
};

// ===

var compose = function(f, g) {
  return function(x) {
    return f(g(x));
  };
};


// ===

var add  = function(x, y) { return (x || 0) + (y || 0); };
var x2   = function(x) { return 2*x; };
var even = function(x) { return x % 2 == 0; };
var echo = function(x) { console.log('>' + x + '<'); return x; };
var upto = function(n) {
  var out = [];
  for (var i = 1; i <= n; ++i)
    out.push(i);
  return out;
};

var a = [1,2,3,4,5];

var reduceArray = function(coll, f, init) {
  var val = init;
  for (var i = 0; !isReduced(val) && i < coll.length; ++i)
    val = f(val, coll[i]);
  return val;
};

var pushArray = function(x, y) {
  x = x || [];
  if (y !== undefined)
    x.push(y);
  return x;
};

var transformArray = function(xform, coll) {
  return transduce(xform, pushArray, reduceArray, coll);
};


console.log(reduceArray(a, add, 0));
console.log(transduce(map(x2), add, reduceArray, a));
console.log(transduce(filter(even), add, reduceArray, a));
console.log(transduce(compose(filter(even), map(x2)), add, reduceArray, a));

console.log(transformArray(compose(filter(even), map(x2)), a));
console.log(transformArray(compose(map(echo), take(2)), a));
console.log(transformArray(mapcat(upto), a));
console.log(transformArray(compose(mapcat(upto), take(5)), a));

console.log();

// ===

var ceci = require('ceci-core');
var chan = require('ceci-channels');


ceci.longStackSupport = true;


var transduceAsync = function(xform, f, reduce, init, coll) {
  if (coll === undefined) {
    coll = init;
    init = f();
  }

  var xf = xform(completing(f));

  return ceci.go(function*() {
    var ret = yield reduce(coll, xf, init);
    ret = (yield f(isReduced(ret)) ? ret.val : ret);
    return isReduced(ret) ? ret.val : ret;
  });
};


var reduceChannel = function(ch, f, init) {
  var acc = init;

  return ceci.go(function*() {
    var val;
    while (!isReduced(acc) && undefined !== (val = yield chan.pull(ch)))
      acc = yield f(acc, val);
    return acc;
  });
};


var pushChannel = function(x, y) {
  return ceci.go(function*() {
    x = yield x;
    y = yield y;

    if (y !== undefined)
      yield chan.push(x, y);
    return x;
  });
};


var transformChannel = function(xform, input) {
  var output = chan.chan();
  var xf = xform(pushChannel);

  ceci.top(ceci.go(function*() {
    var val;
    while (!isReduced(val) && undefined !== (val = yield chan.pull(input)))
      val = yield xf(output, val);
    output.close();
  }));

  return output;
};


var range = function(start, stop) {
  var ch = chan.chan();

  ceci.top(ceci.go(function*() {
    var i;
    for (i = start; i != stop ; ++i)
      yield chan.push(ch, i);
    chan.close(ch);
  }));

  return ch;
};


var printChannel = function(ch) {
  return ceci.go(function*() {
    console.log(yield reduceChannel(ch, pushArray));
  });
};


ceci.top(ceci.go(function*() {
  var xform, ch;

  xform = compose(filter(even), map(x2));

  console.log(yield transduceAsync(xform, add, reduceChannel, range(1, 6)));
  console.log(yield transduceAsync(mapcat(upto), add,
                                   reduceChannel, range(1, 6)));
  yield printChannel(transformChannel(xform, range(1, 6)));

  console.log(yield transduceAsync(take(5), add, reduceChannel, range(1, 0)));
  yield printChannel(transformChannel(take(5), range(1, 0)));

  yield printChannel(transformChannel(compose(map(echo), mapcat(upto)),
                                      range(1, 6)));
  yield printChannel(transformChannel(compose(take(3), mapcat(upto)),
                                      range(1, 0)));
  yield printChannel(transformChannel(compose(mapcat(upto), take(5)),
                                      range(1, 0)));
}));
