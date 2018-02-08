import { isIphoneX } from 'react-native-iphone-x-helper'
import React, { Component } from 'react';
import {
  Animated, StyleSheet, View, ImageBackground, Platform
} from 'react-native';

export default class Overlay extends Component {

  constructor(props) {
    super(props)

    this.state = {
      fade: new Animated.Value(0),
      visible: false
    }
  }

  componentDidMount() {
    // this.show({ delay: this.props.delay})
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.show == true) {
      this.show({ delay: nextProps.delay })
    } else if (nextProps.show == false) {
      this.hide({ delay: nextProps.delay })
    }
  }


  /* 
    * Show
    * option - slideTo, delay
    */
  show(option) {
    Animated.sequence([
      Animated.delay(option.delay), // Option
      Animated.parallel([
        Animated.timing(                  
          this.state.fade,
          {
            toValue: 1,                   
            duration: 200,             
          }
        )
      ])
    ]).start(() => {
      this.setState({
        visible: true
      });
  
      if (this.props.onFinishAnim)
        this.props.onFinishAnim()
    })
  }

  hide(option) {
    Animated.sequence([
      Animated.delay(option.delay), // Option
      Animated.parallel([
        Animated.timing(                  
          this.state.fade,
          {
            toValue: 0,                   
            duration: 200,             
          }
        )
      ])
    ]).start(() => {
      this.setState({
        visible: false
      });
      
      if (this.props.onFinishAnim)
        this.props.onFinishAnim()
    })
  }

  render() {
    let { fade, visible } = this.state;

    return (
      <View pointerEvents="box-none" style={styles.overlay}>
        <View pointerEvents="box-none" style={styles.body}>
          <Animated.View
            pointerEvents="box-none"
            style={[styles.content, this.props.style, {
            opacity: fade,
            backgroundColor:'#fff',
            }]}
          >
            {this.props.children}
          </Animated.View>
        </View>
        <View pointerEvents="box-none" style={styles.space}/>
      </View>
    );
  }
}


const styles = StyleSheet.create({
  overlay: {
    flex: 1, 
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    flexDirection: 'row'
  },
  body: {
    flex: isIphoneX() ? 21 : 10,
    borderRightColor: '#666',
    borderRightWidth: 4,
  },
  content: {
    flex: 1
  },
  space: {
    flex: isIphoneX() ? 5 : 2,
  }
})

