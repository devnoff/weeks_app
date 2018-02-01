
__notifications = {
  create_overlay_request: []
}

export default class Notification {

  static addListener(key, callback) {
    if (typeof callback === 'function')
      __notifications[key].push(callback)
  }

  static removeListener(key, callback) {
    let cbs = __notifications[key]
    var idx = -1
    for (var i in cbs) {
      if (cbs[i] == callback) {
        idx = i
        break
      }
    }
    if (idx > -1) {
      dbs.splice(idx, 1)
    }
  }

  static post(key, object) {
    let cbs = __notifications[key]
    for (var i in cbs) {
      let cb = cbs[i]
      if (typeof cb === 'function') cb(object)
    }
  }

}