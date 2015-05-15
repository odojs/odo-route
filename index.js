// Generated by CoffeeScript 1.9.1
var globalroute, pathtoregexp, route;

pathtoregexp = require('path-to-regexp');

route = function() {
  var _routes, res;
  _routes = [];
  res = function(pattern, callback, options) {
    var i, j, k, key, len, len1, params, qindex, r, ref, result, val;
    if (callback != null) {
      if (pattern === '*') {
        pattern = '(.*)';
      }
      _routes.push({
        pattern: pattern,
        match: pathtoregexp(pattern, options),
        cb: callback
      });
      return;
    }
    qindex = pattern.indexOf('?');
    if (qindex !== -1) {
      pattern = pattern.slice(0, qindex);
    }
    for (j = 0, len = _routes.length; j < len; j++) {
      r = _routes[j];
      result = r.match.exec(decodeURIComponent(pattern));
      if (result == null) {
        continue;
      }
      params = {};
      ref = r.match.keys;
      for (i = k = 0, len1 = ref.length; k < len1; i = ++k) {
        key = ref[i];
        val = decodeURIComponent(result[i + 1].replace(/\+/g, ' '));
        if ((val == null) && !hasOwnProperty.call(params, key.name)) {
          continue;
        }
        params[key.name] = val;
      }
      return r.cb({
        url: pattern,
        params: params
      });
    }
    throw new Error('no route found');
  };
  res.routes(function() {
    return _routes;
  });
  return res;
};

globalroute = null;

module.exports = function(pattern, callback, options) {
  if (pattern == null) {
    return route();
  }
  if (globalroute == null) {
    globalroute = route();
  }
  return globalroute(pattern, callback, options);
};
