import { isIphoneX } from 'react-native-iphone-x-helper'
import ReactNativeHapticFeedback from 'react-native-haptic-feedback'
import React, { Component } from 'react';
import {
  View, StyleSheet, VirtualizedList, Text, TouchableOpacity, Animated, TouchableWithoutFeedback,
  Dimensions, Platform, Easing
} from 'react-native';
import WeekModel from '../models/week'
import ItemManager from '../manager/item'
import FadeItem from './FadeItem'
import ScaleItem from './ScaleItem'
import BoomItem from './BoomItem'
import _ from 'lodash'
import SortableList from 'react-native-sortable-list'

const window = Dimensions.get('window')

class Item extends Component {

  state = {
    selectedItemKey: null
  }

  _nextOrder = []

  constructor(props) {
    super(props)

    this._active = new Animated.Value(0)

    this._style = {
      ...Platform.select({
        ios: {
          transform: [{
            scale: this._active.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 1.1],
            }),
          }],
          shadowRadius: this._active.interpolate({
            inputRange: [0, 1],
            outputRange: [2, 10],
          }),
        },

        android: {
          transform: [{
            scale: this._active.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 1.07],
            }),
          }],
          elevation: this._active.interpolate({
            inputRange: [0, 1],
            outputRange: [2, 6],
          }),
        },
      })
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.active !== nextProps.active) {
      Animated.timing(this._active, {
        duration: 300,
        easing: Easing.bounce,
        toValue: Number(nextProps.active),
      }).start()
    }

    if (nextProps.hasOwnProperty('selectedItemKey'))
      this.setState({selectedItemKey: nextProps.selectedItemKey})
  
  }

  render() {
   const {day, column, data, week, onPress} = this.props
   const {selectedItemKey} = this.state

    return (
      <Animated.View style={[
        // styles.item,
        this._style,
      ]}>
        {function() {
          let item = data
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

          let bounce = week.lastHandledItemsSet().has(item.key)
          if (bounce) week.lastHandledItemsSet().delete(item.key)

          let note = item.note ? item.note.split('\n')[0] : undefined

          let el = (
            <View style={styles.itemBox}>
              <View>
                <View style={itemStyle}>
                  <Text style={textStyle}>{item.title}</Text>
                  {note ? <Text style={{fontSize:9, color:'#aaa'}}>{note}</Text> : undefined}
                </View>
              </View>
            </View>
          )
          return <BoomItem scale={bounce ? 0.9 : 1} delay={500}>{el}</BoomItem>;
        }.bind(this)()}
        
      </Animated.View>
    );
  }
}


class DynamicRow extends Component {

  _defaultTransition  = 250;

  state = {
      _rowOpacity : new Animated.Value(0)
  };

  componentDidMount() {
      Animated.timing(this.state._rowOpacity, {
          toValue  : 1,
          duration : this._defaultTransition
      }).start()
  }

  render() {
      return (
          <Animated.View
              style={[this.props.style, {opacity: this.state._rowOpacity}]}>
              {this.props.children}
          </Animated.View>
      );
  }

}

export default class TodoColumn extends Component {

  _data = null

  constructor(props) {
    super(props)

    let week = props.week
    let column = props.column

    this.state = {
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

    this.loadData()
  }

  show() {
    this.setState({show: true})
  }

  hide() {
    this.setState({show: false})
  }

  loadData() {
    let week = this.props.week
    week.getWeekDataAtColumn(this.props.column, (data) => {
      this._data = data
    })
  }

  componentDidMount() {
    ItemManager.sharedInstance().addListener('change', this, this._handleItemsSelectionChange.bind(this))
    ItemManager.sharedInstance().addListener('update', this, this._handleItemUpdate.bind(this))
    let selectedItem = ItemManager.sharedInstance().getSelectedItem()

    let week = this.props.week
    week.getWeekDataAtColumn(this.props.column, (data) => {
      this._data = data
      this.setState({
        selectedItemKey: selectedItem ? selectedItem.key : null
      })
    })
  }

  componentWillUnmount() {
    ItemManager.sharedInstance().removeListener('change', this)
    ItemManager.sharedInstance().removeListener('update', this)
  }

  _handleItemsSelectionChange(selectedItem) {
    this.setState({
      selectedItemKey: selectedItem ? selectedItem.key : null
    })
  }

  _handleItemUpdate(selectedItem) {
    this.setState({
      selectedItemKey: selectedItem ? selectedItem.key : null
    })
  }

  _onPressItem(day, column, index) {

    console.log(`Pressed item ${index}`)

    ReactNativeHapticFeedback.trigger('impactLight')
    
    let itemManager = ItemManager.sharedInstance()
    if (itemManager.isLock()) return

    let data = this._data
    let item = data[day][index]

    let curr = itemManager.getSelectedItem()
    if (curr && curr.key == item.key) {
      // Deselect 
      itemManager.setSelectedItem(null)
    } else {
      itemManager.setSelectedItem(item)
    }
  }

  _updateCellData(day, cellData) {
    this._data[day] = cellData
  }

  _getCellForDay(day) {
    const { column, selectedItemKey } = this.state
    let items = this._data ? this._data[day] : [] || []
    return (
      <View  style={styles.todoCell}>
        {items.length > 0 ? 
          <SortableList
            horizontal
            style={styles.list}
            contentContainerStyle={styles.contentContainer}
            data={function() {
              var d = {}
              for (var i in items) {
                let item = items[i]
                d[i] = item
              }
              return d
            }.bind(this)()}
            onChangeOrder={(nextOrderkeys) => {
              this._nextOrder = nextOrderkeys
            }}
            onReleaseRow={() => {
              if (this._nextOrder) {
                console.log(this._nextOrder)
                var nextoOrderedItems = []
                for (var i in this._nextOrder) {
                  var item = items[this._nextOrder[i]]
                  item.key = `${day}_${column}_${i}`
                  nextoOrderedItems.push(item)
                }

                let week = this.props.week
                let cell_id = `${day}_${column}`
                week.updateOrder(cell_id, nextoOrderedItems).then((newOrderedItems)=>{
                  // this._updateCellData(day, newOrderedItems)
                })
              }
            }}
            onPressRow={this._onPressItem.bind(this,day, column)}
            onActivateRow={() => {
              ReactNativeHapticFeedback.trigger('impactLight')
              ItemManager.sharedInstance().setSelectedItem(null)
            }}
            renderRow={({data, active}) =>
              <Item data={data} 
                    active={active} 
                    selectedItemKey={selectedItemKey} 
                    week={this.props.week}
                    day={day}
                    column={column}
              />
            }
            />
          : undefined }
      </View>
    )
  }

  _onPressSpace() {
    let item = ItemManager.sharedInstance().getSelectedItem()
    if (item) {
      ItemManager.sharedInstance().setSelectedItem(null)
    }
  }

  render() {
    const { icon } = this.props
    const { show } = this.state

    return (
      <TouchableWithoutFeedback onPress={this._onPressSpace} >
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
      </View>
      </TouchableWithoutFeedback>
     );
  }
}


const styles = StyleSheet.create({
  todoCell: {
    flex: isIphoneX() ? 2 : 1
  },
  headerCell: {
    flex: isIphoneX() ? 2 : 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  listStyle: {

  },
  list: {
    marginTop: 6,
    flex: 1,
  },
  contentContainer: {

    ...Platform.select({
      ios: {
        paddingHorizontal: 0,
        paddingRight: 6
      },

      android: {
        paddingHorizontal: 0,
        paddingRight: 6
      }
    })
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