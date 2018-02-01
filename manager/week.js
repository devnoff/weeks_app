
let __weekManagerInstance = null
var _lock = false
var _week = null

export default class WeekManager {

  _selectedItem = null
  _listeners = {change:[]}
  
  constructor() {
    if (__weekManagerInstance) throw Error('Shared instance already exists')
  }

  static sharedInstance() {
    if (!__weekManagerInstance) {
        __weekManagerInstance = new WeekManager()
    }
    return __weekManagerInstance
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

  addListener(category, callback) {
    if (typeof callback === 'function')
      this._listeners[category].push(callback)
  }

  setCurrentWeek(week) {
    _week = week
  }

  getCurrentWeek() {
    return _week
  }

}