import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { isIphoneX } from 'react-native-iphone-x-helper'
import React, { Component } from 'react';
import {
Modal, View, Text, StyleSheet, Button, TouchableOpacity, TextInput,
ImageBackground, Platform
} from 'react-native';
import FadeItem from './FadeItem'

export default class SettingsModal extends Component {

  constructor(props) {
    super(props)

    this.state = {
      show: false
    }
  }

  show() {
    this.setState({show: true})
  }

  hide() {
    this.setState({show: false})
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

  render() {
    const { visible, animationType, onRequestClose, supportedOrientations } = this.props
    const { show } = this.state
    return (
        <Modal 
          visible={visible}
          animationType={animationType}
          onRequestClose={onRequestClose}
          supportedOrientations={supportedOrientations}
          show={show}
          style={styles.view}
        >
        <ImageBackground source={Platform.OS === 'ios' ? require('../images/3.png'): null} resizeMode={Platform.OS === 'ios' ? "repeat" : undefined} style={{flex: 1, backgroundColor: '#f6f8f1'}}>
        <View style={styles.top} >
          <View style={styles.body}>
            <TouchableOpacity onPress={this._onPressClose.bind(this)} >
              <Text>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
        </ImageBackground>
      </Modal>
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