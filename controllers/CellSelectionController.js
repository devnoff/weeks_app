import _ from 'lodash'

let __selectionInstance = null
var _selectedCells = new Set()
let _listeners = {
  change: []
}

export default class CellSelectionController {

  constructor() {
    if (__selectionInstance)
      throw Error('Use sharedInstace() method')
  }

  static sharedInstance() {
    if (!__selectionInstance) {
      __selectionInstance = new CellSelectionController()
    }

    return __selectionInstance
  }

  addCellWithKey(key) {
    _selectedCells.add(key)

    let cbs = _listeners['change']
    for (var i in cbs) {
      let cb = cbs[i].callback
      if (typeof cb === 'function') cb(this.getSelectedCells())
    }
  }

  removeCellWithKey(key) {
    _selectedCells.delete(key)

    let cbs = _listeners['change']
    for (var i in cbs) {
      let cb = cbs[i].callback
      if (typeof cb === 'function') cb(this.getSelectedCells())
    }
  }

  getSelectedCells() {
    return Array.from(_selectedCells)
  }

  contains(key) {
    return _selectedCells.has(key)
  }

  reset() {
    _selectedCells.clear()
  }

  addListener(key, owner, callback) {
    if (typeof callback === 'function')
      _listeners[key].push({owner, callback})
  }

  removeListener(key, owner) {
    let cbs = _listeners[key]
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
}