import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import ReactNativeHapticFeedback from 'react-native-haptic-feedback'
import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput
} from 'react-native';
import SlideItem from './SlideItem'
import FadeItem from './FadeItem'
import Panel from './Panel'
import OnLayout from 'react-native-on-layout'
import WeekManager from '../manager/week'
import ItemManager from '../manager/item';
import Notification from '../manager/notification';

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
      todoItem: props.item,
      disabled: false,
      descHeight: 0
    }

  }

  show() {
    this.setState({show: true})
  }

  hide() {
    this.setState({show: false})
  }

  _onPressTitleButton() {    
    this.setState({ disabled: true })
    Notification.post('edit_overlay_request', this.props.item)
  }

  async _onToggleDoneButton() {
    let week = WeekManager.getCurrentWeek()
    let todoItem = this.state.todoItem
    todoItem.done = !todoItem.done

    if (todoItem.done) 
      ReactNativeHapticFeedback.trigger('notificationSuccess')
    else 
      ReactNativeHapticFeedback.trigger('impactLight')

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
    this.setState({ disabled: true })

    // Cell Select Mode 
    // Confirm Panel
    Notification.post('dupliate_overlay_request', this.props.item)
  }

  _onPressTrashButton() {
    this.setState({ disabled: true })
    
    // Delete Confirm Panel
    Notification.post('delete_overlay_request', this.props.item)
  }

  checkComplete(el) {
    var done = true
    let items = [this.item1, this.item2, this.item3, this.item4, this.item5]
    for (var i in items) {

      let item = items[i]

      // if (item == null){
      //   done = false
      //   break
      // } 

      // console.log(`el: ${el}  it: ${i} show : ${this.state.show} item visible: ${item.visible}`)


      if (this.state.show && !item.visible) {
        done = false
        break
      }

      if (!this.state.show && item.visible) {
        done = false
        break
      }
    }

    if (!done) return

    if (this.state.show) {
      // console.log('on show!')
      if (this.onShow) this.onShow()
    } else {
      if (this.onHide) this.onHide()
    }
    
  }

  render() {

    const { show, todoItem, disabled, descHeight } = this.state

    return (
      <OnLayout pointerEvents="box-none" style={styles.view}>
        {({ width, height}) => (
        <View pointerEvents="box-none" style={styles.view}>

          {/* TOP */}
  
          <View style={styles.top} ref={(ref) => { this.top = ref}}>
            <SlideItem
              style={styles.slideItem}
              ref={(item) => { this.item1 = item}}
              onFinishAnim={this.checkComplete.bind(this,'title')}
              x={-80} 
              delay={50} 
              to={10} 
              show={show} 
              onLayout={(e)=>{
                const {height} = e.nativeEvent.layout
                this.top.measure((x, y, width, topHeight, pageX, pageY)=> {
                  this.setState({
                    descHeight: topHeight - height
                  })
                })
              }}
            >
              <TouchableOpacity disabled={disabled} onPress={this._onPressTitleButton.bind(this)}>
                <Text style={styles.title}>
                  {function() {
                    var t = todoItem.title
                    if (t.length > 18) {
                      t = t.substring(0, 18) + '...'
                    }
                    return t
                  }()}
                  {<Icon color="#ccc" name="lead-pencil" size={15}/>}
                </Text>
              </TouchableOpacity>
            </SlideItem>
            <SlideItem 
              style={styles.slideItem}
              ref={(item) => { this.item2 = item}}
              onFinishAnim={this.checkComplete.bind(this, 'note')}
              x={-80} 
              delay={150} 
              to={10} 
              show={show} >
              <TextInput
                  style={[styles.description, {height: descHeight}]}
                  multiline={true}
                  editable={false}
                  underlineColorAndroid='rgba(0,0,0,0)'
                  value={todoItem.note}
                />
              {/* <TouchableOpacity disabled={disabled} onPress={this._onPressTitleButton.bind(this)}>
                <Text style={styles.description}>
                  {todoItem.note}
                </Text>
              </TouchableOpacity> */}
            </SlideItem>
          </View>
  
          {/* MIDDLE */}
  
          <View style={styles.middle}>
            <FadeItem 
              style={styles.slideItem}
              ref={(item) => { this.item3 = item}}
              onFinishAnim={this.checkComplete.bind(this, 'check')}
              delay={0}
              show={show} >
              <TouchableOpacity onPress={this._onToggleDoneButton.bind(this)}>
                <View style={[styles.iconBox, styles.checkbox]}>
                  <Icon color="#666" style={(todoItem.done?styles.checked:undefined)} name="check" size={30}/>
                  {todoItem.done ? <Text style={styles.done}>Done</Text> : undefined}
                </View>
              </TouchableOpacity>
            </FadeItem>
          </View>
  
          {/* BOTTOM */}
  
          <View style={styles.bottom}>
            <FadeItem 
              style={[styles.slideItem, styles.bottomIcon]}
              ref={(item) => { this.item4 = item}}
              onFinishAnim={this.checkComplete.bind(this, 'copy')}
              delay={50}
              show={show} >
              <TouchableOpacity disabled={disabled} onPress={this._onPressDuplicateButton.bind(this)}>
                <View style={styles.iconBox}>
                  <Icon color="#666" name="content-copy" size={18}/>
                </View>
              </TouchableOpacity>
            </FadeItem>
            <FadeItem 
              style={[styles.slideItem, styles.bottomIcon]}
              ref={(item) => { this.item5 = item}}
              onFinishAnim={this.checkComplete.bind(this, 'delete')}
              delay={100}
              show={show} >
              <TouchableOpacity disabled={disabled} onPress={this._onPressTrashButton.bind(this)}>
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
    // backgroundColor: 'red',
    justifyContent: 'flex-start',
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
    // justifyContent: 'flex-start',
  },
  title: {
    fontFamily: 'Courier-Bold',
    // fontWeight: 'bold',
    fontSize: 16,
    marginTop: 25,
    color: '#333'
  },
  description: {
    // flex: 1,
    fontFamily: 'Courier',
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
  },
  done: {
    position: 'absolute',
    fontSize: 9,
    color: 'green',
    bottom: 0
  }
})