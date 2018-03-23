import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import ReactNativeHapticFeedback from 'react-native-haptic-feedback'
import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  Dimensions
} from 'react-native';
import FadeItem from './FadeItem'
import Panel from './Panel'
import CreateItemModal from './CreateItemModal'
import Notification from '../manager/notification'
import WeekManager from '../manager/week'
import ItemManager from '../manager/item'
import { isIphoneX } from 'react-native-iphone-x-helper'
import strings from '../i18n/localization'

const smallScreen = Dimensions.get('window').width < 680

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
  }

  show() {
    this.setState({show: true})
  }

  hide() {
    this.setState({show: false})
  }

  _handlePressCloseButton() {
    ReactNativeHapticFeedback.trigger('selection')
    ItemManager.sharedInstance().lock()
    let endColumn = this.getPanelController().getParent()
    this.getPanelController().popToRootPanel(() => {
      endColumn.moreButtonFadeIn()
      ItemManager.sharedInstance().unlock()
    })
  }

  _handlePressPrevButton() {
    ReactNativeHapticFeedback.trigger()
    Notification.post('prev_week_request')
    this.setState({
      year: WeekManager.getCurrentWeek().getYear(),
      week_no: WeekManager.getCurrentWeek().getWeekNumber(),
      start_date_str: WeekManager.getCurrentWeek().getStartDateStr(),
      end_date_str: WeekManager.getCurrentWeek().getEndDateStr()
    })
  }

  _handlePressNextButton() {
    ReactNativeHapticFeedback.trigger()
    Notification.post('next_week_request')
    this.setState({
      year: WeekManager.getCurrentWeek().getYear(),
      week_no: WeekManager.getCurrentWeek().getWeekNumber(),
      start_date_str: WeekManager.getCurrentWeek().getStartDateStr(),
      end_date_str: WeekManager.getCurrentWeek().getEndDateStr()
    })
  }

  _handleLongPressWeekButton() {

    ReactNativeHapticFeedback.trigger('impactHeavy')

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
              <Icon color="#333" name="chevron-up" size={32} />
            </View>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onLongPress={this._handleLongPressWeekButton.bind(this)} onPress={this._handlePressCloseButton.bind(this)} style={styles.weekBox}>
          <View style={styles.weekView}>
            <View style={styles.selectBox}>
              <Text style={styles.select}>{strings.press_select}</Text>
            </View>
            <Text style={styles.weekText}>{year}<Text style={styles.weekNum}>#{week_no}</Text></Text>
            <Text style={styles.periodText}>{start_date_str}{"\n"}~ {end_date_str}</Text>
          </View>
        </TouchableOpacity>
        <View style={styles.buttonView}>
          <TouchableOpacity onPress={this._handlePressNextButton.bind(this)}>
            <View style={styles.buttonBox}>
              {/* <Text style={styles.buttonText}>Next Week</Text> */}
              <Icon color="#333" name="chevron-down" size={32} />
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
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginLeft: 10,
  },
  weekView: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingTop: 10,
    paddingLeft: 0,
    // backgroundColor: 'red'
  },
  weekText: {
    // fontWeight: '700',
    fontFamily: 'Courier-Bold',
    fontSize: !smallScreen ? 20 : 18,
    color: '#333',
    lineHeight: !smallScreen ? 24 : 22,
  },
  weekNum: {
    fontSize: !smallScreen ? 24 : 22,
  },
  periodText: {
    fontFamily: 'Courier',
    fontSize: !smallScreen ? 12 : 11,
    color: '#aaa',
    marginTop: 3,
    lineHeight: !smallScreen ? 13 : 12
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
    // fontWeight: 'bold',
    fontFamily: 'Courier-Bold',
    fontSize: 14,
  },
  selectBox: {
    // height: 14,
    backgroundColor: 'black',
    paddingHorizontal: 3,
    paddingVertical: 1,
    borderRadius: 4,
    borderColor: '#000',
    marginBottom: 5,
  },
  select: {
    color: 'white',
    fontSize: 8
  }
})