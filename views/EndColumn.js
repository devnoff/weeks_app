import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import React, { Component } from 'react';
import {
  View, Text, StyleSheet, Button, TouchableOpacity, ImageBackground, AsyncStorage,
  Animated, Platform
} from 'react-native';
import data from './data'
import { DoneButtonStyle } from '../constants'
import Preference from '../manager/preference'
import PanelController from '../controllers/PanelController'
import Panel from './Panel'
import MorePanel from './MorePanel'
import HelloPanel from './HelloPanel'
import ItemPanel from './ItemPanel'
import ItemManager from '../manager/item'

export default class EndColumn extends Component {
  state = {
    showMore: true,
    panels: [],
    moreAlpha: new Animated.Value(1),
  }

  constructor(props) {
    super(props)

    this.panelController = new PanelController(this, {
      ref: 'hello',
       el: <HelloPanel ref={comp => this.panelController.refs['hello'] = comp}/>
    })
  }

  componentDidMount() {
    this.panelController.initialize()
    ItemManager.sharedInstance().addListener('change', this, this._handleItemSelectChangeEvent.bind(this))
  }

  componentWillUnmount() {
    ItemManager.sharedInstance().removeListener('change', this)
  }

  _handleItemSelectChangeEvent(selectedItem) {
    
    if (ItemManager.sharedInstance().isLock() || this.panelController.isAnimating()) return
    
    ItemManager.sharedInstance().lock()
    console.log('locked!')

    if (selectedItem) {
      this.moreButtonFadeOut()
      this.panelController.present({ 
        ref: 'itemPanel',
         el: <ItemPanel 
              key={selectedItem.key}
              style={styles.itemPanel} 
              item={selectedItem}
              ref={comp => this.panelController.refs['itemPanel'] = comp}
              />
      }, () => {
        ItemManager.sharedInstance().unlock()
        console.log('unlocked!')
      }, (el) => {
        el.week = this.props.week
      })
    } else {
      this.panelController.popToRootPanel(() => {
        this.moreButtonFadeIn()
        ItemManager.sharedInstance().unlock()
        console.log('unlocked!')
      })
    }
  }

  moreButtonFadeOut(callback) {
    Animated.timing(
      this.state.moreAlpha,
      {
        toValue: 0,                   
        duration: 150,             
      }
    ).start(() => {
      if (callback) callback()
    })
    this.setState({showMore: false})
  }

  moreButtonFadeIn(callback) {
    Animated.timing(
      this.state.moreAlpha,
      {
        toValue: 1,                   
        duration: 150,             
      }
    ).start(() => {
      if (callback) callback()
    })

    this.setState({showMore: true})
  }

  _onPressMoreButton() {

    if (this.panelController.isAnimating()) return
    ItemManager.sharedInstance().lock()

    this.moreButtonFadeOut()

    let panelCnt = this.panelController.getCount()

    if (panelCnt < 2) {
      this.panelController.push({ 
        ref: 'morePanel',
         el: <MorePanel 
              style={styles.morePanel} 
              ref={comp => this.panelController.refs['morePanel'] = comp}
              />
      }, () => {
        this.moreButtonFadeIn()
        ItemManager.sharedInstance().unlock()
      })
      
    } else {
      this.panelController.pop(() => {
        this.moreButtonFadeIn()
        ItemManager.sharedInstance().unlock()
      })
    }
  }

  _getMoreEl() {
    if (this.panelController.getCount() < 2)
      return <Icon color="#333" name="equal" size={30}/>
    else
      return <Icon color="#333" name="chevron-left" size={30}/>  
  }

  render() {

    const { showModal, showMore, moreAlpha } = this.state

    return (
      <ImageBackground source={Platform.OS === 'ios' ? require('../images/3.png') : null} resizeMode={Platform.OS === 'ios' ? "repeat" : undefined} style={{flex:1, backgroundColor: '#eee'}}>
        <View style={styles.view}>
          <View style={styles.moreView}>
            <TouchableOpacity disabled={!showMore} onPress={this._onPressMoreButton.bind(this)}>
              <Animated.View style={[styles.moreBox, {opacity: moreAlpha}]}>
                {this._getMoreEl()}
              </Animated.View>
            </TouchableOpacity>
          </View>
        </View>

        {/* ------- Panels ------ */}

        <View pointerEvents="box-none" style={styles.panelBox}>
          {this.panelController.getRenderableElement()}
        </View>
      </ImageBackground>
    );
  }
}


const styles = StyleSheet.create({
  view: {
    flex: 1
  },
  moreView: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end'
  },
  moreBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10
  },
  panelBox: { 
    flex: 1,
    position: 'absolute',
    overflow: 'hidden',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    // backgroundColor: 'blue'
  },
  morePanel: {
    overflow: 'hidden',
    zIndex: 1
  }
})