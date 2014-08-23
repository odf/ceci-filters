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

var a = [1,2,3,4,5];

var reduceArray = function(coll, f, init) {
  var val = init;
  for (var i = 0; i < coll.length; ++i)
    val = f(val, coll[i]);
  return val;
};

console.log(reduceArray(a, add, 0));
console.log(transduce(map(x2), add, reduceArray, a));
console.log(transduce(filter(even), add, reduceArray, a));
console.log(transduce(compose(filter(even), map(x2)), add, reduceArray, a));


// ===

var ceci = require('ceci-core');
var chan = require('ceci-channels');


var transduceAsync = function(xform, f, reduce, init, coll) {
  if (coll === undefined) {
    coll = init;
    init = f();
  }

  var xf = xform(completing(f));

  return ceci.go(function*() {
    var ret = yield reduce(coll, xf, init);
    ret = f(isReduced(ret) ? ret.val : ret);
    return isReduced(ret) ? ret.val : ret;
  });
};


var reduceChannel = function(ch, f, init) {
  var acc = init;

  return ceci.go(function*() {
    var val;
    while (undefined !== (val = yield chan.pull(ch)))
      acc = f(acc, val);
    return acc;
  });
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


ceci.top(ceci.go(function*() {
  var xform = compose(filter(even), map(x2));
  console.log(yield transduceAsync(xform, add, reduceChannel, range(1, 6)));
}));
