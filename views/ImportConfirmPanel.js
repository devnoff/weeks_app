import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform
} from 'react-native';
import SlideItem from './SlideItem'
import Panel from './Panel'
import Notification from '../manager/notification'
import WeekModel from '../models/week'
import moment from 'moment'
import WeekManager from '../manager/week'

export default class ImportConfirmPanel extends Panel {  
  items = {}

  constructor(props) {
    super(props)

    let week = WeekManager.getCurrentWeek()
    console.log(week, 'ImportConfirmPanel week')
   
    this.state = {
      show: false,
      disabled: false,
      available: true,
      week: week,
      aweekago:  new WeekModel(moment().year(week.getYear()).isoWeek(week.getWeekNumber()-1))
    }
  }


  show() {
    this.setState({show: true})
  }

  hide() {
    this.setState({show: false})
  }

  _onPressConfirmButton() {
    let lastWeek = this.state.aweekago
    lastWeek.getData(() => {
      if (lastWeek.isEmpty()) {
        this.setState({available: false})
      } else {
        Notification.post('import_from_prev_week_request')
      }
    })
  }


  checkComplete() {
    var done = true
    let items = this.items
    let keys = Object.keys(items)
    console.log(keys)
    for (let i of keys) {
      let item = items[i]

      if (!item) continue

      if (this.state.show && !item.visible) {
        done = false
      }

      if (!this.state.show && item.visible) {
        done = false
      }
    }

    if (!done) return

    if (this.state.show) {
      if (this.onShow) this.onShow()
    } else {
      if (this.onHide) this.onHide()
    }
    
  }

  render() {

    const { show, showSettingModal, available, week, aweekago } = this.state

    let prev = aweekago.getWeekNumber()
    let prevYear = aweekago.getYear()
    let curr = week.getWeekNumber()
    let currYear = week.getYear()


    return function() {
      if (!available) {
        return (
        <View pointerEvents="box-none" style={styles.view}>
          <SlideItem
            style={styles.slideItem}
            ref={(item) => { this.items['0'] = item}}
            onFinishAnim={this.checkComplete.bind(this)}
            x={-80} 
            delay={50} 
            to={10} 
            show={show} >
            <Text style={styles.description}>
              Nothing to import in previous week {prevYear}#{prev}
            </Text>
          </SlideItem>
        </View>
        )
      } else {
        return (
          <View pointerEvents="box-none" style={styles.view}>
            <SlideItem
              style={styles.slideItem}
              ref={(item) => { this.items['1'] = item}}
              onFinishAnim={this.checkComplete.bind(this)}
              x={-80} 
              delay={50} 
              to={10} 
              show={show} >
              <Text style={styles.description}>
                Will you import to-do items from previous week {prevYear}#{prev} to current week {currYear}#{curr}?
              </Text>
            </SlideItem>
            <SlideItem 
              style={styles.slideItem}
              ref={(item) => { this.items['2'] = item}}
              onFinishAnim={this.checkComplete.bind(this)}
              x={-80} 
              delay={150} 
              to={10} 
              show={show} >
              <TouchableOpacity onPress={this._onPressConfirmButton.bind(this)}>
                <Text style={styles.title}>
                  Import
                </Text>
              </TouchableOpacity>
            </SlideItem>
            <View pointerEvents="none" style={styles.extraSpace}></View>
          </View>
        )
      }
    }.bind(this)()
  }
}


const styles = StyleSheet.create({
  view: {
    flex: 1
  },
  slideItem: {
    justifyContent: 'center'
  },
  title: {
    fontFamily: 'Courier-Bold',
    // fontWeight: 'bold',
    fontSize: 16,
    marginTop: 25,
    color: '#333'
  },
  description: {
    fontFamily: 'Courier',
    color: '#aaa',
    fontWeight: 'normal',
    fontSize: 12,
    marginTop: 10,
    marginRight: 10
  },
  extraSpace: {

  }
})