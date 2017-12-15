const pathtoregexp = require('path-to-regexp')

const route = () => {
  let routes = []
  const res = (pattern, callback, options) => {
    if (callback != null) {
      if (pattern === '*') pattern = '(.*)'
      const entry = {
        pattern: pattern,
        match: pathtoregexp(pattern, options),
        cb: callback
      }
      routes.push(entry)
      return {
        off: () => {
          const index = routes.indexOf(entry)
          if (index != -1) routes.splice(index, 1)
        }
      }
    }
    const qindex = pattern.indexOf('?')
    if (qindex !== -1) pattern = pattern.slice(0, qindex)
    for (let r of routes) {
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
  res.routes = () => routes
  res.clearAll = () => {
    routes = []
  }
  return res
}

let _route = null
const assert = () => {
  if (_route == null) _route = route()
  return _route
}

module.exports = (pattern, callback, options) => {
  if (pattern == null) return route()
  return assert()(pattern, callback, options)
}
module.exports.routes = () => assert().routes()
module.exports.clearAll = () => assert().clearAll()
