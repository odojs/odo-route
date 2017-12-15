const pathtoregexp = require('path-to-regexp')

const route = () => {
  let _routes = []
  const res = (pattern, callback, options) => {
    if (callback != null) {
      if (pattern === '*') pattern = '(.*)'
      const entry = {
        pattern: pattern,
        match: pathtoregexp(pattern, options),
        cb: callback
      }
      _routes.push(entry)
      return {
        off: () => {
          const index = _routes.indexOf(entry)
          if (index != -1) _routes.splice(index, 1)
        }
      }
    }
    const qindex = pattern.indexOf('?')
    if (qindex !== -1) pattern = pattern.slice(0, qindex)
    for (let r of _routes) {
      const result = r.match.exec(decodeURIComponent(pattern))
      if (result == null) continue
      const params = {}
      r.match.keys.forEach((key, i) => {
        const val = decodeURIComponent(result[i + 1].replace(/\+/g, ' '))
        if (val == null && !hasOwnProperty.call(params, key.name)) return
        params[key.name] = val
      })
      return r.cb({
        url: pattern,
        params: params
      })
    }
    throw new Error('no route found')
  }
  res.routes = () => _routes
  res.clearAll = () => {
    _routes = []
  }
  return res
}

let globalroute = null

const globalapi = (pattern, callback, options) => {
  if (pattern == null) return route()
  if (globalroute == null) globalroute = route()
  return globalroute(pattern, callback, options)
}

globalapi.routes = () => {
  if (globalroute == null) globalroute = route()
  return globalroute.routes()
}

module.exports = globalapi
