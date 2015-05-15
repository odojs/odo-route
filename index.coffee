pathtoregexp = require 'path-to-regexp'

route = ->
  _routes = []
  (pattern, callback, options) ->
    if callback?
      # registration route(pattern, callback, options)
      pattern = '(.*)' if pattern is '*'
      _routes.push
        match: pathtoregexp pattern, options
        cb: callback
      return

    # call route(url)
    qindex = pattern.indexOf '?'
    pattern = pattern.slice 0, qindex if qindex isnt -1
    for r in _routes
      result = r.match.exec decodeURIComponent pattern
      continue if !result?
      params = {}
      for key, i in r.match.keys
        val = decodeURIComponent result[i + 1].replace /\+/g, ' '
        continue if !val? and not hasOwnProperty.call params, key.name
        params[key.name] = val
      r.cb params
      return
    throw new Error 'no route found'

# users can choose to have a global route or create a scoped route
globalroute = null
module.exports = (pattern, callback, options) ->
  return route() if !pattern?
  globalroute = route() if !globalroute?
  globalroute pattern, callback, options