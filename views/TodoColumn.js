import { isIphoneX } from 'react-native-iphone-x-helper'
import React, { Component } from 'react';
import {
  View, StyleSheet, VirtualizedList, Text, TouchableOpacity
} from 'react-native';
import WeekModel from '../models/week'
import ItemManager from '../manager/item'
import FadeItem from './FadeItem'

export default class TodoColumn extends Component {

  constructor(props) {
    super(props)

    let week = props.week
    let column = props.column

    this.state = {
      data: null,
      column: column,
      selectedItemKey: null,
      show: true
    } 
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.show == true) {
      this.show()
    } else if (nextProps.show == false) {
      this.hide()
    }
  }

  show() {
    this.setState({show: true})
  }

  hide() {
    this.setState({show: false})
  }

  componentDidMount() {
    let week = this.props.week
    week.getWeekDataAtColumn(this.props.column, (data) => {
      this.setState({
        data: data
      })
    })

    ItemManager.sharedInstance().addListener('change', (selectedItem) => {
      this.setState({
        selectedItemKey: selectedItem ? selectedItem.key : null
      })
    })

    ItemManager.sharedInstance().addListener('update', (selectedItem) => {
      this.setState({
        selectedItemKey: selectedItem ? selectedItem.key : null
      })
    })
  }

  _onPressItem(item) {
    
    let itemManager = ItemManager.sharedInstance()
    let curr = itemManager.getSelectedItem()
    if (curr && curr.key == item.key) {
      // Deselect 
      itemManager.setSelectedItem(null)
    } else {
      itemManager.setSelectedItem(item)
    }
  }

  _getCellForDay(day) {
    const { data, column, selectedItemKey } = this.state
    let items = data ? data[day] : [] || []
    return (
      <View  style={styles.todoCell}>
        <VirtualizedList 
          showsHorizontalScrollIndicator={false}
          data={items}
          horizontal={true}
          getItemCount={(data) => items.length}
          keyExtractor={(item, index) => day+column+index}
          getItem={(item, index) => {
            let key = `${day}_${column}_${index}`// e.g. mon_0_0 : monday position 0 in column 0
            item[index]['key'] = key
            return item[index];
          }}
          renderItem={({ item, index }) => {
            let itemStyle = [styles.item]
            if (item.key == selectedItemKey) itemStyle.push(styles.itemActive)

            let textStyle = [styles.itemText]
            if (item.key == selectedItemKey) textStyle.push(styles.itemTextActive)

            else if (item.done) {
              itemStyle.push(styles.itemFill)
              textStyle.push(styles.itemTextFill)
            }

            if (item.done) {
              textStyle.push(styles.itemTextDone)
            }

            return (
              <View style={styles.itemBox}>
                <TouchableOpacity onPress={this._onPressItem.bind(this, item)}>
                  <View style={itemStyle}>
                    <Text style={textStyle}>{item.title}</Text>
                  </View>
                </TouchableOpacity>
              </View>
            );
          }}
        />
      </View>
    )
  }

  render() {
    const { icon } = this.props
    const { show } = this.state

    return (
      <View style={{flex: 1, flexDirection: 'column'}}
      >
        <View style={styles.headerCell}>{icon}</View>

        {/* MONDAY */}

        {this._getCellForDay('mon')}

        {/* TUESDAY */}

        {this._getCellForDay('tue')}

        {/* WEDNESDAY */}

        {this._getCellForDay('wed')}

        {/* THURSDAY */}

        {this._getCellForDay('thu')}

        {/* FRIDAY */}

        {this._getCellForDay('fri')}

        {/* SATURDAY */}

        {this._getCellForDay('sat')}

        {/* SUNDAY */}

        {this._getCellForDay('sun')}

        {function(){
          if (isIphoneX()) 
            return (<View style={{flex: 1}}></View>)
          else ''
        }()}
      </View> );
  }
}


const styles = StyleSheet.create({
  todoCell: {
    flex: isIphoneX() ? 2 : 1,
    // borderColor: 'white',
    // borderWidth: 1
  },
  headerCell: {
    flex: isIphoneX() ? 2 : 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  listStyle: {

  },
  itemBox: {
    flex: 1,
    justifyContent: 'center',
  },
  item: {
    borderRadius: 8,
    borderColor: '#333',
    borderWidth: 1.5,
    height: 33,
    marginLeft: 6,
    minWidth: 33,
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 2,
    paddingRight: 2
  },
  itemFill: {
    // backgroundColor: '#eee',
    borderColor: '#ccc'
  },
  itemActive: {
    backgroundColor: '#333',
    borderWidth: 2.5,
    paddingLeft: 1,
    paddingRight: 1
  },
  itemEnd: {
    marginRight: 6
  },
  itemText: {
    color: '#333',
    fontSize: 15,
    fontWeight: 'bold'
  },
  itemTextFill: {
    color: '#ccc'
  },
  itemTextActive: {
    color: '#fff'
  },
  itemTextDone: {
    textDecorationLine: 'line-through'
  }
})