import _ from 'lodash'

var __selectedCells = []

export default class SelectManager {
  
  static getSelectedCells() {
    return __selectedCells
  }

  static addSelectedCellKey(key) {
    __selectedCells.push(key)
  }

  static removeSelectedCellKey(key) {
    _.remove(__selectedCells, (n) => n == key)
  }

  static clear() {
    __selectedCells = []
  }
}