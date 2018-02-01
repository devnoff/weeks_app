import { AsyncStorage } from 'react-native'
import lodash from 'lodash'
import moment from 'moment'
import DataManager from '../manager/data'
import dummy from '../data/dummy'

var _number = 0
var _week_id = null
var _date_start = null // moment obj
var _data = null

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
    _date_start = d.startOf('isoWeek')

    // _data = require('../data/dummy')
    // return

    try {
      
    } catch(e) {
      throw Error('Error at Initializing WeekModel due to fetch week data')
    }
  }

  isCurrentWeek() {
    let d = moment()
    return (_number == d.isoWeek())
  }

  async getData(callback) {
    // _data = dummy
    if (_data) return callback(_data)
    else {
      try {
        _data = await DataManager.getWeekDataForKey(_week_id)
        if (!_data) _data = require('../data/initial_data')
      } catch (e) {
        callback(null)
      }
    }
    callback(_data)
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



}