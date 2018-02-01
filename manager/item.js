
let __instance = null
var _lock = false
export default class ItemManager {

  _selectedItem = null
  _listeners = {change:[], update: []}
  
  constructor() {
    if (__instance) throw Error('Shared instance already exists')
  }

  static sharedInstance() {
    if (!__instance) {
      __instance = new ItemManager()
    }
    return __instance
  }

  lock() {
    _lock = true
  }

  unlock() {
    _lock = false
  }

  isLock() {
    return _lock ? true : false
  }

  setSelectedItem(item) {

    if (_lock) return false

    this._selectedItem = item

    // Notice listeners
    var keys = Object.keys(this._listeners)
    for (var k in keys) {
      let key = keys[k]
      for (var i in this._listeners[key]) {
        let cb = this._listeners[key][i]
        if (typeof cb === 'function') cb(this._selectedItem)
      }
    }

    return true
  }

  getSelectedItem() {
    return this._selectedItem
  }

  addListener(category, callback) {
    if (typeof callback === 'function')
      this._listeners[category].push(callback)
  }

  needUpdateSelectedItem() {
    let l = this._listeners.update
    for (var i in l) {
      let cb = l[i]
      if (typeof cb === 'function') cb(this._selectedItem)
    }
  }


}