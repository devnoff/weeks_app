import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { isIphoneX } from 'react-native-iphone-x-helper'
import React, { Component } from 'react';
import {
Modal, View, Text, StyleSheet, Button, TouchableOpacity, TextInput, Image,
ImageBackground, Platform, Linking, StatusBar
} from 'react-native';
import FadeItem from './FadeItem'
import * as StoreReview from 'react-native-store-review'
import strings from '../i18n/localization'

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

  componentWillMount() {
    StatusBar.setHidden(true);
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

  _onPressContact() {
    // 메일
    Linking.openURL('mailto:admin@weeksapp.io')
  }

  _onPressLike() {
    // 사파리로 보냄
    Linking.openURL('https://fb.com/weeksapp.io')
  }

  _onPressRate() {
    // 

    if (Platform.OS === 'ios') {
      if (StoreReview.isAvailable) {
        StoreReview.requestReview()
      } else {
        Linking.openURL('itms://itunes.apple.com/us/app/weeks-to-do-간편한-할일-관리/1350643250?mt=8')
      }
    } else {
      Linking.openURL('market://details?id=com.monospace.weeks')
    }
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
            <View style={styles.navigation}>
              <TouchableOpacity style={styles.navigationItem} onPress={this._onPressClose.bind(this)} >
                <Icon size={20} name="close" />
              </TouchableOpacity>
            </View>
            <View style={styles.body}>
              <View style={styles.logoBox}>
                <Image resizeMode="contain" style={styles.logo} source={require('../images/logo_empty.png')} />
                <Text style={styles.slogan}>WEEKs v1.0</Text>
                <View style={styles.linkBox}>
                  <TouchableOpacity onPress={this._onPressContact}>
                    <Text style={styles.link}>{strings.contact_dev}</Text>
                  </TouchableOpacity>
                  <Text style={{fontWeight: 'bold', color: '#aaa'}}>    |    </Text>
                  <TouchableOpacity onPress={this._onPressRate}>
                    <Text style={styles.link}>{strings.rate_app}</Text>
                  </TouchableOpacity>
                  <Text style={{fontWeight: 'bold', color: '#aaa'}}>    |    </Text>
                  <TouchableOpacity onPress={this._onPressLike}>
                    <Text style={styles.link}>{strings.like_on_fb}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
          <View style={styles.bottom} >
            <Text style={styles.copyright}>Copyright © 2018 Monospace Co.</Text>
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
    flex: 10
  },
  bottom: {
    flex: 1
  },
  navigation: {
    paddingLeft: isIphoneX() ? 30 : 0,
    paddingRight: isIphoneX() ? 30 : 0,
    justifyContent: "space-between",
    flexDirection: 'row',
    // backgroundColor: 'blue'
  },
  navigationItem: {
    justifyContent: "center",
    alignItems: 'center',
    width: 44,
    height: 44,
    marginRight: 10,
    // backgroundColor: 'green'
  },
  body: {
    flex: 1,
    paddingLeft: isIphoneX() ? 55 : 0,
    paddingRight: isIphoneX() ? 55 : 0,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: "center",
    // backgroundColor: 'red'
  },
  logoBox: {
    height: 150,
    justifyContent: 'flex-start',
    alignItems: 'center',
    // backgroundColor: 'red'
  },
  logo: {
    height: 44,
  },
  slogan: {
    marginTop: 10,
    // backgroundColor: 'red',
    textAlign: 'center',
    fontFamily: 'Verdana',
    fontWeight: 'bold',
    fontSize: 14,
    color: '#aaa'
  },
  linkBox: {
    marginTop: 50,
    flexDirection: 'row'
  },
  link: {

  },
  copyright: {
    textAlign: 'center',
    fontSize: 9,
    color: '#aaa'
  }
})