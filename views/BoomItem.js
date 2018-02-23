import React, { Component } from 'react';
import {
  Animated,
} from 'react-native';

export default class BoomItem extends Component {

  visible = false

  constructor(props) {
    super(props)

    this.state = {
      scale: new Animated.Value( props.scale || 1),
      alpha: new Animated.Value(0)
    }
  }

  componentDidMount() {
    this.show({ delay: this.props.delay})
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
        Animated.spring(
          this.state.scale,
          {
            toValue: 1,
            friction: 5,
            tension: 50,
            // bounciness: 1,
            duration: 100
          }),
        Animated.timing(                  
          this.state.alpha,
          {
            toValue: 1,
            duration: this.props.duration || 100,             
          }
        )
      ])
    ]).start((info) => {

      if (!info.finished) {
        // console.log('complete while animating')
        return
      }

      this.visible = true
  
      if (this.props.onFinishAnim)
        this.props.onFinishAnim()
    })
  }

  hide(option) {
    Animated.sequence([
      Animated.delay(option.delay), // Option
      Animated.parallel([
        Animated.timing(                  
          this.state.scale,
          {
            toValue: 0,                   
            duration: this.props.duration || 100,             
          }
        )
      ])
    ]).start((info) => {

      if (!info.finished) {
        // console.log('complete while animating')
        return
      }

      this.visible = false
      
      if (this.props.onFinishAnim)
        this.props.onFinishAnim()
    })
  }

  render() {
    let { scale, alpha } = this.state;

    // console.log(alpha, 'boom item alpha')

    return (
      <Animated.View
        style={[{opacity: alpha, transform: [{scale: this.state.scale}]}, this.props.style]}
      >
        {this.props.children}
      </Animated.View>
    );
  }
}

        