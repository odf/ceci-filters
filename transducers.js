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


var reduce = function(coll, f, init) {
  var val = init;
  for (var i = 0; i < coll.length; ++i)
    val = f(val, coll[i]);
  return val;
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


var transduce = function(xform, f, init, coll) {
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

var add  = function(x, y) { return (x || 0) + (y || 0); };
var x2   = function(x) { return 2*x; };
var even = function(x) { return x % 2 == 0; };

var a = [1,2,3,4,5];

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

var compose = function(f, g) {
  return function(x) {
    return f(g(x));
  };
};

console.log(reduce(a, add, 0));
console.log(transduce(map(x2), add, a));
console.log(transduce(filter(even), add, a));
console.log(transduce(compose(filter(even), map(x2)), add, a));
