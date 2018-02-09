import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import ReactNativeHapticFeedback from 'react-native-haptic-feedback'
import { isIphoneX } from 'react-native-iphone-x-helper'
import React, { Component } from 'react';
import {
  View, Text, StyleSheet
} from 'react-native';
import SlideItem from './SlideItem'
import FadeItem from './FadeItem'
import ScaleItem from './ScaleItem'
import Bounceable from './bouncable'
import CellSelectionController from '../controllers/CellSelectionController'

export default class SelectionColumn extends Component {

  constructor(props) {
    super(props)

  }

  _onPressCell(cell_id) {
    console.log(`pressed ${cell_id}`)
    let csc = CellSelectionController.sharedInstance()
    if (csc.contains(cell_id))
      csc.removeCellWithKey(cell_id)
    else
      csc.addCellWithKey(cell_id)
      
    this.forceUpdate()

    ReactNativeHapticFeedback.trigger()
  }

  _getCell(day, order) {

    let column = this.props.column

    let cell_id = `${day}_${column}`

    let selected = CellSelectionController.sharedInstance().contains(cell_id)

    return (<ScaleItem scale={0} style={[styles.view]} delay={order * 100}>
                <View style={styles.cell}>
                  <Bounceable onPress={this._onPressCell.bind(this, cell_id)} style={{flex: 1}} key={cell_id}>
                    <View style={styles.box}>
                    {selected ? <Icon color="#999" size={30} name="check" /> : undefined}
                    </View>
                  </Bounceable>
                </View>
            </ScaleItem>)
  }

  render() {

    const { icon } = this.props

    return (
      <View style={{flex: 1, alignItems: 'center'}}>
        <View style={styles.headerCell}>{icon}</View>
        {this._getCell('mon',0)}
        {this._getCell('tue',1)}
        {this._getCell('wed',2)}
        {this._getCell('thu',3)}
        {this._getCell('fri',4)}
        {this._getCell('sat',5)}
        {this._getCell('sun',6)}
        {function(){
          if (isIphoneX()) 
            return (<View style={{flex: 1}}></View>)
          else ''
        }()}
      </View>
    );
  }
}


const styles = StyleSheet.create({
  view: {
    flex: isIphoneX() ? 2 : 1,
    flexDirection: 'row',
  },
  headerCell: {
    flex: isIphoneX() ? 2 : 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  cell: {
    flex: 1,
    // backgroundColor: 'red',
    padding: 5
  },
  box: {
    flex: 1,
    backgroundColor: '#aaaaaa33',
    borderRadius: 10,
    borderColor: '#aaaaaa11',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
});