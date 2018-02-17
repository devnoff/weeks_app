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
import SortableList from 'react-native-sortable-list'

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
      data: props.data
    }

    console.log(props.data)
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.hasOwnProperty('data')) {
      this.setState({
        data: nextProps.data
      })
    }
  }

  componentDidMount() {
    ItemManager.sharedInstance().addListener('delete', this, this._handleItemDeleted.bind(this))
    ItemManager.sharedInstance().addListener('updateLayout', this, this._handleItemUpdateLayout.bind(this))
  }

  componentWillUnmount() {
    ItemManager.sharedInstance().removeListener('delete', this)
    ItemManager.sharedInstance().removeListener('updateLayout', this)
  }

  _handleItemUpdateLayout(item) {
    let cell_id = ItemManager.cellIdOfItem(item)
    if (this.cellId == cell_id) {
      let index = ItemManager.indexOfItem(item)
      this.setState({
        data: [
          ...this.state.data.slice(0, index),
          Object.assign({}, item),
          ...this.state.data.slice(index + 1)
        ]
      })
      // this.forceUpdate()
    }
  }

  _handleItemUpdate(selectedItem) {

    let cell_id = ItemManager.cellIdOfItem(selectedItem)
    if (cell_id != this.cellId) return

    let index = ItemManager.indexOfItem(selectedItem)

    var data = this.state.data
    data = [
      ...data.slice(0, index),
      Object.assign({}, selectedItem),
      ...data.slice(index + 1)
    ]

    this.setState({ data: data })
  }

  _handleItemDeleted(cell_id, index) {
    if (cell_id == this.cellId) {
      var data = this.state.data
      data.splice(index, 1)
      this.setState({ data: data })
    }
  }

  _onPressItem(day, column, index) {

    console.log(`Pressed item ${index}`)

    ReactNativeHapticFeedback.trigger('impactLight')
    
    let itemManager = ItemManager.sharedInstance()
    if (itemManager.isLock()) return

    let data = this.props.data
    let item = data[index]

    let curr = itemManager.getSelectedItem()
    if (curr && curr.key == item.key) {
      // Deselect 
      itemManager.setSelectedItem(null)
    } else {
      itemManager.setSelectedItem(item)
    }
  }

  render() {
    const { column, day, week } = this.props
    const { data } = this.state
    let items = data || []
    let cell_id = this.cellId
    return (
      <View  style={styles.todoCell}>
        {items.length > 0 ? 
          <SortableList
            horizontal
            ref={(ref) => {this.sortableList = ref}}
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

                week.updateOrder(cell_id, nextoOrderedItems).then((newOrderedItems)=>{
                  // this._updateCellData(day, newOrderedItems)
                })
              }
            }}
            onPressRow={this._onPressItem.bind(this, day, column)}
            onActivateRow={() => {
              ReactNativeHapticFeedback.trigger('impactLight')
              ItemManager.sharedInstance().setSelectedItem(null)
            }}
            renderRow={({data, active}) =>
              <Item data={data} 
                    active={active} 
                    week={week}
                    day={day}
                    column={column}
                    parent={this}
              />
            }
            />
          : undefined }
      </View>
    )
  }
}

class Item extends Component {

  _nextOrder = []

  constructor(props) {
    super(props)

    this.state = {
      selectedItemKey: null,
      data: Object.assign({}, props.data)
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

    console.log('Item _handleItemUpdate')
    console.log(this.props.parent)

    if (selectedItem.key == this.state.data.key) {
      this.setState({ data: Object.assign({}, selectedItem) })
      setTimeout(function(){
        this.props.parent.sortableList._onUpdateLayouts()
      }.bind(this), 300)
    }
  }

  componentDidMount() {
    // ItemManager.sharedInstance().addListener('update', this, this._handleItemUpdate.bind(this))
    ItemManager.sharedInstance().addListener('change', this, this._handleItemsSelectionChange.bind(this))

    let selectedItem = ItemManager.sharedInstance().getSelectedItem()
    this.setState({
      selectedItemKey: selectedItem ? selectedItem.key : null
    })
  }

  componentWillUnmount() {
    // ItemManager.sharedInstance().removeListener('update', this)
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

    if (nextProps.hasOwnProperty('selectedItemKey'))
      this.setState({selectedItemKey: nextProps.selectedItemKey})
  
  }

  _onLayoutItem(rowKey, {nativeEvent: {layout}}) {

    if (rowKey == 'mon_1_0') {
      console.log('_onLayoutItem')
      console.log(rowKey)
      console.log(layout)
    }
  }

  render() {
   const {day, column, week, onPress} = this.props
   const {selectedItemKey, data} = this.state

    return function() {
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
          <View style={itemStyle}>
            <Text style={textStyle} onLayout={this._onLayoutItem.bind(this, data.key)}>{item.title}</Text>
            {note ? <Text style={{fontSize:9, color:'#aaa'}}>{note}</Text> : undefined}
          </View>
        </View>
      )
      return <BoomItem scale={bounce ? 0.9 : 1} delay={500}>{el}</BoomItem>;
    }.bind(this)()

    return (
      <Animated.View onLayout={this._onLayoutItem.bind(this, data.key)} style={[
        // styles.item,
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

          let bounce = week.lastHandledItemsSet().has(item.key)
          if (bounce) week.lastHandledItemsSet().delete(item.key)

          let note = item.note ? item.note.split('\n')[0] : undefined

          let el = (
            <View style={styles.itemBox}>
              <View style={itemStyle}>
                <Text style={textStyle}>{item.title}</Text>
                {note ? <Text style={{fontSize:9, color:'#aaa'}}>{note}</Text> : undefined}
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
  _sortableList = {}

  constructor(props) {
    super(props)

    let week = props.week
    let column = props.column

    this.state = {
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

  loadData(callback) {
    let week = this.props.week
    week.getWeekDataAtColumn(this.props.column, (data) => {
      this._data = data

      if (callback) callback(data)
    })
  }

  componentDidMount() {
    ItemManager.sharedInstance().addListener('delete', this, this._handleItemDeleted.bind(this))
    // ItemManager.sharedInstance().addListener('updateLayout', this, this._handleItemUpdateLayout.bind(this))
    let week = this.props.week
    this.loadData(function() {
      this.forceUpdate() 
    }.bind(this))
  }

  componentWillUnmount() {
    // ItemManager.sharedInstance().removeListener('updateLayout', this)
    ItemManager.sharedInstance().removeListener('delete', this)
  }


  _handleItemDeleted(cell_id, index) {
    let list = this._sortableList[cell_id]
    if (list) {
      this.loadData()
    }
  }

  _handleItemUpdateLayout(selectedItem) {
    // var arr = selectedItem.key.split('_')
    // let day = arr[0]
    // let column = arr[1]
    // let cell_id = `${day}_${column}`

    // let list = this._sortableList[cell_id]
    // if (list) {
    //   this.loadData(() => {
    //     this.forceUpdate()
    //   })
    // }    
  }

  

  _updateCellData(day, cellData) {
    this._data[day] = cellData
  }

  _getCellForDay(day) {
    const { column, week } = this.props
    let items = this._data ? this._data[day] : [] || []

    return (<Cell day={day} column={column} data={items} week={week} />)
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
    // flex: 1,
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
    fontWeight: 'bold',
    paddingHorizontal: 1

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