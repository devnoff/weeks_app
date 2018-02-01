import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import SlideItem from './SlideItem'
import FadeItem from './FadeItem'
import Panel from './Panel'
import OnLayout from 'react-native-on-layout'
import WeekManager from '../manager/week'
import ItemManager from '../manager/item';

export default class ItemPanel extends Panel {  

  item1
  item2
  item3
  item4
  item5

  constructor(props) {
    super(props)

    this.state = {
      show: false,
      todoItem: props.item
    }

  }

  show() {
    this.setState({show: true})
  }

  hide() {
    this.setState({show: false})
  }

  _onPressTitleButton() {
    alert('pressed title')
  }

  async _onToggleDoneButton() {
    let week = WeekManager.sharedInstance().getCurrentWeek()
    let todoItem = this.state.todoItem
    todoItem.done = !todoItem.done
    try {
      await week.updateToDoItem(todoItem)
      this.setState({
        todoItem: todoItem
      })
      ItemManager.sharedInstance().needUpdateSelectedItem()
    } catch (e) {
      console.log(e)
    }
    
  }

  _onPressDuplicateButton() {

  }

  _onPressTrashButton() {

  }

  checkComplete() {
    var done = true
    let items = [this.item1, this.item2, this.item3, this.item4, this.item5]
    for (var i in items) {

      let item = items[i]

      if (this.state.show && !item.state.visible) {
        done = false
      }

      if (!this.state.show && item.state.visible) {
        done = false
      }
    }

    if (!done) return

    if (this.state.show) {
      if (this.onShow) this.onShow()
    } else {
      if (this.onHide) this.onHide()
    }
    
  }

  render() {

    const { show, todoItem } = this.state

    return (
      <OnLayout pointerEvents="box-none" style={styles.view}>
        {({ width, height}) => (
        <View pointerEvents="box-none" style={styles.view}>

          {/* TOP */}
  
          <View style={styles.top}>
            <SlideItem
              style={styles.slideItem}
              ref={(item) => { this.item1 = item}}
              onFinishAnim={this.checkComplete.bind(this)}
              x={-80} 
              delay={50} 
              to={10} 
              show={show} >
              <Text style={styles.title}>
                {todoItem.title}
                {<Icon color="#ccc" name="lead-pencil" size={15}/>}
              </Text>
            </SlideItem>
            <SlideItem 
              style={styles.slideItem}
              ref={(item) => { this.item2 = item}}
              onFinishAnim={this.checkComplete.bind(this)}
              x={-80} 
              delay={150} 
              to={10} 
              show={show} >
              <TouchableOpacity onPress={this._onPressTitleButton.bind(this)}>
                <Text style={styles.description}>
                  {todoItem.note}
                </Text>
              </TouchableOpacity>
            </SlideItem>
          </View>
  
          {/* MIDDLE */}
  
          <View style={styles.middle}>
            <FadeItem 
              style={styles.slideItem}
              ref={(item) => { this.item3 = item}}
              onFinishAnim={this.checkComplete.bind(this)}
              delay={0}
              show={show} >
              <TouchableOpacity onPress={this._onToggleDoneButton.bind(this)}>
                <View style={[styles.iconBox, styles.checkbox]}>
                  <Icon color="#666" style={(todoItem.done?styles.checked:undefined)} name="check" size={30}/>
                </View>
              </TouchableOpacity>
            </FadeItem>
          </View>
  
          {/* BOTTOM */}
  
          <View style={styles.bottom}>
            <FadeItem 
              style={[styles.slideItem, styles.bottomIcon]}
              ref={(item) => { this.item4 = item}}
              onFinishAnim={this.checkComplete.bind(this)}
              delay={0}
              show={show} >
              <TouchableOpacity onPress={this._onPressDuplicateButton.bind(this)}>
                <View style={styles.iconBox}>
                  <Icon color="#666" name="content-copy" size={18}/>
                </View>
              </TouchableOpacity>
            </FadeItem>
            <FadeItem 
              style={[styles.slideItem, styles.bottomIcon]}
              ref={(item) => { this.item5 = item}}
              onFinishAnim={this.checkComplete.bind(this)}
              delay={0}
              show={show} >
              <TouchableOpacity onPress={this._onPressTrashButton.bind(this)}>
                <View style={styles.iconBox}>
                  <Icon color="#666" name="delete" size={20}/>
                </View>
              </TouchableOpacity>
            </FadeItem>
          </View>
        </View>  
        )}
      </OnLayout>
    );
  }
}


const styles = StyleSheet.create({
  view: {
    flex: 1
  },
  top: {
    flex: 2,
  },
  middle: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottom: {
    flex: 2,
    justifyContent: 'space-between',
  },
  slideItem: {
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'courier',
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 25
  },
  description: {
    fontFamily: 'courier',
    color: '#aaa',
    fontWeight: 'normal',
    fontSize: 12,
    marginTop: 10,
    marginRight: 10
  },
  extraSpace: {

  },
  checkbox: {
    // backgroundColor: '#aaa',
    // borderRadius: 20,
    // borderColor: '#aaa',
    // borderWidth: 1,
  },
  checked: {
    // backgroundColor: 'green',
    // borderColor: 'green',
    color: 'green'
  },
  iconBox: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    height: 40,
  },
  bottomIcon: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
})