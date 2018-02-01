import React from 'react';
import { Animated, Text, View } from 'react-native';

var _panelController = null

export default class Panel extends React.Component {

  getPanelController() {
    return _panelController
  }

  setPanelController(pc) {
    _panelController = pc
  }
  
  show() {
    throw new Error('You have to implement the method show()!');
  }

  hide() {
    throw new Error('You have to implement the method hide()!');
  }

  checkComplete() {
    throw new Error('You have to implement the method checkComplete()!');
  }
}
