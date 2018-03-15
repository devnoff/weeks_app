import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import moment from 'moment'
import { isIphoneX } from 'react-native-iphone-x-helper'
import React, { Component } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TouchableWithoutFeedback
} from 'react-native';
import SlideItem from './SlideItem'

export default class WeekHeader extends Component {

  state = {
    show: true,
    selectedRow: null
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.show == true) {
      this.show()
    } else if (nextProps.show == false) {
      this.hide()
    }

    // if (nextProps.hasOwnProperty('selectionMode')) {
    //   this.setState({
    //     selectionMode: selectionMode
    //   })
    // }
  }

  show() {
    this.setState({show: true})
  }

  hide() {
    this.setState({show: false})
  }

  _onPress(day, e) {
    const { selectionMode } = this.props
    if (selectionMode) return
    
    var selected = this.state.selectedRow == day ? null : day
    this.setState({
      selectedRow: selected
    })
    this.props.onSelectedRow(selected)
  }

  _getDayView(name) {
    const { week, selectionMode } = this.props
    const { selectedRow } = this.state
    let days = ['sun','mon','tue','wed','thu','fri','sat']
    let todayStr = days[moment().day()]
    let isToday = todayStr === name && week.isThisWeek()
    let isSunday = name === 'sun'

    var textBoxStyle = [styles.textBox]
    if (isToday) textBoxStyle.push(styles.textBoxSelected)

    var textStyle = [styles.text]
    if (isSunday) textStyle.push(styles.sunText)
    if (isToday) textStyle.push(styles.todayText)

    var selected
    if (name == selectedRow && !selectionMode)
      selected = { 
        backgroundColor: '#dde0d2', //b6baae22
        borderTopStartRadius: isIphoneX() ? 15 : 0,
        borderBottomStartRadius: isIphoneX() ? 15 : 0
      }

    return (<TouchableWithoutFeedback onPress={this._onPress.bind(this, name)}>
              <View style={[styles.view, selected]}>
                <View style={textBoxStyle}>
                  <Text style={textStyle}>{name}</Text>
                </View>
              </View>
            </TouchableWithoutFeedback>)
  }

  render() {
    return (
      <SlideItem 
        style={{flex: 1, alignItems: 'center'}}
        show={this.state.show}
        x={100} 
        delay={0} 
        to={0} 
        fade={1}
      >
        <View style={{
          flex: isIphoneX() ? 2 : 0.8,
          flexDirection: 'row',
          overflow: 'hidden'
        }}>
          <TouchableOpacity style={styles.iconBox} onPress={this.props.onPressSetting}>
            {/* <Icon style={{color:"#aaa"}} name="unfold-more-vertical"/> */}
            <Icon style={{color:"#aaa"}} size={14} name="information-variant"/>
          </TouchableOpacity>
        </View>
        {this._getDayView('mon')}
        {this._getDayView('tue')}
        {this._getDayView('wed')}
        {this._getDayView('thu')}
        {this._getDayView('fri')}
        {this._getDayView('sat')}
        {this._getDayView('sun')}
        {function(){
          if (isIphoneX()) 
            return (<View style={{flex: 1}}></View>)
          else ''
        }()}
      </SlideItem>
    );
  }
}


const styles = StyleSheet.create({
  view: {
    flex: isIphoneX() ? 2 : 1,
    flexDirection: 'row',
    overflow: 'hidden'
  },
  iconBox: {
    flex:1,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: 'red'
  },
  textBox: {
    flex:1,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: 'red'
  },
  textBoxSelected: {
    // borderWidth: 0.5,
    borderColor: '#aaa',
    borderRadius: 5,
    marginRight: 5,
    marginLeft: 5,
    marginTop: 10,
    marginBottom: 10
  },
  text: {
    // fontWeight: 'bold',
    fontFamily: 'Courier-Bold',
    color: '#333',
    // backgroundColor: 'white',
    fontSize: 14,
    lineHeight: 15
  },
  sunText: {
    color: 'brown'
  },
  todayText: {
    // fontSize: 20,
    textDecorationLine: 'underline'
  }
});