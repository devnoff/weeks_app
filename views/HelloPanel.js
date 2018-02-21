import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import ReactNativeHapticFeedback from 'react-native-haptic-feedback'
import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated
} from 'react-native';
import FadeItem from './FadeItem'
import Panel from './Panel'
import CreateItemModal from './CreateItemModal'
import Notification from '../manager/notification'
import WeekManager from '../manager/week'

export default class HelloPanel extends Panel {  

  constructor(props) {
    super(props)

    this.state = {
      showModal: false,
      show: true,
      week_no: WeekManager.getCurrentWeek().getWeekNumber(),
      start_date_str: WeekManager.getCurrentWeek().getStartDateStr(),
      end_date_str: WeekManager.getCurrentWeek().getEndDateStr()
    }
  }

  showModal() {
    this.setState({showModal: true})
  }

  hideModal() {
    this.setState({showModal: false})
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

  checkComplete() {
    if (this.state.show) {
      // console.log('on show!')
      if (this.onShow) this.onShow()
    } else {
      if (this.onHide) this.onHide()
    }
  }

  render() {

    const { show, showModal, fade, week_no, start_date_str, end_date_str } = this.state

    return (
      <FadeItem 
        pointerEvents="box-none" style={[styles.view]}
        ref={(item) => { this.item = item}}
        onFinishAnim={this.checkComplete.bind(this)}
        delay={0}
        duration={300}
        show={show}
        >
        <View style={styles.weekView}>
          <Text style={styles.weekText}>WEEK<Text style={styles.weekNum}>#{week_no}</Text></Text>
          <Text style={styles.periodText}>{start_date_str}{"\n"}~ {end_date_str}</Text>
        </View>
        <View style={styles.buttonView}>
          <TouchableOpacity onPress={this._handlePressAddButton.bind(this)}>
            <View style={styles.buttonBox}>
                <Icon name="plus" size={30}/>  
            </View>
          </TouchableOpacity>
        </View>
        <View pointerEvents="none" style={styles.extraSpace}></View>

        {/* ------- Modals ------ */}
        
        {(showModal ? <CreateItemModal 
          visible={showModal}
          animationType={'slide'}
          onRequestClose={() => this.hideModal()}
          supportedOrientations={['landscape']} /> : undefined)}
        
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
    fontWeight: 'bold',
    fontFamily: 'courier',
    fontSize: 20
  },
  weekNum: {
    fontSize: 24
  },
  periodText: {
    fontFamily: 'courier',
    fontSize: 12,
    color: '#aaa',
    marginTop: 5
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