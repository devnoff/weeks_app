import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { isIphoneX } from 'react-native-iphone-x-helper'
import React, { Component } from 'react';
import {
  View, Text, StyleSheet
} from 'react-native';
import SlideItem from './SlideItem'
import FadeItem from './FadeItem'
import ScaleItem from './ScaleItem'
import Bounceable from './bouncable'


export default class SelectionColumn extends Component {

  constructor(props) {
    super(props)


  }

  _getCell(day, order) {

    let column = this.props.column

    let cell_id = `${day}_${column}`

    return (<ScaleItem style={[styles.view]} delay={order * 100}>
                <View style={styles.cell}>
                  <Bounceable onPress={() => {}} style={{flex: 1}} key={cell_id}>
                    <View style={styles.box}>
                    </View>
                  </Bounceable>
                </View>
            </ScaleItem>)
  }

  render() {

    const { icon } = this.props

    return (
      <View style={{flex: 1, alignItems: 'center', backgroundColor: '#f6f8f1'}}>
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
  }
});