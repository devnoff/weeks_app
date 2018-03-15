/**
 * Created by Robinson Park 
 * 2018.01.10
 * @flow
 */
import { isIphoneX } from 'react-native-iphone-x-helper'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import React, { Component } from 'react';
import {
  NativeModules, View, ImageBackground, StyleSheet, Platform, AppState, Text, StatusBar, Animated, LayoutAnimation
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
import NewWeekNoticeModal from './views/NewWeekNoticeModal'
import SettingsModal from './views/SettingsModal'
import ConfirmPanel from './views/ConfirmPanel'
import CellSelectionController from './controllers/CellSelectionController'
import ItemManager from './manager/item'
import _ from 'lodash'
import moment from 'moment'
import DataManager from './manager/data'
import strings from './i18n/localization'

console.log = ()=>{}

console.ignoredYellowBox = ['Remote debugger'];

function _flex(value) {
  return isIphoneX() ? value * 2 : value
}

const { UIManager } = NativeModules;

UIManager.setLayoutAnimationEnabledExperimental &&
  UIManager.setLayoutAnimationEnabledExperimental(true)

export default class App extends Component {

  constructor(props) {
    super(props)

    this.state = {
      appState: AppState.currentState,
      selectionMode: false,
      showCreateOverlay: false,
      showWeekSelector: false,
      showSettingModal: false,
      showNewWeekModal: false,
      week: null,
      selectedColumn: null,
      colflex0: 3,
      colflex1: 3,
      colflex2: 3,
      selectedRow: null
    }

  }

  loadInitialData() {
    let week = new WeekModel()

    WeekManager.setCurrentWeek(week)

    week.getData((data) => {
      var showNewWeekModal = false
      if (!data.displayed_new_week_notice)
        showNewWeekModal = true
      
      this.setState({
        week: week,
        showNewWeekModal: showNewWeekModal
      })
    })
  }

  componentWillMount() {
    StatusBar.setHidden(true);

    this.loadInitialData()
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

  _handleImportFromLastWeek = (callback) => {
    let comp = this.state.week.weekId().split('_')
    let year = comp[0]
    let week_no = parseInt(comp[1]) - 1
    let aweekago = moment().year(year).isoWeek(week_no)
    let newWeek = new WeekModel(aweekago)
    newWeek.getData((data) => {
      // console.log(data, 'prev week')
      data.week_id = this.state.week.weekId()
      this.state.week.setData(data, () => {
        this.forceUpdate()
        if (this.endColumn)
          this.endColumn.panelController.popToRootPanel(()=>{})

        if (callback) callback()
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

    // console.log('_handleDuplicateRequest')

    // Show Create Modal
    self.setState({ selectionMode: true, showCreateOverlay: false })
    
    let endCol = self.endColumn
    let pc = endCol.panelController
    pc.push({ 
      ref: 'duplicatePanel',
       el: <ConfirmPanel
            key='duplicatePanel'
            ref={comp => pc.refs['duplicatePanel'] = comp}
            confirmText={strings.done}
            cancelText={strings.cancel}
            message={strings.duplicate_desc}
            enableConfirmButton={false}
            />
    }, () => { // Fires after present create panel
      endCol.moreButtonFadeOut()
    }, (duplicatePanel) => { // Injector

      // For Cell Select Mode Validation
      CellSelectionController.sharedInstance().addListener('change', duplicatePanel, (selectedCells) => {
        // console.log(`selected cells : ${selectedCells.length}`)
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

    // console.log('_handleEditRequest')

    // Show Create Modal
    self.setState({ showCreateOverlay: true, selectionMode: false })
    
    let endCol = self.endColumn
    let pc = endCol.panelController
    pc.push({ 
      ref: 'editPanel',
       el: <ConfirmPanel
            key='editPanel'
            ref={comp => pc.refs['editPanel'] = comp}
            confirmText={strings.done}
            cancelText={strings.cancel}
            message={strings.edit_desc}
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
        }, 400)
      }
    })
  }

  _handleCreateRequest = () => {

    let self = this

    // console.log('_handleCreateRequest')

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
            confirmText={strings.next}
            cancelText={strings.cancel}
            message={strings.create_desc}
            enableConfirmButton={false}
            />
    }, () => { // Fires after present create panel
      endCol.moreButtonFadeOut()
    }, (createPanel) => { // Injector

      // For Create Modal Title Text Input Validation
      Notification.addListener('title_text_input_change', createPanel, (text) => {
        // console.log(`received text: ${text}`)
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
                confirmText={strings.done}
                cancelText={strings.cancel}
                message={strings.duplicate_desc}
                enableConfirmButton={false}
                />
        }, () => { // Fires after present select panel
          
        }, (selectPanel) => { // Injector

          // For Cell Select Mode Validation
          CellSelectionController.sharedInstance().addListener('change', selectPanel, (selectedCells) => {
            // console.log(`selected cells : ${selectedCells.length}`)
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
        }, 400)
      }
    })
  }

  _handleAppStateChange = (nextAppState) => {
    if (this.state.appState.match(/background/) && nextAppState === 'active') {
      console.log('App has come to the foreground!')

      // 오늘 날짜를 기준으로 WeekModel 불러옴
      // 현재 

      let curr_week = this.state.week
      if (curr_week && !curr_week.isThisWeek()) {
        let week = new WeekModel()
        week.getData((data) => {
          var showNewWeekModal = false
          if (!data.displayed_new_week_notice) {
            WeekManager.setCurrentWeek(week)
            showNewWeekModal = true
            this.setState({
              week: week,
              showNewWeekModal: showNewWeekModal
            })
          }
        }) 
      }
    }
    this.setState({appState: nextAppState})
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

  _onPressColumnHeader(column) {

    var c = null
    if (this.state.selectedColumn != column) {
      c = column
    }

    var f0, f1, f2
    switch(c) {
      case 0: f0 = 5, f1 = 2, f2 = 2
      break
      case 1: f0 = 2, f1 = 5, f2 = 2
      break
      case 2: f0 = 2, f1 = 2, f2 = 5
      break
      default:
        f0 = 3, f1 = 3, f2 = 3
    }
    LayoutAnimation.easeInEaseOut()
    
    this.setState({
      selectedColumn: c,
      colflex0: f0,
      colflex1: f1,
      colflex2: f2
    })
  }

  _onStartNewWeekWithImporting(importing) {
    if (importing)
      this._handleImportFromLastWeek(() => {
        this.state.week.setPropertyValue('displayed_new_week_notice', true).then(()=>{
          this.setState({
            showNewWeekModal: false
          })
        })
      })
    else 
      this.state.week.setPropertyValue('displayed_new_week_notice', true).then(()=>{
        this.setState({
          showNewWeekModal: false
        })
      })
  }

  render() {

    const { 
      selectionMode, 
      showCreateOverlay, 
      showWeekSelector, 
      showSettingModal,
      showNewWeekModal,
      visible, 
      selectedColumn,
      colflex0,
      colflex1,
      colflex2,
      week,
      selectedRow
    } = this.state
    // console.log(colflex0, colflex1, colflex2)

    let iphoneX = isIphoneX()

    if (!week) {
      return <View style={{flex: 1, backgroundColor: '#f6f8f1'}}></View>
    }

    if (showNewWeekModal)
      return  <NewWeekNoticeModal 
        onStart={this._onStartNewWeekWithImporting.bind(this)}
        visible={showNewWeekModal}
        animationType="fade"
        supportedOrientations={['landscape']} />
    else 
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
              zIndex: 100
            }}>
              <WeekHeader 
                week={week} 
                ref={(ref) => { this.state.weekHeader = ref }}
                onPressSetting={()=>{this.setState({showSettingModal: true})}}
                onSelectedRow={(day)=>{
                  this.setState({
                    selectedRow: day
                  })
                }}
                selectionMode={selectionMode}
              />
            </View>
            <View style={[{
              flex: _flex(colflex0),
              borderRightColor: '#666',
              borderRightWidth: 1,
              flexDirection: 'column',
              // zIndex: 200
            }, (selectedColumn == 0 ? {backgroundColor:'#b6baae22'} : undefined)]}>
            { /*!visible ? undefined : */selectionMode ?
              <SelectionColumn 
                column={0} 
                icon={(<Icon color="#333" size={20} name="weather-sunset"/>)}/> :
              (<TodoColumn
                ref={(ref) => { this.todoColumn1 = ref }}
                column={0} 
                icon={(<Icon color="#333" size={20} name="weather-sunset"/>)}
                week={week}
                onPressHeader={this._onPressColumnHeader.bind(this, 0)}
                selectedRow={selectedRow}
              />)}
              
            </View>
            <View style={[{
              flex: _flex(colflex1),
              borderRightColor: '#666',
              borderRightWidth: 1,
            }, (selectedColumn == 1 ? {backgroundColor:'#b6baae22'} : undefined)]}>
            { /*!visible ? undefined : */selectionMode ?
              <SelectionColumn 
                column={1} 
                icon={(<Icon color="#333" size={20} name="weather-sunny"/>)}/> :
              (<TodoColumn
                ref={(ref) => { this.todoColumn2 = ref }}
                column={1} 
                icon={(<Icon color="#333" size={20} name="weather-sunny"/>)}
                week={week}
                onPressHeader={this._onPressColumnHeader.bind(this, 1)}
                selectedRow={selectedRow}
              />)}
            </View>
            <View style={[{
              flex: _flex(colflex2),
              borderRightColor: '#666',
              borderRightWidth: 5
            },(selectedColumn == 2 ? {backgroundColor:'#b6baae22'} : undefined)]}>
            { /*!visible ? undefined : */selectionMode ?
              <SelectionColumn 
                column={2} 
                icon={(<Icon color="#333" size={20} name="weather-night"/>)}/> :
              (<TodoColumn
                ref={(ref) => { this.todoColumn3 = ref }}
                column={2} 
                icon={(<Icon color="#333" size={20} name="weather-night"/>)}
                week={week}
                onPressHeader={this._onPressColumnHeader.bind(this, 2)}
                selectedRow={selectedRow}
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

          {showSettingModal ? <SettingsModal 
              visible={showSettingModal}
              animationType={'slide'}
              onRequestClose={() => {this.setState({showSettingModal:false})}}
              supportedOrientations={['landscape']} /> : undefined}
          
          {showNewWeekModal ? <NewWeekNoticeModal 
              onStart={this._onStartNewWeekWithImporting.bind(this)}
              visible={showNewWeekModal}
              animationType="fade"
              supportedOrientations={['landscape']} /> : undefined}
        </View>
      )
  }
}


const styles = StyleSheet.create({
  createModal: {
    flex: 1
  }
})

