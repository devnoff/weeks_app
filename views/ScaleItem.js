import React, { Component } from 'react';
import {
  Animated,
} from 'react-native';

export default class ScaleItem extends Component {

  constructor(props) {
    super(props)

    this.state = {
      scale: new Animated.Value(0),
      visible: false
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
        Animated.timing(                  
          this.state.scale,
          {
            toValue: 1,                   
            duration: this.props.duration || 150,             
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
          this.state.scale,
          {
            toValue: 0,                   
            duration: this.props.duration || 100,             
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
    let { scale, visible } = this.state;

    return (
      <Animated.View
        style={[{transform: [{scale: this.state.scale}]}, this.props.style]}
      >
        {this.props.children}
      </Animated.View>
    );
  }
}

        