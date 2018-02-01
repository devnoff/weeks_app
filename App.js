/**
 * Created by Robinson Park 
 * 2018.01.10
 * @flow
 */
import { isIphoneX } from 'react-native-iphone-x-helper'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import React, { Component } from 'react';
import {
  View, ImageBackground, StyleSheet, Platform, AppState, Text
} from 'react-native';
import WeekHeader from './views/WeekHeader'
import TodoColumn from './views/TodoColumn'
import EndColumn from './views/EndColumn'
import SelectionColumn from './views/SelectionColumn'
import WeekModel from './models/week'
import WeekManager from './manager/week'
import Overlay from './views/Overlay'
import Notification from './manager/notification'
import CreateModal from './views/CreateItemModal'
import ConfirmPanel from './views/ConfirmPanel'

console.ignoredYellowBox = ['Remote debugger'];

function _flex(value) {
  return isIphoneX() ? value * 2 : value
}

export default class App extends Component {

  constructor(props) {
    super(props)

    this.week = new WeekModel()

    console.log(this.week)

    console.log(this.week.isCurrentWeek())

    WeekManager.sharedInstance().setCurrentWeek(this.week)

    this.state = {
      appState: AppState.currentState,
      selectionMode: false,
      showCreateOverlay: false
    }

  }

  componentDidMount() {
    AppState.addEventListener('change', this._handleAppStateChange);
    Notification.addListener('create_overlay_request', this._handleCreateRequest)
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this._handleAppStateChange);
    Notification.removeListener('create_overlay_request', this._handleCreateRequest)
  }

  _handleCreateRequest = () => {
    this.setState({ showCreateOverlay: true })
    // if (this.weekHeader.state.show) 
    //   this.weekHeader.hide()
    // else {
    //   this.weekHeader.show()
    // }

    // var c = [this.todoColumn1, this.todoColumn2, this.todoColumn3]
    // for (var i in c) {
    //   if (c[i].state.show) {
    //     c[i].hide()
    //   } else {
    //     c[i].show()
    //   }
    // }

    let endCol = this.endColumn
    let pc = endCol.panelController
    pc.present({ 
      ref: 'confirmPanel',
       el: <ConfirmPanel
            ref={comp => pc.refs['confirmPanel'] = comp}
            confirmText="Next"
            useCancel={true}
            message=" "
            />
    }, () => {
      endCol.moreButtonFadeOut()
    }, (instance) => {
      instance.onConfirm = () => {
        alert('confirmed')
        pc.dismiss(() => {
          endCol.moreButtonFadeIn()
        })
        this.setState({ showCreateOverlay: false })
      }

      instance.onCancel = () => {
        pc.dismiss(() => {
          endCol.moreButtonFadeIn()
        })
        this.setState({ showCreateOverlay: false })
      }
    })
  }

  _handleItemSelectionChange() {

  }

  _handleAppStateChange = (nextAppState) => {
    if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
      console.log('App has come to the foreground!')

      // 오늘 날짜를 기준으로 WeekModel 불러옴


    }
    this.setState({appState: nextAppState});
  }
  

  requestPrevWeek() {
    let week_no = moment().isoWeek() - 1
    this.setState({
      week: WeekModel(moment().isoWeek(week_no))
    })
  }

  requestNextWeek() {
    let week_no = moment().isoWeek() + 1
    this.setState({
      week: WeekModel(moment().isoWeek(week_no))
    })
  }

  render() {

    const { selectionMode, showCreateOverlay } = this.state

    const week = this.week

    let iphoneX = isIphoneX()

    return (
      <View style={{flex: 1}}>
        <ImageBackground source={Platform.OS === 'ios' ? require('./images/3.png'): null} resizeMode={Platform.OS === 'ios' ? "repeat" : 'none'} style={{flex: 1, flexDirection: 'row', backgroundColor: '#f6f8f1'}}>
          {function(){
            if (iphoneX) 
              return (<View style={{flex: 1}}></View>)
            else ''
          }()}
          <View style={{
            flex: _flex(1), 
            borderRightColor: '#666',
            borderRightWidth: 1,
            zIndex: 100
          }}>
            <WeekHeader week={week} ref={(ref) => { this.weekHeader = ref }}/>
          </View>
          <View style={{
            flex: _flex(3), 
            borderRightColor: '#666',
            borderRightWidth: 1,
            flexDirection: 'column',
            zIndex: 200
          }}>
          { selectionMode ?
            <SelectionColumn 
              column={0} 
              icon={(<Icon size={20} name="weather-sunset"/>)}/> :
            (<TodoColumn
              ref={(ref) => { this.todoColumn1 = ref }}
              column={0} 
              icon={(<Icon size={20} name="weather-sunset"/>)}
              week={week}
            />)}
            
          </View>
          <View style={{
            flex: _flex(3),
            borderRightColor: '#666',
            borderRightWidth: 1,
            zIndex: 300
          }}>
          { selectionMode ?
            <SelectionColumn 
              column={1} 
              icon={(<Icon size={20} name="weather-sunny"/>)}/> :
            (<TodoColumn
              ref={(ref) => { this.todoColumn2 = ref }}
              column={1} 
              icon={(<Icon size={20} name="weather-sunny"/>)}
              week={week}
            />)}
          </View>
          <View style={{
            flex: _flex(3),
            borderRightColor: '#666',
            borderRightWidth: 5,
            zIndex: 400
          }}>
          { selectionMode ?
            <SelectionColumn 
              column={2} 
              icon={(<Icon size={20} name="weather-night"/>)}/> :
            (<TodoColumn
              ref={(ref) => { this.todoColumn3 = ref }}
              column={2} 
              icon={(<Icon size={20} name="weather-night"/>)}
              week={week}
            />)}
          </View>
          <View style={{
            flex: _flex(2),
            zIndex: 1000
          }}>
            <EndColumn week={week} ref={(ref) => { this.endColumn = ref }}/>
          </View>
          {function(){
            if (iphoneX) 
              return (<ImageBackground source={Platform.OS === 'ios' ? require('./images/3.png') : null} resizeMode={Platform.OS === 'ios' ? "repeat" : 'none'} style={{flex:1, backgroundColor: '#eee'}}/>)
            else ''
          }()}
        </ImageBackground>
        
        {/* Overlay */}
        <Overlay pointerEvents="box-none" show={showCreateOverlay} delay={0}>
          <View pointerEvents="box-none" style={styles.createModal}>
            {showCreateOverlay ? <CreateModal /> : undefined}
          </View>
        </Overlay>
      </View>
    );
  }
}


const styles = StyleSheet.create({
  createModal: {
    flex: 1
  }
})

