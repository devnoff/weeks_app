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

export default class ImportConfirmPanel extends Panel {  
  state = {
    show: false,
  }

  constructor(props) {
    super(props)
  }

  show() {
    this.setState({show: true})
  }

  hide() {
    this.setState({show: false})
  }

  _onPressConfirmButton() {
    alert('pressed confirm')
  }

  checkComplete() {
    var done = true
    let items = [this.item1, this.item2,this.item3]
    for (var i in items) {

      let item = items[i]

      if (this.state.show && !item.state.visible) {
        done = false
      }

      if (!this.state.show && item.state.visible) {
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

    const { show, showSettingModal } = this.state

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
            Current week is not empty, choose a action you want execute
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
              Merge
            </Text>
          </TouchableOpacity>
        </SlideItem>
        <SlideItem 
          style={styles.slideItem}
          ref={(item) => { this.item3 = item}}
          onFinishAnim={this.checkComplete.bind(this)}
          x={-80} 
          delay={150} 
          to={10} 
          show={show} >
          <TouchableOpacity onPress={this._onPressConfirmButton.bind(this)}>
            <Text style={styles.title}>
              Replace
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
    fontFamily: 'courier',
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 25
  },
  description: {
    fontFamily: 'courier',
    color: '#aaa',
    fontWeight: 'normal',
    fontSize: 12,
    marginTop: 10,
    marginRight: 10
  },
  extraSpace: {

  }
})