import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { isIphoneX } from 'react-native-iphone-x-helper'
import React, { Component } from 'react';
import {
Modal, View, Text, StyleSheet, Button, TouchableOpacity, TextInput,
ImageBackground, Platform, TouchableWithoutFeedback
} from 'react-native';
import FadeItem from './FadeItem'
import Notification from '../manager/notification';

export default class CreateItemModal extends Component {

  titleInput

  constructor(props) {
    super(props)

    this.state = {
      description: props.description ? props.description : 'Create To-Do Item',
      title: props.item ? props.item.title : null,
      note: props.item ? props.item.note : null,
      show: false
    }
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

  componentDidMount() {
    if (this.titleInput)
      this.titleInput.focus()

    this.show()
  }

  componentWillReceiveProps(nextProps) {
    this.setState(nextProps)
  }

  _onPressLeft() {
    this.titleInput.focus()
  }

  _onPressRight() {
    this.noteInput.focus()
  }

  _validate() {
    if (!this.state.title) {

      return false
    }

    return true
  }

  render() {
    const { show } = this.state
    return (
        <View 
          // show={show}
          // delay={100}
          style={styles.view}
        >
        <ImageBackground source={Platform.OS === 'ios' ? require('../images/3.png'): null} resizeMode={Platform.OS === 'ios' ? "repeat" : 'none'} style={{flex: 1, backgroundColor: '#f6f8f1'}}>
        <View style={styles.top} >
          <View style={styles.body}>
            <TouchableWithoutFeedback onPress={this._onPressLeft.bind(this)}>
              <View style={styles.titleView}>
                <TextInput
                  ref={(input) => {this.titleInput = input}}
                  isFocused={true}
                  style={styles.titleInput}
                  placeholder="Title"
                  onChangeText={(title) => {
                    this.setState({title})
                    Notification.post('title_text_input_change', title)
                  }}
                  value={this.state.title}
                />
              </View>
            </TouchableWithoutFeedback>
            <TouchableWithoutFeedback onPress={this._onPressRight.bind(this)}>
            <View style={styles.noteView}>
            <TextInput
                ref={(input) => {this.noteInput = input}}
                style={styles.noteInput}
                multiline={true}
                placeholder="Note"
                onChangeText={(note) => this.setState({note})}
                value={this.state.note}
              />
            </View>
            </TouchableWithoutFeedback>
          </View>
        </View>
        <View style={styles.bottom} >
        </View>
        </ImageBackground>
      </View>
    );
  }
}


const styles = StyleSheet.create({
  view: {
    backgroundColor: '#f6f8f1',
    flex: 1,
    flexDirection: 'column'
  },
  top: {
    flex: 1
  },
  bottom: {
    flex: 1
  },
  navigation: {
    paddingLeft: isIphoneX() ? 30 : 0,
    paddingRight: isIphoneX() ? 30 : 0,
    flex: 1,
    justifyContent: "space-between",
    flexDirection: 'row'
  },
  navigationItem: {
    justifyContent: "center",
    alignItems: 'center',
    width: 44,
    height: 44,
    marginRight: 10
  },
  body: {
    marginTop: 30,
    paddingLeft: isIphoneX() ? 55 : 0,
    paddingRight: isIphoneX() ? 55 : 0,
    flex: 2,
    flexDirection: 'row'
  },
  titleView: {
    flex: 1,
    marginLeft: 10
  },
  noteView: {
    flex: 1,
    paddingLeft: 20,
    borderLeftWidth: 1,
    borderLeftColor: '#ddd'
  },
  titleInput: {
    fontSize: 20
  },
  noteInput: {
    fontSize: 20
  }
})