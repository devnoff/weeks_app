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
import WeekSwitchPanel from './WeekSwitchPanel'
import ItemManager from '../manager/item'
import { isIphoneX } from 'react-native-iphone-x-helper'

const smallScreen = Dimensions.get('window').width < 680

export default class HelloPanel extends Panel {  

  constructor(props) {
    super(props)

    this.state = {
      show: true,
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

  _handlePressAddButton() {
    ReactNativeHapticFeedback.trigger('impactLight')
    Notification.post('create_overlay_request')
  }

  _handlePressWeekButton() {
    
    // Notification.post('week_switch_request')

    let panelController = this.getPanelController()

    if (panelController.isAnimating()) return

    ReactNativeHapticFeedback.trigger()

    let endColumn = panelController.getParent()
    ItemManager.sharedInstance().lock()
    endColumn.moreButtonFadeOut()

    panelController.push({ 
      ref: 'weekSwitchPanel',
       el: <WeekSwitchPanel 
            ref={comp => panelController.refs['weekSwitchPanel'] = comp}
            />
    }, () => {
      ItemManager.sharedInstance().unlock()
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

    const { show, fade, week_no, start_date_str, end_date_str } = this.state

    return (
      <FadeItem 
        pointerEvents="box-none" style={[styles.view]}
        ref={(item) => { this.item = item}}
        onFinishAnim={this.checkComplete.bind(this)}
        delay={0}
        duration={300}
        show={show}
        >
        <TouchableWithoutFeedback onPress={this._handlePressWeekButton.bind(this)} style={{flex: 1}}>
          <View style={styles.weekView}>
            <Text style={styles.weekText}>WEEK<Text style={styles.weekNum}>#{week_no}</Text></Text>
            <Text style={styles.periodText}>{start_date_str}{"\n"}~ {end_date_str}</Text>
          </View>
        </TouchableWithoutFeedback>
        <View style={styles.buttonView}>
          <TouchableOpacity onPress={this._handlePressAddButton.bind(this)}>
            <View style={styles.buttonBox}>
                <Icon color="#333" name="plus" size={30}/>  
            </View>
          </TouchableOpacity>
        </View>
        <View pointerEvents="none" style={styles.extraSpace}></View>

      </FadeItem>
    );
  }
}


const styles = StyleSheet.create({
  view: {
    flex: 1
  },
  weekView: {
    flex: 1,
    alignItems: 'flex-start',
    paddingTop: 10,
    paddingLeft: 10
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
  },
  buttonBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10
  },
  extraSpace: {
    flex: 1,
    opacity: 0
  }
})