import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { isIphoneX } from 'react-native-iphone-x-helper'
import React, { Component } from 'react';
import {
Modal, View, Text, StyleSheet, Button, TouchableOpacity, TextInput,
ImageBackground, Platform, TouchableWithoutFeedback
} from 'react-native';
import WeekManager from '../manager/week'
import WeekModel from '../models/week'
import moment from 'moment'
import strings from '../i18n/localization'

export default class NewWeekNoticeModal extends Component {

  constructor(props) {
    super(props)

    this.state = {
      show: false,
      importing: false,
      importAvailable: false
    }
  }

  componentWillMount() {
    let week = WeekManager.getCurrentWeek()
    let aweekago =  new WeekModel(moment().year(week.getYear()).isoWeek(week.getWeekNumber()-1))
    aweekago.getData(() => {
      this.setState({importAvailable: !aweekago.isEmpty()})
    })
  }

  componentDidMount() {
    
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
    this.show()
  }

  componentWillReceiveProps(nextProps) {
    this.setState(nextProps)
  }

  _onPressCheckbox() {
    const { importing } = this.state
    this.setState({
      importing: !importing
    })
  }

  _onPressStart() {
    if (this.props.onStart)
      this.props.onStart(this.state.importing)
  }

  render() {
    const { visible, animationType, onRequestClose, supportedOrientations } = this.props
    const { show, importing, importAvailable } = this.state
    
    return (
      <Modal 
        visible={visible}
        animationType={animationType}
        supportedOrientations={supportedOrientations}
        show={show}
        style={styles.view}
        onRequestClose={()=>{}}
      >
        <ImageBackground source={Platform.OS === 'ios' ? require('../images/3.png'): null} resizeMode={Platform.OS === 'ios' ? "repeat" : undefined} style={{flex: 1, backgroundColor: '#f6f8f1'}}>
          <View style={styles.top} >
            <View style={styles.body}>
              <View style={styles.iconView}>
                <Icon size={48} name="emoticon-cool" color={"#333"}/>
              </View>
              <Text style={styles.titleText}>{strings.new_week_notice}</Text>
              {importAvailable ? 
              <View style={styles.importView}>
                <TouchableWithoutFeedback onPress={this._onPressCheckbox.bind(this)}>
                  <Icon size={20} name="check-circle" color={importing ? "green" : "#ddd"}/>
                </TouchableWithoutFeedback>
                <TouchableWithoutFeedback onPress={this._onPressCheckbox.bind(this)}>
                  <View><Text style={styles.importText}>{strings.import_desc}</Text></View>
                </TouchableWithoutFeedback>
              </View>
              : <View style={styles.importView}>
                  <Text style={styles.importText}>{strings.new_week_greeting}</Text>
                </View>}
              <TouchableOpacity onPress={this._onPressStart.bind(this)}>
                <Text style={styles.startText}>{strings.start}</Text>
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
    flex: 1,
    justifyContent: 'center'
  },
  bottom: {
    flex: 1
  },
  body: {
    marginTop: 30,
    paddingLeft: isIphoneX() ? 55 : 0,
    paddingRight: isIphoneX() ? 55 : 0,
  },
  iconView: {
    alignItems: 'center'
  },
  titleText: {
    textAlign: 'center',
    paddingVertical: 20,
    fontSize: 24,
    fontFamily: "Courier-Bold",
    color: '#333'
    // backgroundColor:'orange'
  },
  importView: {
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "center",
    // backgroundColor:'green'
  },
  importText: {
    marginLeft: 5,
    fontSize: 12,
    paddingTop: 3,
    paddingBottom: 5,
    color: '#999',
    fontFamily: 'Courier',
  }, 
  startText: {
    paddingVertical: 20,
    textAlign: 'center',
    fontFamily: 'Courier-Bold',
    fontSize: 16
  }
})