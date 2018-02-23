import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { isIphoneX } from 'react-native-iphone-x-helper'
import React, { Component } from 'react';
import {
Modal, View, Text, StyleSheet, Button, TouchableOpacity, TextInput, Colors,
ImageBackground, Platform, TouchableWithoutFeedback, SectionList, ListView, FlatList
} from 'react-native';
import FadeItem from './FadeItem'
import Notification from '../manager/notification';
import moment from 'moment'
import OnLayout from 'react-native-on-layout'
import _ from 'lodash'

moment.locale('ko')

const ITEM_HEIGHT = 70

export default class WeekSelectorModal extends Component {

  itemsPerRow = 5

  constructor(props) {
    super(props)
    // 데이터 - 현재년 전후 2년씩 
    let today = moment()
    let year = today.year()
    let years = [
      year - 2,
      year - 1,
      year,
      year + 1,
      year + 2
    ]

    var dataIds = []
    var data = []
    for (let y of years) {
      let d = moment().year(y)
      let weeks = d.isoWeeksInYear()
      // data[y] = weekData = []
      // let weekData = []
      data.push({key: y.toString(), type: 'year', data: y})
      for (var w = 1; w < weeks + 1; w++) {
        let week = d.clone().isoWeek(w)
        let start_date = week.clone().startOf('isoWeek').format('DD MMM \'YY')
        let end_date = week.clone().endOf('isoWeek').format('DD MMM \'YY')
        data.push({
          key: `${y}_${w}`,
          type: 'week',
          data: {
            year: y,
            week_no: w,
            start_date,
            end_date
          }
        })
        dataIds.push(`${y}-${w}`)
      }
    }

    console.log(data, 'week selector data')

    this.state = {
      show: false,
      currentWeekId: props.currentWeekId,
      data: data
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.show == true) {
      this.show()
    } else if (nextProps.show == false) {
      this.hide()
    }

    if (nextProps.hasOwnProperty('currentWeekId')) {
      this.setState({
        currentWeekId: nextProps.currentWeekId
      })
    }
  }

  show() {
    this.setState({show: true})
  }

  hide() {
    this.setState({show: false})
  }

  componentDidMount() {
    this.show()

    setTimeout(() => {
      const { data, currentWeekId } = this.state
      let index = _.findIndex(data, {key: currentWeekId})
      if (this._list && index > -1) {
        console.log(index, 'index')
        let offset = (index * ITEM_HEIGHT / 5) - ITEM_HEIGHT
        // this._list.scrollToIndex({index, animated: true, viewPosition: 0.5})
        this._list.scrollToOffset({offset, animated: true})
      }
    }, 500)
  }

  componentWillReceiveProps(nextProps) {
    this.setState(nextProps)
  }

  componentDidUpdate() {
      
  }

  render() {
    const { show, data, currentWeekId } = this.state

    const columns = 5
    return (
      <OnLayout pointerEvents="box-none" style={styles.view}>
        {({ width, height}) => {

          if (width < 1) return undefined
          

          return (
            <ImageBackground source={Platform.OS === 'ios' ? require('../images/3.png'): null} resizeMode={Platform.OS === 'ios' ? "repeat" : 'none'} style={{backgroundColor: '#f6f8f1'}}>
              <FlatList 
                ref={(ref) => { this._list = ref }}
                data={data}
                numColumns={columns}
                contentContainerStyle={{
                  // alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  flexDirection: 'column',
                  overflow: 'hidden'
                }}
                getItemLayout={(data, index) => (
                  {length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index}
                )}
                renderItem={(data) => {
                  var item = data.item
                  if (item.type == 'year')
                    return (
                      <View key={item.key} style={[{width: width/columns}, styles.yearBox]}>
                        <View style={styles.yearView}>
                          <Text style={styles.yearText}>{item.key}</Text>
                        </View>
                      </View>
                    )
                  else 
                    return (
                      <View key={item.key} style={[{width: width/columns}, styles.weekBox]}>
                        <View style={[styles.weekView, currentWeekId == item.key ? styles.weekViewSelected : undefined]}>
                          <Text style={styles.weekTitle}>{`#${item.data.week_no}`}</Text>
                          <Text style={styles.weekDesc}>{`${item.data.start_date} \n~ ${item.data.end_date}`}</Text>
                        </View>
                      </View>)
                    
                }}
              />
            </ImageBackground>
            )
        }}
        </OnLayout>
    )
  }
}


const styles = StyleSheet.create({
  view: {
    backgroundColor: '#f6f8f1',
  },
  yearBox: {
    minHeight: ITEM_HEIGHT,
    padding: 5,
  },
  yearView: {
    flex: 1,
    backgroundColor: 'black',
    alignItems: 'center',
    justifyContent: 'center'
  },
  weekBox: {
    minHeight: ITEM_HEIGHT,
    padding: 5,
  },
  yearText: {
    fontWeight: 'bold',
    fontFamily: 'courier',
    fontSize: 18,
    color: '#fff'
  },
  weekView: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekViewSelected: {
    borderWidth: 1
  },
  weekTitle: {
    fontWeight: 'bold',
    fontFamily: 'courier',
    fontSize: 18
  },
  weekDesc: {
    fontSize: 9,
    color: '#aaa'
  },
})