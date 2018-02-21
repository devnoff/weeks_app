/**
 * Created by Robinson Park 
 * 2018.01.10
 * @flow
 */
import { isIphoneX } from 'react-native-iphone-x-helper'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import React, { Component } from 'react';
import {
  View, ImageBackground, StyleSheet, Platform, AppState, Text
} from 'react-native';
import WeekHeader from './views/WeekHeader'
import TodoColumn from './views/TodoColumn'
import EndColumn from './views/EndColumn'
import SelectionColumn from './views/SelectionColumn'
import WeekModel from './models/week'
import WeekManager from './manager/week'
import Overlay from './views/Overlay'
import Notification from './manager/notification'
import CreateModal from './views/CreateItemModal'
import ConfirmPanel from './views/ConfirmPanel'
import CellSelectionController from './controllers/CellSelectionController'
import ItemManager from './manager/item'
import _ from 'lodash'

console.log = ()=>{}

console.ignoredYellowBox = ['Remote debugger'];

function _flex(value) {
  return isIphoneX() ? value * 2 : value
}

export default class App extends Component {

  constructor(props) {
    super(props)

    this.week = new WeekModel()

    console.log(this.week)

    console.log(this.week.isCurrentWeek())

    WeekManager.setCurrentWeek(this.week)

    this.state = {
      appState: AppState.currentState,
      selectionMode: false,
      showCreateOverlay: false,
      visible: true
    }


  }

  componentDidMount() {
    AppState.addEventListener('change', this._handleAppStateChange);
    Notification.addListener('create_overlay_request',this, this._handleCreateRequest.bind(this))
    Notification.addListener('edit_overlay_request',this, this._handleEditRequest.bind(this))
    Notification.addListener('dupliate_overlay_request',this, this._handleDuplicateRequest.bind(this))
    Notification.addListener('delete_overlay_request',this, this._handleDeleteRequest.bind(this))
    
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this._handleAppStateChange);
    Notification.removeListener('create_overlay_request', this)
    Notification.removeListener('edit_overlay_request', this)
    Notification.removeListener('dupliate_overlay_request', this)
    Notification.removeListener('delete_overlay_request', this)
  }

  _handleDeleteRequest = (item) => {
    ItemManager.sharedInstance().lock()

    let endCol = this.endColumn
    let pc = endCol.panelController
    this.week.deleteToDoItem(item).then(() => {
      ItemManager.sharedInstance().deleteSelectedItem()

      pc.popToRootPanel(() => {
        endCol.moreButtonFadeIn()
        ItemManager.sharedInstance().unlock()
      })
    })
    CellSelectionController.sharedInstance().reset()
  }

  _handleDuplicateRequest = (item) => {
    let self = this

    console.log('_handleDuplicateRequest')

    // Show Create Modal
    self.setState({ selectionMode: true, showCreateOverlay: false, visible: true })
    
    let endCol = self.endColumn
    let pc = endCol.panelController
    pc.push({ 
      ref: 'duplicatePanel',
       el: <ConfirmPanel
            key='duplicatePanel'
            ref={comp => pc.refs['duplicatePanel'] = comp}
            confirmText="Done"
            cancelText="cancel"
            message={`Choose cells where you want to copy to`}
            enableConfirmButton={false}
            />
    }, () => { // Fires after present create panel
      endCol.moreButtonFadeOut()
    }, (duplicatePanel) => { // Injector

      // For Cell Select Mode Validation
      CellSelectionController.sharedInstance().addListener('change', duplicatePanel, (selectedCells) => {
        console.log(`selected cells : ${selectedCells.length}`)
        duplicatePanel.setState({enableConfirmButton: selectedCells.length > 0 ? true : false})
      })
      duplicatePanel.unmountHandler = (el) => {CellSelectionController.sharedInstance().removeListener('change', el)}

      duplicatePanel.onConfirm = () => {
        let cell_ids = CellSelectionController.sharedInstance().getSelectedCells()
        self.week.addToDoItemsForCellIds(item, cell_ids).then(() => {
          pc.popToRootPanel()
          endCol.moreButtonFadeIn()
          ItemManager.sharedInstance().setSelectedItem(null)
          self.setState({ showCreateOverlay: false, selectionMode: false, visible: true })
        })
        CellSelectionController.sharedInstance().reset()
      }

      duplicatePanel.onCancel = () => {
        ItemManager.sharedInstance().setSelectedItem(item)
        self.setState({ showCreateOverlay: false, selectionMode: false, visible: true })
        CellSelectionController.sharedInstance().reset()
      }
    })
  }

  _handleEditRequest = (item) => {
    let self = this

    console.log('_handleEditRequest')

    // Show Create Modal
    self.setState({ showCreateOverlay: true, selectionMode: false, visible: false })
    
    let endCol = self.endColumn
    let pc = endCol.panelController
    pc.push({ 
      ref: 'editPanel',
       el: <ConfirmPanel
            key='editPanel'
            ref={comp => pc.refs['editPanel'] = comp}
            confirmText="Done"
            cancelText="cancel"
            message={`Edit${'\n'}To-Do Item`}
            />
    }, () => { // Fires after present create panel
      endCol.moreButtonFadeOut()
    }, (editPanel) => { // Injector
      editPanel.onConfirm = () => {

        // Set value to item 
        item.title = self.createModal.state.title,
        item.note = self.createModal.state.note,

        item = _.cloneDeep(item) /* To release memory pointers in where the old item data is used */

        self.setState({ visible: true })

        self.week.updateToDoItem(item).then(() => {

          self.setState({ showCreateOverlay: false, selectionMode: false, visible: true })
          // ItemManager.sharedInstance().needUpdateSelectedItem(item)

          endCol.moreButtonFadeIn()

          // Hide Close Overlay & Switch to cell select mode
          

          ItemManager.sharedInstance().setSelectedItem(item)
          ItemManager.sharedInstance().needUpdateSelectedItemLayout(item)
          
        }).catch((e) => {

        })

        

      }

      editPanel.onCancel = () => {
        // pc.popToRootPanel(() => {
          
        // })
        // endCol.moreButtonFadeIn()
        ItemManager.sharedInstance().setSelectedItem(item)
        self.setState({ showCreateOverlay: false, selectionMode: false, visible: true })
      }
    })
  }

  _handleCreateRequest = () => {

    let self = this

    console.log('_handleCreateRequest')

    // Show Create Modal
    self.setState({ showCreateOverlay: true, visible: false })

    var newItem = null
    
    let endCol = self.endColumn
    let pc = endCol.panelController
    pc.push({ 
      ref: 'createPanel',
       el: <ConfirmPanel
            key='createPanel'
            ref={comp => pc.refs['createPanel'] = comp}
            confirmText="Next"
            cancelText="cancel"
            message={`Create${'\n'}To-Do Item`}
            enableConfirmButton={false}
            />
    }, () => { // Fires after present create panel
      endCol.moreButtonFadeOut()
    }, (createPanel) => { // Injector

      // For Create Modal Title Text Input Validation
      Notification.addListener('title_text_input_change', createPanel, (text) => {
        console.log(`received text: ${text}`)
        createPanel.setState({enableConfirmButton: text ? true : false})
      })
      createPanel.unmountHandler = (el) => {Notification.removeListener('title_text_input_change', el)}

      createPanel.onConfirm = () => {
        // Create New Item Object
        newItem = {
          title: self.createModal.state.title,
          note: self.createModal.state.note,
          done: false
        }

        // Present CellSelectConfirmPanel
        pc.push({ 
          ref: 'selectPanel',
           el: <ConfirmPanel
                key='selectPanel'
                ref={comp => pc.refs['selectPanel'] = comp}
                confirmText="Done"
                cancelText="cancel"
                message={`Choose cells you want to place the To-Do item`}
                enableConfirmButton={false}
                />
        }, () => { // Fires after present select panel
          
        }, (selectPanel) => { // Injector

          // For Cell Select Mode Validation
          CellSelectionController.sharedInstance().addListener('change', selectPanel, (selectedCells) => {
            console.log(`selected cells : ${selectedCells.length}`)
            selectPanel.setState({enableConfirmButton: selectedCells.length > 0 ? true : false})
          })
          selectPanel.unmountHandler = (el) => {CellSelectionController.sharedInstance().removeListener('change', el)}

          selectPanel.onConfirm = () => {
            //
            //
            // CREATE ITEM AT CELLS
            //
            //
            // Add item to week object

            let cell_ids = CellSelectionController.sharedInstance().getSelectedCells()
            self.week.addToDoItemsForCellIds(newItem, cell_ids).then(() => {
              pc.popToRootPanel(() => {
                
              })
              endCol.moreButtonFadeIn()
              ItemManager.sharedInstance().reset()
              self.setState({ showCreateOverlay: false, selectionMode: false, visible: true })
              // self.forceUpdate()
            }).catch((e) => {

            })

            CellSelectionController.sharedInstance().reset()

          }

          selectPanel.onCancel = () => {
            pc.popToRootPanel()
            endCol.moreButtonFadeIn()
            self.setState({ showCreateOverlay: false, selectionMode: false, visible: true })
            CellSelectionController.sharedInstance().reset()
          }
        })

        // Hide Close Overlay & Switch to cell select mode
        self.setState({ showCreateOverlay: false, selectionMode: true, visible: true })

      }

      createPanel.onCancel = () => {
        pc.popToRootPanel()
        endCol.moreButtonFadeIn()
        self.setState({ showCreateOverlay: false, selectionMode: false, visible: true })
      }
    })
  }

  _handleAppStateChange = (nextAppState) => {
    if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
      console.log('App has come to the foreground!')

      // 오늘 날짜를 기준으로 WeekModel 불러옴


    }
    this.setState({appState: nextAppState});
  }
  

  requestPrevWeek() {
    let week_no = moment().isoWeek() - 1
    this.setState({
      week: WeekModel(moment().isoWeek(week_no))
    })
  }

  requestNextWeek() {
    let week_no = moment().isoWeek() + 1
    this.setState({
      week: WeekModel(moment().isoWeek(week_no))
    })
  }

  render() {

    const { selectionMode, showCreateOverlay, visible } = this.state

    const week = this.week

    let iphoneX = isIphoneX()

    return (
      <View style={{flex: 1}}>
        <ImageBackground source={Platform.OS === 'ios' ? require('./images/3.png'): null} resizeMode={Platform.OS === 'ios' ? "repeat" : 'none'} style={{flex: 1, flexDirection: 'row', backgroundColor: '#f6f8f1'}}>
          {function(){
            if (iphoneX) 
              return (<View style={{flex: 1}}></View>)
            else ''
          }()}
          <View style={{
            flex: _flex(1), 
            borderRightColor: '#666',
            borderRightWidth: 1,
            zIndex: 100
          }}>
            <WeekHeader week={week} ref={(ref) => { this.weekHeader = ref }}/>
          </View>
          <View style={{
            flex: _flex(3), 
            borderRightColor: '#666',
            borderRightWidth: 1,
            flexDirection: 'column',
            zIndex: 200
          }}>
          { !visible ? undefined : selectionMode ?
            <SelectionColumn 
              column={0} 
              icon={(<Icon size={20} name="weather-sunset"/>)}/> :
            (<TodoColumn
              ref={(ref) => { this.todoColumn1 = ref }}
              column={0} 
              icon={(<Icon size={20} name="weather-sunset"/>)}
              week={week}
            />)}
            
          </View>
          <View style={{
            flex: _flex(3),
            borderRightColor: '#666',
            borderRightWidth: 1,
            zIndex: 300
          }}>
          { !visible ? undefined : selectionMode ?
            <SelectionColumn 
              column={1} 
              icon={(<Icon size={20} name="weather-sunny"/>)}/> :
            (<TodoColumn
              ref={(ref) => { this.todoColumn2 = ref }}
              column={1} 
              icon={(<Icon size={20} name="weather-sunny"/>)}
              week={week}
            />)}
          </View>
          <View style={{
            flex: _flex(3),
            borderRightColor: '#666',
            borderRightWidth: 5,
            zIndex: 400
          }}>
          { !visible ? undefined : selectionMode ?
            <SelectionColumn 
              column={2} 
              icon={(<Icon size={20} name="weather-night"/>)}/> :
            (<TodoColumn
              ref={(ref) => { this.todoColumn3 = ref }}
              column={2} 
              icon={(<Icon size={20} name="weather-night"/>)}
              week={week}
            />)}
          </View>
          <View style={{
            flex: _flex(2),
            zIndex: 1000
          }}>
            <EndColumn week={week} ref={(ref) => { this.endColumn = ref }}/>
          </View>
          {function(){
            if (iphoneX) 
              return (<ImageBackground source={Platform.OS === 'ios' ? require('./images/3.png') : null} resizeMode={Platform.OS === 'ios' ? "repeat" : 'none'} style={{flex:1, backgroundColor: '#eee'}}/>)
            else ''
          }()}
        </ImageBackground>
        
        {/* Overlay */}
        <Overlay pointerEvents="box-none" show={showCreateOverlay} delay={0}>
          <View pointerEvents="box-none" style={styles.createModal}>
            {showCreateOverlay ? <CreateModal item={ItemManager.sharedInstance().getSelectedItem()} ref={(ref) => {this.createModal = ref} } /> : undefined}
          </View>
        </Overlay>
      </View>
    );
  }
}


const styles = StyleSheet.create({
  createModal: {
    flex: 1
  }
})

