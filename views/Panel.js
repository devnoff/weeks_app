import React from 'react';
import { Animated, Text, View } from 'react-native';


export default class Panel extends React.Component {

  _panelController = null

  getPanelController() {
    return this._panelController
  }

  setPanelController(pc) {
    this._panelController = pc
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
