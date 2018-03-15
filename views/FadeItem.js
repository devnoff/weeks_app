import React, { Component } from 'react';
import {
  Animated,
} from 'react-native';

export default class FadeItem extends Component {

  visible = false

  constructor(props) {
    super(props)

    this.state = {
      fade: new Animated.Value(0)
    }
  }

  componentDidMount() {
    // this.show({ delay: this.props.delay, to: this.props.to })
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
            duration: this.props.duration || 150,             
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
    console.log('FadeItem hide')

    Animated.sequence([
      Animated.delay(option.delay), // Option
      Animated.timing(                  
        this.state.fade,
        {
          toValue: 0,                   
          duration: this.props.duration || 100,             
        }
      )
    ]).start((info) => {

      console.log('FadeItem hide finished')

      if (!info.finished) return

      this.visible = false
      
      if (this.props.onFinishAnim)
        this.props.onFinishAnim()
    })
  }

  render() {
    let { fade } = this.state;

    return (
      <Animated.View
        pointerEvents={this.props.pointerEvents || undefined}
        style={[this.props.style, {
          opacity: fade
        }]}
      >
        {this.props.children}
      </Animated.View>
    );
  }
}