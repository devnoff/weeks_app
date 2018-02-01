import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import moment from 'moment'
import { isIphoneX } from 'react-native-iphone-x-helper'
import React, { Component } from 'react';
import {
  View, Text, StyleSheet
} from 'react-native';
import SlideItem from './SlideItem'

export default class WeekHeader extends Component {

  state = {
    show: true
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.show == true) {
      this.show()
    } else if (nextProps.show == false) {
      this.hide()
    }
  }

  show() {
    this.setState({show: true})
  }

  hide() {
    this.setState({show: false})
  }

  _getDayView(name) {
    let days = ['sun','mon','tue','wed','thu','fri','sat']
    let todayStr = days[moment().day()]
    let isToday = todayStr === name
    let isSunday = name === 'sun'

    var textBoxStyle = [styles.textBox]
    if (isToday) textBoxStyle.push(styles.textBoxSelected)

    var textStyle = [styles.text]
    if (isSunday) textStyle.push(styles.sunText)
    if (isToday) textStyle.push(styles.todayText)

    return (<View style={styles.view}>
              <View style={textBoxStyle}>
                <Text style={textStyle}>{name}</Text>
              </View>
            </View>)
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
        <View style={styles.view}>
          <View style={styles.iconBox}>
            <Icon style={{color:"#aaa"}} name="unfold-more-vertical"/>
          </View>
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
    alignItems: 'center'
  },
  textBox: {
    flex:1,
    justifyContent: 'center',
    alignItems: 'center'
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
    fontWeight: 'bold',
    fontFamily: 'courier',
  },
  sunText: {
    color: 'brown'
  },
  todayText: {
    // fontSize: 20,
    textDecorationLine: 'underline'
  }
});