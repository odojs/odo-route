const pathtoregexp = require('path-to-regexp')

const hostname = window.location.hostname
const hostnameparts = hostname.split('.')
let subdomain = null
if (hostnameparts.length == 3)
  subdomain = hostnameparts[0]

const route = () => {
  let routes = []
  const res = (pattern, callback, options) => {
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
  res.exec = (url, next) => {
    const qindex = url.indexOf('?')
    let querystring = null
    if (qindex !== -1) {
      querystring = url.slice(qindex + 1)
      url = url.slice(0, qindex)
    }
    for (let r of routes) {
      const result = r.match.exec(decodeURIComponent(url))
      if (result == null) continue
      const params = {}
      r.match.keys.forEach((key, i) => {
        const val = decodeURIComponent(result[i + 1].replace(/\+/g, ' '))
        if (val == null && !hasOwnProperty.call(params, key.name)) return
        params[key.name] = val
      })
      return r.cb({
        hostname: hostname,
        subdomain: subdomain,
        url: url,
        params: params,
        querystring: querystring
      })
    }
    if (next == null) throw new Error('no route found')
    next()
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
module.exports.exec = (url, next) => assert().exec(url, next)
module.exports.routes = () => assert().routes()
module.exports.clearAll = () => assert().clearAll()
