import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated
} from 'react-native';
import SlideItem from './SlideItem'
import Panel from './Panel'
import CreateItemModal from './CreateItemModal'
import Notification from '../manager/notification'

export default class HelloPanel extends Panel {  
  state = {
    visible: false,
    showModal: false,
    fade: new Animated.Value(0),
  }

  constructor(props) {
    super(props)
  }

  showModal() {
    this.setState({showModal: true})
  }

  hideModal() {
    this.setState({showModal: false})
  }

  _handlePressAddButton() {
    Notification.post('create_overlay_request')
  }

  show() {
    Animated.timing(
      this.state.fade,
      {
        toValue: 1,                   
        duration: 300,             
      }
    ).start(() => {
      this.setState({ visible: true });
      if (this.props.onFinishAnim)
        this.props.onFinishAnim()
    })
  }

  hide() {
    Animated.timing(
      this.state.fade,
      {
        toValue: 0,                   
        duration: 200,             
      }
    ).start(() => {
      this.setState({ visible: false });
      if (this.props.onFinishAnim)
        this.props.onFinishAnim()
    })
  }

  componentDidUpdate() {
    if (this.state.visible) {
      if (this.onShow) this.onShow()
    } else {
      if (this.onHide) this.onHide()
    }
  }

  render() {

    const { show, showModal, fade } = this.state

    return (
      <Animated.View pointerEvents="box-none" style={[styles.view, {opacity: fade}]}>
        <View style={styles.weekView}>
          <Text style={styles.weekText}>WEEK<Text style={styles.weekNum}>#1</Text></Text>
          <Text style={styles.periodText}>1 Jan 2018{"\n"}~ 7 Jan 2018</Text>
        </View>
        <View style={styles.buttonView}>
          <TouchableOpacity onPress={this._handlePressAddButton.bind(this)}>
            <View style={styles.buttonBox}>
                <Icon name="plus" size={30}/>  
            </View>
          </TouchableOpacity>
        </View>
        <View pointerEvents="none" style={styles.extraSpace}></View>

        {/* ------- Modals ------ */}
        
        {(showModal ? <CreateItemModal 
          visible={showModal}
          animationType={'slide'}
          onRequestClose={() => this.hideModal()}
          supportedOrientations={['landscape']} /> : undefined)}
        
      </Animated.View>
    );
  }
}


const styles = StyleSheet.create({
  view: {
    flex: 1
  },
  weekView: {
    flex: 1,
    alignItems: 'flex-start',
    paddingTop: 10,
    paddingLeft: 10
  },
  weekText: {
    fontWeight: 'bold',
    fontFamily: 'courier',
    fontSize: 20
  },
  weekNum: {
    fontSize: 24
  },
  periodText: {
    fontFamily: 'courier',
    fontSize: 12,
    color: '#aaa',
    marginTop: 5
  },
  buttonView: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10
  },
  extraSpace: {
    flex: 1,
    opacity: 0
  }
})