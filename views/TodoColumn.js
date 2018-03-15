import PropTypes from 'prop-types'; // ES6
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
import SortableList from './SortableList/SortableList'

const window = Dimensions.get('window')

class Cell extends Component {

  static propTypes = {
    day: PropTypes.string.isRequired,
    column: PropTypes.number.isRequired,
    data: PropTypes.array,
    week: PropTypes.object
  }

  constructor(props) {
    super(props)

    this.cellId = `${props.day}_${props.column}`

    this.state = {
      data: props.data,
      week: props.week,
      reset: false
    }

  }

  _handleItemUpdateLayout(item) {
    let arr = item.key.split('_')
    let week_id = `${arr[0]}_${arr[1]}`
    if (week_id == this.cellId) {
      this.setState({
        reset: true
      })
    }
  }

  componentDidMount() {
    ItemManager.sharedInstance().addListener('updateLayout', this, this._handleItemUpdateLayout.bind(this))
  }

  componentWillUnmount() {
    ItemManager.sharedInstance().removeListener('updateLayout', this)
  }

  setDeletedItem(item) {
    var items = this.props.data
    // var idx = _.findIndex(data, {order: item.order})
    // data.splice(idx, 1)

    var d = {}
    for (var i in items) {
      let item = items[i]
      // d[i] = item
      d[item.key] = item
    }

    this.sortableList.deleteItem(d, item.key)
  }

  componentWillReceiveProps(nextProps) {

    var newState = {
      reset: false
    }
    if (nextProps.hasOwnProperty('week')) {
      newState['week'] = nextProps.week
    }

    if (nextProps.hasOwnProperty('data')) {
      newState['data'] = nextProps.data
    }

    if (newState.hasOwnProperty('week') && this.state.week != nextProps.week) { 
      //newState.hasOwnProperty('data')
      // console.log('column refreshing !')
      this.setState({data : null}, () => {
        this.setState(newState)    
      })
    } else {
      this.setState(newState)
    }
    
  }

  _onPressItem(order) {

    // console.log(`Pressed item ${order}`)
    // console.log(this.state.week.rawData())
    
    let itemManager = ItemManager.sharedInstance()
    if (itemManager.isLock()) return

    ReactNativeHapticFeedback.trigger('impactLight')

    let list = this.sortableList
    let data = list.props.data
    let item = data[order]

    let curr = itemManager.getSelectedItem()
    if (curr && curr.key == item.key) {
      // Deselect 
      itemManager.setSelectedItem(null)
    } else {
      itemManager.setSelectedItem(item)
    }
  }

  getParent() {
    return this.sortableList
  }

  render() {
    const { column, day, style } = this.props
    const { data, reset } = this.state

    // const { data } = this.state
    let items = data || []
    let cell_id = this.cellId

    // console.log(data, 'render Cell' , column, day)
    return (
      <FadeItem
        show={true}
        delay={300}
        style={[styles.todoCell, style]}>
        { !reset && items.length > 0 ? 
          <SortableList
            horizontal
            ref={(ref) => {this.sortableList = ref}}
            style={styles.list}
            contentContainerStyle={styles.contentContainer}
            data={function() {
              var d = {}
              for (var i in items) {
                let item = items[i]
                // d[i] = item
                d[item.key] = item
              }
              return d
            }.bind(this)()}
            onChangeOrder={(nextOrderkeys) => {
              this._nextOrder = nextOrderkeys
              // console.log(`Next ORDER : ${this._nextOrder.join('-')}`)
            }}
            onReleaseRow={() => {
              if (this._nextOrder) {
                // console.log(this._nextOrder)
                var nextOrderedItems = []
                var newOrder = []
                for (var i in this._nextOrder) {
                  var idx = _.findIndex(items, {key: this._nextOrder[i]})
                  var item = items[idx] //this._nextOrder[i]
                  // item.key = `${day}_${column}_${i}`
                  item.order = i 
                  newOrder.push(item.key)
                  nextOrderedItems.push(item)
                }

                this.state.week.updateOrder(cell_id, nextOrderedItems).then((newOrderedItems)=>{
                  this.props.data = newOrderedItems
                  this.sortableList.setOrder(newOrder)

                })
              }
            }}
            onPressRow={this._onPressItem.bind(this)}
            onActivateRow={() => {
              ReactNativeHapticFeedback.trigger('impactLight')
              ItemManager.sharedInstance().setSelectedItem(null)
            }}
            renderRow={({data, active}) =>
              <Item data={data} 
                    active={active} 
                    week={this.state.week}
                    day={day}
                    column={column}
                    parent={this.getParent}
              />
            }
            />
          : undefined }
      </FadeItem>
    )
  }
}

class Item extends Component {

  _nextOrder = []

  constructor(props) {
    super(props)

    this.state = {
      selectedItemKey: null,
      data: props.data, // Object.assign({}, props.data),
      week: props.week,
      layout: null
    }

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

  _handleItemsSelectionChange(item) {
    this.setState({
      selectedItemKey: item ? item.key : null
    })
  }

  _handleItemUpdate(selectedItem) {

    // console.log('Item _handleItemUpdate')
    // console.log(this.props.parent)

    if (selectedItem.key == this.state.data.key) {
      this.setState({data: selectedItem})
      // this.forceUpdate()
    }
  }

  componentDidMount() {
    ItemManager.sharedInstance().addListener('update', this, this._handleItemUpdate.bind(this))
    ItemManager.sharedInstance().addListener('change', this, this._handleItemsSelectionChange.bind(this))
    

    let selectedItem = ItemManager.sharedInstance().getSelectedItem()
    this.setState({
      selectedItemKey: selectedItem ? selectedItem.key : null
    })
  }

  componentWillUnmount() {
    ItemManager.sharedInstance().removeListener('update', this)
    ItemManager.sharedInstance().removeListener('change', this)
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.active !== nextProps.active) {
      Animated.timing(this._active, {
        duration: 300,
        easing: Easing.bounce,
        toValue: Number(nextProps.active),
      }).start()
    }

    var needUpdate = this.state.data && !_.isEqual(this.state.data, nextProps.data)
    // if (this.data && this.data.key == 'sun_0_0') {
    //   console.log(this.state.data, 'curr data')
    //   console.log(nextProps.data, 'next data')
    // }

    var newState = {}

    if (nextProps.hasOwnProperty('week'))
      newState['week'] = nextProps.week

    if (nextProps.hasOwnProperty('selectedItemKey'))
      newState['selectedItemKey'] = nextProps.selectedItemKey
  
    if (nextProps.hasOwnProperty('data'))
      newState['data'] = nextProps.data
    
    this.setState(newState, () => {
      if (needUpdate) {
        // console.log('force updating')
        // this.forceUpdate()
      }
    })


  }

  _onLayout(item, e) {
    const {x,y,width,height } = e.nativeEvent.layout

    // console.log(this._parent)

    if (this._parent) this._parent.onResize(e.nativeEvent.layout)


    // this.setState({
    //   layout: e.nativeEvent.layout
    // })
    // if (item.key == 'sun_0_0')
    // console.log(item.key, 'Item onLayout', width)
  }

  render() {
    const {day, column, onPress} = this.props
    const {selectedItemKey, data, layout} = this.state

    // if (data.key == 'sun_0_0') {
    //   console.log(data.key, 'render Item')
    // }

    //  console.log(data, 'render Item' , column, day)

    return (
      <Animated.View style={[
        this._style
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

          let bounce = this.state.week.lastHandledItemsSet().has(item.key)
          if (bounce) this.state.week.lastHandledItemsSet().delete(item.key)

          let note = item.note ? item.note.split('\n')[0] : undefined

          let el = (
            <View 
              ref={(ref) => { this.container = ref }} 
              style={[itemStyle, layout ? {width: layout.width } : undefined]} 
              onLayout={this._onLayout.bind(this, item)}
            >
              <Text style={textStyle}>
              {item.title}
              </Text>
              {note && note.length > 0 ? <Text style={{fontSize:9, color:'#aaa'}}>{note}</Text> : undefined}
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

  _cells = {}

  _mounted = false

  constructor(props) {
    super(props)

    this.state = {
      selectedItemKey: null,
      show: true,
      week: props.week,
      data: null,
      selectedRow: props.selectedRow
    } 
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.show == true) {
      this.show()
    } else if (nextProps.show == false) {
      this.hide()
    }

    if (nextProps.hasOwnProperty('selectedRow')) {
      this.setState({
        selectedRow: nextProps.selectedRow
      })
    }

    if (nextProps.hasOwnProperty('week')) { //  && this.state.week.weekId() != nextProps.week.weekId()
      this.setState({week: nextProps.week}, () => {
        this.loadData(function() {
          // this.forceUpdate()
        }.bind(this))
      })
    } else {
      this.loadData()
    }
  }

  show() {
    this.setState({show: true})
  }

  hide() {
    this.setState({show: false})
  }

  loadData(callback) {
    this.state.week.getWeekDataAtColumn(this.props.column, (data) => {
      // console.log(data, 'column', this.props.column)
      // this._data = data
      if (this._mounted)
        this.setState({
          data: data
        })

      if (callback) callback(data)
    })
  }

  componentDidMount() {
    this._mounted = true

    ItemManager.sharedInstance().addListener('delete', this, this._handleItemDeleted.bind(this))

    this.loadData(function() {
      // this.forceUpdate() 
    }.bind(this))
  }

  componentWillUnmount() {
    this._mounted = false
    ItemManager.sharedInstance().removeListener('delete', this)
  }

  _handleItemDeleted(cell_id, deletedItem) {

    // let day = cell_id.substring(0, 3)
    // let items = this._data ? this._data[day] : [] || []

    // var idx = -1
    // for (var i in items) {
    //   if (deletedItem == items[i]) {
    //     idx = i
    //     break
    //   }
    // }
    // if (idx > -1)
    //   items.splice(idx, 1)

    let cell = this._cells[cell_id]
    if (cell) {
      cell.setDeletedItem(deletedItem)
    }

  }
  

  _updateCellData(day, cellData) {
    this.state.data[day] = cellData ///////
  }

  _getCellForDay(day) {
    const { column } = this.props
    const { selectedRow } = this.state
    let cell_id = `${day}_${column}`

    var style

    if (day == selectedRow)
      style = {
        backgroundColor: '#dde0d2'//b6baae22
      }

    return (<Cell
              style={style}
              day={day} 
              column={column} 
              data={this.state.data ? this.state.data[day] : [] || []} 
              week={this.state.week} 
              ref={(ref) => { this._cells[cell_id] = ref }}
              />)
  }

  _onPressSpace() {
    let item = ItemManager.sharedInstance().getSelectedItem()
    // if (item) {
      ItemManager.sharedInstance().setSelectedItem(null)
    // }
  }

  render() {
    const { icon, onPressHeader } = this.props
    const { show } = this.state

    return (
      <TouchableWithoutFeedback onPress={this._onPressSpace} >
      <View style={{flex: 1, flexDirection: 'column'}}
      >
        
        <TouchableOpacity onPress={onPressHeader} style={styles.headerCell}>
          <View>
            {icon}
          </View>
        </TouchableOpacity>

        {this._getCellForDay('mon')}
        {this._getCellForDay('tue')}
        {this._getCellForDay('wed')}
        {this._getCellForDay('thu')}
        {this._getCellForDay('fri')}
        {this._getCellForDay('sat')}
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
    flex: isIphoneX() ? 2 : 1,
    // backgroundColor: 'blue',
    justifyContent: 'center',
  },
  headerCell: {
    flex: isIphoneX() ? 2 : 0.8,
    justifyContent: 'center',
    alignItems: 'center'
  },
  listStyle: {

  },
  list: {
    // marginTop: 6,
    // flex: 1,
    // backgroundColor: 'orange',
    height: 33
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
    // flex: 1,
    justifyContent: 'center',
    // backgroundColor: 'blue',
  },
  item: {
    backgroundColor: '#f6f8f1',
    borderRadius: 8,
    borderColor: '#333',
    borderWidth: 1.5,
    height: 33,
    marginLeft: 6,
    minWidth: 33,
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 2,
    paddingRight: 2,
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
    height: 17,
    fontFamily: 'Courier-Bold',
    color: '#333',
    fontSize: 14,
    lineHeight: 20,
    overflow: 'visible',
    // fontWeight: 'bold',
    paddingHorizontal: 2,
    // backgroundColor: 'red'
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