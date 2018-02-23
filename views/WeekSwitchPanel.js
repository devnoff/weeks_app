import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import ReactNativeHapticFeedback from 'react-native-haptic-feedback'
import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated
} from 'react-native';
import FadeItem from './FadeItem'
import Panel from './Panel'
import CreateItemModal from './CreateItemModal'
import Notification from '../manager/notification'
import WeekManager from '../manager/week'
import ItemManager from '../manager/item'

export default class WeekSwitchPanel extends Panel {  

  constructor(props) {
    super(props)

    this.state = {
      show: true,
      year: WeekManager.getCurrentWeek().getYear(),
      week_no: WeekManager.getCurrentWeek().getWeekNumber(),
      start_date_str: WeekManager.getCurrentWeek().getStartDateStr(),
      end_date_str: WeekManager.getCurrentWeek().getEndDateStr()
    }

    console.log('dd')
  }

  show() {
    this.setState({show: true})
  }

  hide() {
    this.setState({show: false})
  }

  _handlePressAddButton() {
    ReactNativeHapticFeedback.trigger('impactLight')
    Notification.post('create_overlay_request')
  }

  _handlePressCloseButton() {
    ItemManager.sharedInstance().lock()
    let endColumn = this.getPanelController().getParent()
    this.getPanelController().pop(() => {
      endColumn.moreButtonFadeIn()
      ItemManager.sharedInstance().unlock()
    })
  }

  _handlePressPrevButton() {
    Notification.post('prev_week_request')
    this.setState({
      year: WeekManager.getCurrentWeek().getYear(),
      week_no: WeekManager.getCurrentWeek().getWeekNumber(),
      start_date_str: WeekManager.getCurrentWeek().getStartDateStr(),
      end_date_str: WeekManager.getCurrentWeek().getEndDateStr()
    })
  }

  _handlePressNextButton() {
    Notification.post('next_week_request')
    this.setState({
      year: WeekManager.getCurrentWeek().getYear(),
      week_no: WeekManager.getCurrentWeek().getWeekNumber(),
      start_date_str: WeekManager.getCurrentWeek().getStartDateStr(),
      end_date_str: WeekManager.getCurrentWeek().getEndDateStr()
    })
  }

  _handleLongPressWeekButton() {

    ReactNativeHapticFeedback.trigger('impactLight')

    if (WeekManager.getCurrentWeek().isThisWeek()) return

    Notification.post('this_week_request')
    this.setState({
      year: WeekManager.getCurrentWeek().getYear(),
      week_no: WeekManager.getCurrentWeek().getWeekNumber(),
      start_date_str: WeekManager.getCurrentWeek().getStartDateStr(),
      end_date_str: WeekManager.getCurrentWeek().getEndDateStr()
    })
  }

  checkComplete() {
    if (this.state.show) {
      // console.log('on show!')
      if (this.onShow) this.onShow()
    } else {
      if (this.onHide) this.onHide()
    }
  }

  render() {

    const { show, fade, week_no, start_date_str, end_date_str, year } = this.state

    return (
      <FadeItem 
        pointerEvents="box-none" style={[styles.view]}
        ref={(item) => { this.item = item}}
        onFinishAnim={this.checkComplete.bind(this)}
        delay={200}
        duration={300}
        show={show}
        >
        <View style={styles.buttonView}>
          <TouchableOpacity onPress={this._handlePressPrevButton.bind(this)}>
            <View style={styles.buttonBox}>
              {/* <Text style={styles.buttonText}>Prev. Week</Text> */}
              <Icon name="chevron-up" size={32} />
            </View>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onLongPress={this._handleLongPressWeekButton.bind(this)} onPress={this._handlePressCloseButton.bind(this)} style={styles.weekBox}>
          <View style={styles.weekView}>
            <Text style={styles.weekText}>{year}<Text style={styles.weekNum}>#{week_no}</Text></Text>
            <Text style={styles.periodText}>{start_date_str}{"\n"}~ {end_date_str}</Text>
          </View>
        </TouchableOpacity>
        <View style={styles.buttonView}>
          <TouchableOpacity onPress={this._handlePressNextButton.bind(this)}>
            <View style={styles.buttonBox}>
              {/* <Text style={styles.buttonText}>Next Week</Text> */}
              <Icon name="chevron-down" size={32} />
            </View>
          </TouchableOpacity>
        </View>
      </FadeItem>
    );
  }
}


const styles = StyleSheet.create({
  view: {
    flex: 1
  },
  weekBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekView: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingTop: 10,
    paddingLeft: 10,
    // backgroundColor: 'red'
  },
  weekText: {
    fontWeight: 'bold',
    fontFamily: 'courier',
    fontSize: 22
  },
  weekNum: {
    fontSize: 24
  },
  periodText: {
    fontFamily: 'courier',
    fontSize: 12,
    color: '#aaa',
  },
  buttonView: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    // backgroundColor: 'blue'
  },
  buttonBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    // backgroundColor: 'red'
  },
  buttonText: {
    textAlign: 'left',
    fontWeight: 'bold',
    fontFamily: 'courier',
    fontSize: 14,
  },
})