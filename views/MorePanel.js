import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  UIManager,
  findNodeHandle,
  TouchableOpacity
} from 'react-native';
import SlideItem from './SlideItem'
import OnLayout from 'react-native-on-layout'
import Panel from './Panel'
import SettingsModal from './SettingsModal'
import ResetConfirmPanel from './ResetConfirmPanel'
import ImportConfirmPanel from './ImportConfirmPanel'

export default class MorePanel extends Panel {  
  state = {
    show: false,
    showSettingModal: false,
    disabled: false
  }

  constructor(props) {
    super(props)
  }

  presentSetting() {
    this.setState({showSettingModal: true})
  }

  dismissSetting() {
    this.setState({showSettingModal: false})
  }

  show() {
    this.setState({show: true})
  }

  hide() {
    this.setState({show: false})
  }

  _onPressImportButton() {
    this.setState({disabled: true})

    let panelController = this.getPanelController()
    panelController.push({ 
      ref: 'importConfirmPanel',
       el: <ImportConfirmPanel
            ref={comp => panelController.refs['importConfirmPanel'] = comp}
            />
    }, () => {
    })
  }

  _onPressResetButton() {
    this.setState({disabled: true})

    let panelController = this.getPanelController()
    panelController.push({ 
      ref: 'resetConfirmPanel',
       el: <ResetConfirmPanel
            ref={comp => panelController.refs['resetConfirmPanel'] = comp}
            />
    }, () => {
    })
  }

  _onPressSetting() {
    this.presentSetting()
  }

  checkComplete() {
    var done = true
    let items = [this.item1, this.item2, this.item3]
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

    const { show, showSettingModal, disabled } = this.state

    return (
      <OnLayout pointerEvents="box-none" style={styles.view}>
        {({ width, height}) => (
          <View pointerEvents="box-none" style={styles.view}>
            <View pointerEvents="none" style={styles.extraSpace}></View>
            <SlideItem
              style={styles.slideItem}
              ref={(item) => { this.item1 = item}}
              onFinishAnim={this.checkComplete.bind(this)}
              x={-80} 
              delay={50} 
              to={10} 
              show={show} >
              <TouchableOpacity onPress={this._onPressImportButton.bind(this)} disabled={disabled}>
                <Text style={styles.title}>
                  Import{'\n'}
                  <Text style={styles.description}>
                    from last week
                  </Text>
                </Text>
              </TouchableOpacity>
            </SlideItem>
            <SlideItem 
              style={styles.slideItem}
              ref={(item) => { this.item2 = item}}
              onFinishAnim={this.checkComplete.bind(this)}
              x={-80} 
              delay={150} 
              to={10} 
              show={show} >
              <TouchableOpacity onPress={this._onPressResetButton.bind(this)} disabled={disabled}>
                <Text style={styles.title}>
                  Reset{'\n'}
                  <Text style={styles.description}>
                    current week
                  </Text>
                </Text>
              </TouchableOpacity>
            </SlideItem>
            <SlideItem 
              style={styles.slideItem}
              ref={(item) => { this.item3 = item}}
              onFinishAnim={this.checkComplete.bind(this)}
              x={-80} 
              delay={300} 
              to={10} 
              show={show} >
              <TouchableOpacity onPress={this._onPressSetting.bind(this)} disabled={disabled}>
                <Text style={styles.title}>
                  Setting{'\n'}
                  <Text style={styles.description}>
                    preference
                  </Text>
                </Text>
              </TouchableOpacity>
            </SlideItem>
            <View pointerEvents="none" style={styles.extraSpace}></View>
            {/* ------- Modals ------ */}
        
            <SettingsModal 
              visible={showSettingModal}
              animationType={'slide'}
              onRequestClose={() => this.dismissSetting()}
              supportedOrientations={['landscape']} />
          </View>     
        )}
      </OnLayout>
    );
  }
}


const styles = StyleSheet.create({
  view: {
    flex: 1,
    justifyContent: 'space-between'
  },
  slideItem: {
    flex: 1,
    justifyContent: 'center'
  },
  title: {
    fontFamily: 'courier',
    fontWeight: 'bold',
    fontSize: 17
  },
  description: {
    color: '#aaa',
    fontWeight: 'normal',
    fontSize: 10
  },
  extraSpace: {
    flex: 3
  }
})