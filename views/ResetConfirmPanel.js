import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import SlideItem from './SlideItem'
import Panel from './Panel'
import Notification from '../manager/notification'
import WeekManager from '../manager/week'
import strings from '../i18n/localization'

export default class ResetConfirmPanel extends Panel {  

  constructor(props) {
    super(props)

    let week = WeekManager.getCurrentWeek()

    this.state = {
      show: false,
      year: week.getYear(),
      weekNo: week.getWeekNumber()
    }
  }

  show() {
    this.setState({show: true})
  }

  hide() {
    this.setState({show: false})
  }

  _onPressConfirmButton() {
    Notification.post('reset_this_week_request')
  }

  checkComplete() {
    var done = true
    let items = [this.item1, this.item2]
    for (var i in items) {

      let item = items[i]

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

    const { show, showSettingModal, year, weekNo } = this.state

    return (
      <View pointerEvents="box-none" style={styles.view}>
        <SlideItem
          style={styles.slideItem}
          ref={(item) => { this.item1 = item}}
          onFinishAnim={this.checkComplete.bind(this)}
          x={-80} 
          delay={50} 
          to={10} 
          show={show} >
          <Text style={styles.description}>
            {strings.formatString(strings.reset_confirm_desc, `${year}#${weekNo}`)}
          </Text>
        </SlideItem>
        <SlideItem 
          style={styles.slideItem}
          ref={(item) => { this.item2 = item}}
          onFinishAnim={this.checkComplete.bind(this)}
          x={-80} 
          delay={150} 
          to={10} 
          show={show} >
          <TouchableOpacity onPress={this._onPressConfirmButton.bind(this)}>
            <Text style={styles.title}>
            {strings.confirm}
            </Text>
          </TouchableOpacity>
        </SlideItem>
        <View pointerEvents="none" style={styles.extraSpace}></View>
      </View>  
    );
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