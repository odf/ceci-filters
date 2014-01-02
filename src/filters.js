'use strict';

var core = require('ceci-core');
var cc   = require('ceci-channels');
var raw  = require('./raw_filters');


var closeAll = function(chs) {
  if (Array.isArray(chs))
    chs.forEach(function(ch) { cc.close(ch); });
  else
    cc.close(chs);
};

var sentinel = function*(inch, outch, done, options) {
  yield cc.pull(done);
  if (!options.keepInput)
    closeAll(inch);
  if (!options.keepOutput)
    closeAll(outch);
  cc.close(done);
};

var wrapch = function(ch) {
  return (Array.isArray(ch) && ch.length > 0) ? [ch] : ch;
};

var pipe = exports.pipe = function()
{
  var args    = Array.prototype.slice.call(arguments);
  var filter  = args.shift();
  var options = args.pop();
  var inch    = args.pop();

  var outch = options.output || cc.chan();
  var done  = cc.chan();

  core.go.apply(this,
                [].concat(filter, args, wrapch(inch), wrapch(outch), done));
  core.go(sentinel, inch, outch, done, options);

  return outch;
};

exports.source = function(gen, options) {
  return pipe(raw.source, gen, [], options || {});
};

exports.map = function(fn, ch, options) {
  return pipe(raw.map, fn, ch, options || {});
};

exports.filter = function(pred, ch, options) {
  return pipe(raw.filter, pred, ch, options || {});
};

exports.reductions = function(fn, ch, options) {
  return pipe(raw.reductions, fn, ch, options || {});
};

exports.take = function(n, ch, options) {
  return pipe(raw.take, n, ch, options || {});
};

exports.takeUntil = function(pred, ch, options) {
  return pipe(raw.takeUntil, pred, ch, options || {});
};

exports.takeWithTimeout = function(ms, inch, options) {
  return pipe(raw.takeWithTimeout, ms, inch, options || {});
};

exports.drop = function(n, ch, options) {
  return pipe(raw.drop, n, ch, options || {});
};

exports.dropWhile = function(pred, ch, options) {
  return pipe(raw.dropWhile, pred, ch, options || {});
};

exports.dropWithTimeout = function(ms, inch, options) {
  return pipe(raw.dropWithTimeout, ms, inch, options || {});
};

exports.merge = function(chs, options) {
  return pipe(raw.merge, chs, options || {});
};

exports.combine = function(chs, options) {
  return pipe(raw.combine, chs, options || {});
};

exports.zip = function(chs, options) {
  return pipe(raw.zip, chs, options || {});
};

exports.scatter = function(preds, inch, options) {
  var outchs = preds.map(function () { return cc.chan(); });
  var done = cc.chan();

  core.go(raw.scatter, preds, inch, outchs, done);
  core.go(sentinel, inch, outchs, done, options || {});

  return outchs;
};

exports.each = function(fn, ch, options) {
  var done  = cc.chan();

  core.go(raw.each, fn, ch, done);
  core.go(sentinel, ch, done, done, options || {});

  return cc.pull(done);
};

exports.chain = function(initial) {
  var args = Array.prototype.slice.call(arguments, 1);

  return core.go(function*() {
    var val = initial;
    var form;

    for (var i = 0; i < args.length; ++i) {
      form = args[i];
      val = yield val;
      if (Array.isArray(form))
        val = form[0].apply(null, [].concat(form[1], val, form.slice(2)));
      else
        val = form(val);
    }
    return val;

  });
};
