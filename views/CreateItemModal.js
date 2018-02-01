import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { isIphoneX } from 'react-native-iphone-x-helper'
import React, { Component } from 'react';
import {
Modal, View, Text, StyleSheet, Button, TouchableOpacity, TextInput,
ImageBackground, Platform, TouchableWithoutFeedback
} from 'react-native';
import FadeItem from './FadeItem'

export default class CreateItemModal extends Component {

  titleInput

  constructor(props) {
    super(props)

    this.state = {
      title: null,
      note: null,
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

  _onPressClose() {
    const { onRequestClose } = this.props
    if (onRequestClose) onRequestClose()
  }

  _onPressDone() {
    const { onRequestDone } = this.props
    if (onRequestDone) onRequestDone()
  }

  _onPressLeft() {
    this.titleInput.focus()
  }

  _onPressRight() {
    this.noteInput.focus()
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
          {/* <View style={styles.navigation}>
            <TouchableOpacity onPress={this._onPressClose.bind(this)} style={styles.navigationItem}>
              <Icon name="close" size={20} />
            </TouchableOpacity>
            <TouchableOpacity onPress={this._onPressDone.bind(this)} style={styles.navigationItem}>
              <Text style={{fontWeight: 'bold', fontSize: 15,fontFamily: 'courier'}}>Done</Text>
            </TouchableOpacity>
          </View> */}
          <View style={styles.body}>
            <TouchableWithoutFeedback onPress={this._onPressLeft.bind(this)}>
              <View style={styles.titleView}>
                <TextInput
                  ref={(input) => {this.titleInput = input}}
                  isFocused={true}
                  style={styles.titleInput}
                  placeholder="Title"
                  onChangeText={(title) => this.setState({title})}
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
    flex: 1
  },
  noteView: {
    flex: 1,
    paddingLeft: 20,
    borderLeftWidth: 1,
    borderLeftColor: '#eee'
  },
  titleInput: {
    fontSize: 20
  },
  noteInput: {
    fontSize: 20
  }
})