import React, { Component } from 'react';
import {
  Animated,
} from 'react-native';

export default class SlideItem extends Component {

  visible = false

  constructor(props) {
    super(props)

    this.state = {
      x: new Animated.Value(props.show ? props.to : props.x),
      fade: new Animated.Value(props.fade ? props.fade : 0)
    }
  }

  componentDidMount() {
    // this.show({ delay: this.props.delay, to: this.props.to })
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.show == true) {
      this.show({ delay: nextProps.delay, to: nextProps.to })
    } else if (nextProps.show == false) {
      this.hide({ delay: nextProps.delay })
    }
  }


  /* 
    * Show
    * option - slideTo, delay
    */
  show(option) {
    let self = this
    Animated.sequence([
      Animated.delay(option.delay), // Option
      Animated.parallel([
        Animated.timing(this.state.x, {
          toValue: option.to, // Option
          duration: this.props.duration || 150,
        }),
        Animated.timing(                  
          this.state.fade,
          {
            toValue: 1,                   
            duration: this.props.duration || 150,
          }
        )
      ])
    ]).start((info) => {

      if (!info.finished) {
        console.log('complete while animating')
        return
      }

      self.visible = true
  
      if (self.props.onFinishAnim)
        self.props.onFinishAnim()
    })
  }

  hide(option) {
    let self = this
    Animated.sequence([
      Animated.delay(option.delay), // Option
      Animated.parallel([
        Animated.timing(this.state.x, {
          toValue: this.props.x, // Option
          duration: this.props.duration || 150,  
        }),
        Animated.timing(                  
          this.state.fade,
          {
            toValue: 0,                   
            duration: this.props.duration || 150,
          }
        )
      ])
    ]).start((info) => {

      if (!info.finished) {
        // console.log('complete while animating')
        return
      }

      self.visible = false
      
      if (self.props.onFinishAnim)
        self.props.onFinishAnim()
    })
  }

  render() {
    let { fade, x } = this.state;

    return (
      <Animated.View
        style={[this.props.style, {
          opacity: fade,
          transform: [{ translateX: x}]
        }]}
      >
        {this.props.children}
      </Animated.View>
    );
  }
}