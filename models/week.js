import { AsyncStorage } from 'react-native'
import {
  Dimensions
} from 'react-native';
import moment from 'moment'
import DataManager from '../manager/data'
import dummy from '../data/dummy'
import _ from 'lodash'

const smallScreen = Dimensions.get('window').width < 680

export default class WeekModel {

  _number = 0
  _week_id = null
  _date_start = null // moment obj
  _date_end = null
  _data = null
  _lastHandledItems = new Set()

  /* 
   * WeekModel is rely on moment.js object Moment to generate store key
   * 
   * @params {Moment} date
   * 
   */
  constructor(date) {
    let d = date || moment()
    this._number = d.isoWeek()
    this._week_id = `${d.year()}_${this._number}` // e.g. 2018_1
    this._date_start = moment(d).startOf('isoWeek')
    // console.log(this._week_id)
    this._date_end = moment(d).endOf('isoWeek')
    // console.log(this._date_end)

    
    // DataManager.setWeekDataForKey('2018_7', this._data)


    try {
      
    } catch(e) {
      throw Error('Error at Initializing WeekModel due to fetch week data')
    }
  }

  getYear = () => {
    return this._week_id.substring(0, 4)
  }

  rawData = () => {
    return this._data
  }

  getWeekNumber = () => {
    return this._number
  }

  getStartDateStr = () => {
    return this._date_start.format(smallScreen ? 'D MMM \'YY' :'D MMM YYYY')
  }

  getEndDateStr = () => {
    return this._date_end.format(smallScreen ? 'D MMM \'YY' :'D MMM YYYY')
  }

  lastHandledItemsSet = () => {
    return this._lastHandledItems
  }

  weekId = () => {
    return this._week_id
  }

  isThisWeek = () => {
    let d = moment()
    let wn = d.isoWeek()
    let y = d.year()
    return (this._number == wn && this.getYear() == y)
  }

  isCurrentWeek() {

    let d = moment()
    let week_id = `${d.year()}_${d.isoWeek()}` // e.g. 2018_1
    
    return (this._week_id == week_id)
  }

  async getData(callback) {
    // this._data = dummy
    // this._data = require('../data/initial_data')
    if (this._data != null) {
      console.log(this._data, 'loadData exist data')
      return callback(this._data)
    }
    else {
      try {
        this._data = await DataManager.getWeekDataForKey(this._week_id)
        console.log(this._data, 'loadData new')
        if (!this._data) {
          this._data = Object.assign({}, require('../data/initial_data.json'))
          this._data.week_id = this._week_id
        }
        callback(this._data)
      } catch (e) {
        callback(null)
      }
    }
    
  }

  async setData(data, callback) {
    if (!data) return callback(false)
    else {
      try {
        await DataManager.setWeekDataForKey(this._week_id, data)
        console.log(this._week_id, 'setData')
        console.log(data)
        this._data = data
        callback(true)
      } catch (e) {
        callback(false)
      }
    }
  }

  getWeekDataAtColumn(column, callback) {
    this.getData((data) => {
      if (data) {
        let to_do = data.to_do
        var data = {}
        let keys = Object.keys(to_do)
        for (var k in keys) {
          var key = keys[k]
          try {
            data[key] = to_do[key][column]
          } catch (e) {
            data[key] = []
          }
        }
        callback(data)
      } else {
        callback(null)
      }
      
      
    })
  }

  addToDoItemsForCellIds(newItem, cell_ids) {
    // console.log(cell_ids)
    let newItems = new Set()
    return new Promise((resolve, reject) => {
      // console.log('addToDoItemsForCellIds')
      try {
        for (var i in cell_ids) {
          var item = Object.assign({}, newItem)
          var arr = cell_ids[i].split('_')
          var day = arr[0]
          var column = arr[1]
          var cell = this._data.to_do[day][column]
          item.order = cell.length

          let max = _.maxBy(cell, 'id')
          item.id = max ? max.id + 1 : 0
          
          var key = `${day}_${column}_${item.id}`
          item.key = key
          
          cell.push(item)
          newItems.add(key)
        }
        DataManager.setWeekDataForKey(this._week_id, this._data)
        this._lastHandledItems = newItems
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
      let id = item.id
      let cell = this._data.to_do[day][column]
      let idx = _.findIndex(cell, {id: id})
      if (idx > -1)
        cell.splice(idx, 1)

      this._data.to_do[day][column] = cell

      console.log(cell)

      // re-arrange
      for (var i in cell) {
        let itm = cell[i]
        itm.order = i
      }
      try {
        console.log('delete item')
        console.log(this._data)
        DataManager.setWeekDataForKey(this._week_id, this._data)
        resolve()
      } catch (e) {
        reject(e)
      }
    })
  }

  async replaceToDoItemAt(day, column, index, item) {
    return new Promise((resolve, reject) => {
      let cell = this._data.to_do[day][column]
      if (cell.length <= index) return reject({message:'request index is out of bounds'})
      cell[index] = item
      try {
        DataManager.setWeekDataForKey(this._week_id, this._data)
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
    let id = item.id

    return new Promise((resolve, reject) => {
      var data = this._data.to_do[day][column]
      let cell = this._data.to_do[day][column]
      let idx = _.findIndex(cell, {id: id})
      if (idx > -1)
        cell[idx] = Object.assign({}, item)

      try {
        DataManager.setWeekDataForKey(this._week_id, this._data)
        console.log('update item')
        console.log(this._data)
        this._lastHandledItems = new Set([item.key])
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
    for (var i in items) {
      let item = items[i]
      newCell.push(item)
    }

    console.log(newCell)
    return new Promise((resolve, reject) => {
      this._data.to_do[day][column] = newCell
      try {
        DataManager.setWeekDataForKey(this._week_id, this._data)
        console.log('updateOrder')
        console.log(this._data)
        resolve(Array.from(newCell))
      } catch (e) {
        reject(e)
      }
    })

  }

  reset() {
    this._data = require('../data/initial_data')
    return new Promise((resolve, reject) => {
      try {
        DataManager.setWeekDataForKey(this._week_id, this._data)
        this._lastHandledItems = new Set()
        resolve()
      } catch (e) {
        reject(e)
      }
    })
  }

  isEmpty() {

    var count = 0
    let to_do = this._data.to_do
    let keys = Object.keys(to_do)
    for (var k in keys) {
      var key = keys[k]
      var cols = to_do[key]
      for (var i in cols) {
        var col = cols[i]
        count += col.length
      }
    }

    return count < 1
  }

}