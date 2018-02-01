import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import SlideItem from './SlideItem'
import Panel from './Panel'

export default class ConfirmPanel extends Panel {  
  
  constructor(props) {
    super(props)

    this.state = {
      show: false,
      confirmText: props.confirmText || 'Confirm', 
      cancelText: props.cancelText || undefined,
      message: props.message || undefined
    }

  }

  show() {
    this.setState({show: true})
  }

  hide() {
    this.setState({show: false})
  }

  _onPressConfirmButton() {
    if (this.onConfirm && typeof this.onConfirm == 'function')
      this.onConfirm()
  }

  _onPressCancelButton() {
    if (this.onCancel && typeof this.onCancel == 'function')
      this.onCancel()
  }

  checkComplete() {

    const { confirmText, cancelText, message } = this.state

    var done = true
    let items = []

    if (message != undefined)
     items.push(this.item1)

    items.push(this.item2)

    if (cancelText) 
      items.push(this.item3)

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

    const { show, confirmText, cancelText, message } = this.state

    return (
      <View pointerEvents="box-none" style={styles.view}>
        { message ? 
          <SlideItem
            style={styles.slideItem}
            ref={(item) => { this.item1 = item}}
            onFinishAnim={this.checkComplete.bind(this)}
            x={-80} 
            delay={50} 
            to={10} 
            show={show} >
            <Text style={styles.description}>
              {message}
            </Text>
          </SlideItem>
           : undefined }

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
              {confirmText}
            </Text>
          </TouchableOpacity>
        </SlideItem>
        { cancelText ? 
          <SlideItem
            style={styles.slideItem}
            ref={(item) => { this.item3 = item}}
            onFinishAnim={this.checkComplete.bind(this)}
            x={-80} 
            delay={200} 
            to={10} 
            show={show} >
            <TouchableOpacity onPress={this._onPressCancelButton.bind(this)}>
              <Text style={styles.title}>
                {cancelText}
              </Text>
            </TouchableOpacity>
          </SlideItem>
           : undefined }
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
    paddingBottom: 10,
    marginTop: 30
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