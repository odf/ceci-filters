'use strict';

var extend = function(obj, other) {
  for (var p in other)
    obj[p] = other[p];
};

extend(exports, require('./src/filters'));

exports.raw = require('./src/raw_filters');
