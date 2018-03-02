
__notifications = {
  create_overlay_request: [],
  edit_overlay_request: [],
  dupliate_overlay_request: [],
  delete_overlay_request: [],
  title_text_input_change: [],
  cell_select_change: [],
  reset_this_week_request: [],
  import_from_prev_week_request: [],
  import_overlay_request: [],
  prev_week_request: [],
  next_week_request: [],
  this_week_request: []
}

export default class Notification {

  static addListener(key, owner, callback) {
    if (typeof callback === 'function')
      __notifications[key].push({owner, callback})

    // console.log(__notifications)
  }

  static removeListener(key, owner) {
    let cbs = __notifications[key]
    var idx = -1
    for (var i in cbs) {
      if (cbs[i].owner == owner) {
        idx = i
        break
      }
    }
    if (idx > -1) {
      cbs.splice(idx, 1)
    }
  }

  static post(key, object) {
    let cbs = __notifications[key]
    for (var i in cbs) {
      let cb = cbs[i].callback
      if (typeof cb === 'function') cb(object)
    }
  }

}