import { AsyncStorage } from 'react-native'
import moment from 'moment'
import DataManager from '../manager/data'
import dummy from '../data/dummy'

var _number = 0
var _week_id = null
var _date_start = null // moment obj
var _date_end = null
var _data = null
var _lastHandledItems = new Set()

export default class WeekModel {

  /* 
   * WeekModel is rely on moment.js object Moment to generate store key
   * 
   * @params {Moment} date
   * 
   */
  constructor(date) {
    let d = date || moment()
    _number = d.isoWeek()
    _week_id = `${d.year()}_${_number}` // e.g. 2018_1
    _date_start = moment(d).startOf('isoWeek')
    console.log(_date_start)
    _date_end = moment(d).endOf('isoWeek')
    console.log(_date_end)

    // _data = require('../data/dummy')
    // return

    try {
      
    } catch(e) {
      throw Error('Error at Initializing WeekModel due to fetch week data')
    }

    this.rawData = () => {
      return _data
    }

    this.getWeekNumber = () => {
      return _number
    }

    this.getStartDateStr = () => {
      return _date_start.format('D MMM YYYY')
    }

    this.getEndDateStr = () => {
      return _date_end.format('D MMM YYYY')
    }

    this.lastHandledItemsSet = () => {
      return _lastHandledItems
    }
  }

  isCurrentWeek() {

    let d = moment()
    let week_id = `${d.year()}_${d.isoWeek()}` // e.g. 2018_1
    
    return (_week_id == week_id)
  }

  async getData(callback) {
    // _data = dummy
    // _data = require('../data/initial_data')
    if (_data != null) return callback(_data)
    else {
      try {
        _data = await DataManager.getWeekDataForKey(_week_id)
        if (!_data) _data = require('../data/initial_data')
        callback(_data)
      } catch (e) {
        callback(null)
      }
    }
    
  }

  getWeekDataAtColumn(index, callback) {
    this.getData((data) => {
      let to_do = data.to_do
      var data = {}
      let keys = Object.keys(to_do)
      for (var k in keys) {
        var key = keys[k]
        try {
          data[key] = to_do[key][index]
        } catch (e) {
          data[key] = []
        }
      }
      callback(data)
    })
  }

  addToDoItemsForCellIds(newItem, cell_ids) {
    // console.log(cell_ids)
    let newItems = new Set()
    return new Promise((resolve, reject) => {
      // console.log('addToDoItemsForCellIds')
      try {
        for (var i in cell_ids) {
          var item = JSON.parse(JSON.stringify(newItem))
          var cell_id = cell_ids[i].split('_')
          var day = cell_id[0]
          var column = cell_id[1]
          var cell = _data.to_do[day][column]
          var key = `${day}_${column}_${cell.length}`
          item.key = key
          cell.push(item)
          newItems.add(key)
        }
        DataManager.setWeekDataForKey(_week_id, _data)
        _lastHandledItems = newItems
        resolve()
      } catch (e) {
        reject(e)
      }
    })
  }

  async addToDoItemAt(day, column, item) {
    return new Promise((resolve, reject) => {
      let cell = _data.to_do[day][column]
      cell.push(item)
      try {
        DataManager.setWeekDataForKey(_week_id, _data)
        resolve()
      } catch (e) {
        reject(e)
      }
    })
  }

  async removeToDoItemAt(day, column, index) {
    return new Promise((resolve, reject) => {
      let cell = _data.to_do[day][column]
      if (cell.length <= index) return reject({message:'request index is out of bounds'})
      cell.splice(index, 1)
      try {
        DataManager.setWeekDataForKey(_week_id, _data)
        resolve()
      } catch (e) {
        reject(e)
      }
    })
  }

  async deleteToDoItem(item) {
    return new Promise((resolve, reject) => {
      let key = item.key
      let arr = key.split('_')
      let day = arr[0]
      let column = arr[1]
      let index = arr[2]
      let cell = _data.to_do[day][column]
      if (cell.length <= index) return reject({message:'request index is out of bounds'})
      cell.splice(index, 1)

      // re-arrange
      for (var i in cell) {
        let itm = cell[i]
        itm.key = `${day}_${column}_${i}`
      }
      try {
        DataManager.setWeekDataForKey(_week_id, _data)
        resolve()
      } catch (e) {
        reject(e)
      }
    })
  }

  async replaceToDoItemAt(day, column, index, item) {
    return new Promise((resolve, reject) => {
      let cell = _data.to_do[day][column]
      if (cell.length <= index) return reject({message:'request index is out of bounds'})
      cell[index] = item
      try {
        DataManager.setWeekDataForKey(_week_id, _data)
        resolve()
      } catch (e) {
        reject(e)
      }
    })
  }

  async updateToDoItem(item) {
    let key = item.key
    let arr = key.split('_')
    let day = arr[0]
    let column = arr[1]
    let index = arr[2]

    return new Promise((resolve, reject) => {
      var data = _data.to_do[day][column]
      if (data.length <= index) return reject({message:'request index is out of bounds'})
      data = [
        ...data.slice(0, index),
        Object.assign({}, item),
        ...data.slice(index + 1)
      ]
      _data.to_do[day][column] = data

      try {
        DataManager.setWeekDataForKey(_week_id, _data)
        _lastHandledItems = new Set([item.key])
        resolve()
      } catch (e) {
        reject(e)
      }
    })
  }

  async updateOrder(cell_id, items) {
    let arr = cell_id.split('_')
    let day = arr[0]
    let column = arr[1]
    var newCell = []
    console.log(items)
    for (var i in items) {
      let item = items[i]
      newCell.push(item)
    }
    return new Promise((resolve, reject) => {
      _data.to_do[day][column] = newCell
      try {
        DataManager.setWeekDataForKey(_week_id, _data)
        resolve(Array.from(newCell))
      } catch (e) {
        reject(e)
      }
    })

  }

  _getItem(key) {
    let arr = key.split('_')
    let day = arr[0]
    let column = arr[1]
    let index = arr[2]
    let cell = _data.to_do[day][column]
    return cell[index] || null
  }
}