
let __selectionInstance = null
var _selectedCells = []

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
    _selectedCells.push(key)
  }

  removeCellWithKey(key) {
    var idx = -1
    for (var i in _selectedCells) {
      if (_selectedCells[i] == key) {
        idx = i
        break
      }
    }
    if (idx > 0) 
      _selectedCells.splice(idx, 1)
  }

  getSelectedCells() {
    return _selectedCells
  }

  reset() {
    _selectedCells = []
  }
}