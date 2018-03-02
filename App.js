/**
 * Created by Robinson Park 
 * 2018.01.10
 * @flow
 */
import { isIphoneX } from 'react-native-iphone-x-helper'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import React, { Component } from 'react';
import {
  View, ImageBackground, StyleSheet, Platform, AppState, Text, StatusBar
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
import WeekSelectorModal from './views/WeekSelectorModal'
import ConfirmPanel from './views/ConfirmPanel'
import CellSelectionController from './controllers/CellSelectionController'
import ItemManager from './manager/item'
import _ from 'lodash'
import moment from 'moment'
import DataManager from './manager/data'

console.log = ()=>{}

console.ignoredYellowBox = ['Remote debugger'];

function _flex(value) {
  return isIphoneX() ? value * 2 : value
}

export default class App extends Component {

  constructor(props) {
    super(props)

    this.state = {
      appState: AppState.currentState,
      selectionMode: false,
      showCreateOverlay: false,
      showWeekSelector: false,
  
      week: new WeekModel()
    }

    WeekManager.setCurrentWeek(this.state.week)
    console.log(this.state.week.isCurrentWeek())


  }

  componentWillMount() {
    StatusBar.setHidden(true);
  }

  componentDidMount() {
    AppState.addEventListener('change', this._handleAppStateChange);
    Notification.addListener('create_overlay_request',this, this._handleCreateRequest.bind(this))
    Notification.addListener('edit_overlay_request',this, this._handleEditRequest.bind(this))
    Notification.addListener('dupliate_overlay_request',this, this._handleDuplicateRequest.bind(this))
    Notification.addListener('delete_overlay_request',this, this._handleDeleteRequest.bind(this))
    Notification.addListener('reset_this_week_request',this, this._handleResetThisWeek.bind(this))
    Notification.addListener('import_from_prev_week_request',this, this._handleImportFromLastWeek.bind(this))
    // Notification.addListener('import_overlay_request',this, this._handleImportOverlayRequest.bind(this))
    Notification.addListener('prev_week_request',this, this._handleRequestPrevWeek.bind(this))
    Notification.addListener('next_week_request',this, this._handleRequestNextWeek.bind(this))
    Notification.addListener('this_week_request',this, this._handleRequestThisWeek.bind(this))
    
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this._handleAppStateChange);
    Notification.removeListener('create_overlay_request', this)
    Notification.removeListener('edit_overlay_request', this)
    Notification.removeListener('dupliate_overlay_request', this)
    Notification.removeListener('reset_this_week_request', this)
    Notification.removeListener('import_from_prev_week_request', this)
    // Notification.removeListener('import_overlay_request', this)
    Notification.removeListener('prev_week_request', this)
    Notification.removeListener('next_week_request', this)
    Notification.removeListener('this_week_request', this)
  }

  /*
   * Will implement next version
   */
  // _handleImportOverlayRequest() {
  //   this.setState({ showWeekSelector: true})
  // }

  _handleWeekSelectorRequest() {
    // 1. Present week selector modal
    // 2. Push Confirm(cancel) panel

    this.setState({ showWeekSelector: true})
  }

  _handleImportFromLastWeek = () => {
    let comp = this.state.week.weekId().split('_')
    let year = comp[0]
    let week_no = parseInt(comp[1]) - 1
    let aweekago = moment().year(year).isoWeek(week_no)
    let newWeek = new WeekModel(aweekago)
    newWeek.getData((data) => {
      console.log(data, 'prev week')
      data.week_id = this.state.week.weekId()
      this.state.week.setData(data, () => {
        this.forceUpdate()
        this.endColumn.panelController.popToRootPanel()
      })
    })
  }

  _handleResetThisWeek = () => {
    this.state.week.reset().then(() => {
      this.forceUpdate()
      this.endColumn.panelController.popToRootPanel()
    })
    
  }

  _handleDeleteRequest = (item) => {
    ItemManager.sharedInstance().lock()

    let endCol = this.endColumn
    let pc = endCol.panelController
    this.state.week.deleteToDoItem(item).then(() => {
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
    self.setState({ selectionMode: true, showCreateOverlay: false })
    
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
        self.state.week.addToDoItemsForCellIds(item, cell_ids).then(() => {
          pc.popToRootPanel()
          endCol.moreButtonFadeIn()
          ItemManager.sharedInstance().setSelectedItem(null)
          self.setState({ showCreateOverlay: false, selectionMode: false })
        })
        CellSelectionController.sharedInstance().reset()
      }

      duplicatePanel.onCancel = () => {
        ItemManager.sharedInstance().setSelectedItem(item)
        self.setState({ showCreateOverlay: false, selectionMode: false })
        CellSelectionController.sharedInstance().reset()
      }
    })
  }

  _handleEditRequest = (item) => {
    let self = this

    console.log('_handleEditRequest')

    // Show Create Modal
    self.setState({ showCreateOverlay: true, selectionMode: false })
    
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

        // self.setState( })

        ItemManager.sharedInstance().needUpdateSelectedItemLayout(item)

        self.state.week.updateToDoItem(item).then(() => {
          // ItemManager.sharedInstance().needUpdateSelectedItemLayout(item)

          self.setState({ showCreateOverlay: false, selectionMode: false },
          ()=> {
            ItemManager.sharedInstance().setSelectedItem(item)
          })
          // ItemManager.sharedInstance().needUpdateSelectedItem(item)

          // endCol.moreButtonFadeIn()
        }).catch((e) => {

        })

        

      }

      editPanel.onCancel = () => {
        // pc.popToRootPanel(() => {
          
        // })
        // endCol.moreButtonFadeIn()

        this.createModal.hideKeyBoard()
        setTimeout(()=>{
          ItemManager.sharedInstance().setSelectedItem(item)
          self.setState({ showCreateOverlay: false, selectionMode: false })
        }, 700)
      }
    })
  }

  _handleCreateRequest = () => {

    let self = this

    console.log('_handleCreateRequest')

    // Show Create Modal
    self.setState({ showCreateOverlay: true })

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
            self.state.week.addToDoItemsForCellIds(newItem, cell_ids).then(() => {
              pc.popToRootPanel(() => {
                
              })
              endCol.moreButtonFadeIn()
              ItemManager.sharedInstance().reset()
              self.setState({ showCreateOverlay: false, selectionMode: false })
              // self.forceUpdate()
            }).catch((e) => {

            })

            CellSelectionController.sharedInstance().reset()

          }

          selectPanel.onCancel = () => {
            pc.popToRootPanel()
            endCol.moreButtonFadeIn()
            self.setState({ showCreateOverlay: false, selectionMode: false })
            CellSelectionController.sharedInstance().reset()
          }
        })

        // Hide Close Overlay & Switch to cell select mode
        self.setState({ showCreateOverlay: false, selectionMode: true })

      }

      createPanel.onCancel = () => {

        this.createModal.hideKeyBoard()
        setTimeout(()=>{
          pc.popToRootPanel()
          endCol.moreButtonFadeIn()
          self.setState({ showCreateOverlay: false, selectionMode: false })
        }, 700)
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

  _handleRequestThisWeek() {
    let newWeek = new WeekModel()
    WeekManager.setCurrentWeek(newWeek)
    this.setState({
      week: newWeek
    })
  }

  _handleRequestPrevWeek() {
    let comp = this.state.week.weekId().split('_')
    let year = comp[0]
    let week_no = parseInt(comp[1]) - 1
    console.log(week_no, year, 'prev week no')
    let newWeek = new WeekModel(moment().year(year).isoWeek(week_no))
    WeekManager.setCurrentWeek(newWeek)
    this.setState({
      week: newWeek
    })
  }

  _handleRequestNextWeek() {
    let comp = this.state.week.weekId().split('_')
    let year = comp[0]
    let week_no = parseInt(comp[1]) + 1
    console.log(week_no, year, 'next week no')
    let newWeek = new WeekModel(moment().year(year).isoWeek(week_no))
    WeekManager.setCurrentWeek(newWeek)
    this.setState({
      week: newWeek
    })
  }

  render() {

    const { selectionMode, showCreateOverlay, showWeekSelector, visible } = this.state

    const week = this.state.week

    let iphoneX = isIphoneX()

    return (
      <View style={{flex: 1}}>
        <ImageBackground source={Platform.OS === 'ios' ? require('./images/3.png'): null} resizeMode={Platform.OS === 'ios' ? "repeat" : undefined} style={{flex: 1, flexDirection: 'row', backgroundColor: '#f6f8f1'}}>
          {function(){
            if (iphoneX) 
              return (<View style={{flex: 1}}></View>)
            else ''
          }()}
          <View style={{
            flex: _flex(1), 
            borderRightColor: '#666',
            borderRightWidth: 1,
            // zIndex: 100
          }}>
            <WeekHeader week={week} ref={(ref) => { this.state.weekHeader = ref }}/>
          </View>
          <View style={{
            flex: _flex(3), 
            borderRightColor: '#666',
            borderRightWidth: 1,
            flexDirection: 'column',
            // zIndex: 200
          }}>
          { /*!visible ? undefined : */selectionMode ?
            <SelectionColumn 
              column={0} 
              icon={(<Icon color="#333" size={20} name="weather-sunset"/>)}/> :
            (<TodoColumn
              ref={(ref) => { this.todoColumn1 = ref }}
              column={0} 
              icon={(<Icon color="#333" size={20} name="weather-sunset"/>)}
              week={week}
            />)}
            
          </View>
          <View style={{
            flex: _flex(3),
            borderRightColor: '#666',
            borderRightWidth: 1,
            // zIndex: 300
          }}>
          { /*!visible ? undefined : */selectionMode ?
            <SelectionColumn 
              column={1} 
              icon={(<Icon color="#333" size={20} name="weather-sunny"/>)}/> :
            (<TodoColumn
              ref={(ref) => { this.todoColumn2 = ref }}
              column={1} 
              icon={(<Icon color="#333" size={20} name="weather-sunny"/>)}
              week={week}
            />)}
          </View>
          <View style={{
            flex: _flex(3),
            borderRightColor: '#666',
            borderRightWidth: 5,
            // zIndex: 400
          }}>
          { /*!visible ? undefined : */selectionMode ?
            <SelectionColumn 
              column={2} 
              icon={(<Icon color="#333" size={20} name="weather-night"/>)}/> :
            (<TodoColumn
              ref={(ref) => { this.todoColumn3 = ref }}
              column={2} 
              icon={(<Icon color="#333" size={20} name="weather-night"/>)}
              week={week}
            />)}
          </View>
          <View style={{
            flex: _flex(2),
            // zIndex: 1000
          }}>
            <EndColumn week={week} ref={(ref) => { this.endColumn = ref }}/>
          </View>
          {function(){
            if (iphoneX) 
              return (<ImageBackground source={Platform.OS === 'ios' ? require('./images/3.png') : null} resizeMode={Platform.OS === 'ios' ? "repeat" : undefined} style={{flex:1, backgroundColor: '#eee'}}/>)
            else ''
          }()}
        </ImageBackground>
        
        {/* Overlays */}
        <Overlay pointerEvents="box-none" show={showCreateOverlay} delay={0}>
          <View pointerEvents="box-none" style={styles.createModal}>
            {showCreateOverlay ? <CreateModal item={ItemManager.sharedInstance().getSelectedItem()} ref={(ref) => {this.createModal = ref} } /> : undefined}
          </View>
        </Overlay>

        <Overlay pointerEvents="box-none" show={showWeekSelector} delay={0}>
          <View pointerEvents="box-none" style={styles.createModal}>
            {showWeekSelector ? <WeekSelectorModal currentWeekId={this.state.week.weekId()} ref={(ref) => {this.state.weekSelectorModal = ref} } /> : undefined}
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

