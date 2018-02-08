
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
        let cb = this._listeners[key][i].fn
        if (typeof cb === 'function') cb(this._selectedItem)
      }
    }

    return true
  }

  getSelectedItem() {
    return this._selectedItem
  }

  addListener(category, owner, fn) {
    if (typeof fn === 'function')
      this._listeners[category].push({owner, fn})
  }

  removeListener(category, owner) {
    console.log(this._listeners)

    var idx = -1
    let l = this._listeners[category]
    for (var i in l) {
      if (Object.is(l[i].owner, owner)) {
        idx = i
        break
      }
    }
    if (idx > -1) this._listeners[category].splice(idx, 1)

    console.log(this._listeners)
  }

  needUpdateSelectedItem() {
    let l = this._listeners.update
    for (var i in l) {
      let cb = l[i].fn
      if (typeof cb === 'function') cb(this._selectedItem)
    }
  }

  reset() {
    _selectedItem = null
  }
}