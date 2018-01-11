/**
 * Created by Robinson Park 
 * 2018.01.10
 * @flow
 */
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import React, { Component } from 'react';
import {
  View, SafeAreaView
} from 'react-native';
import WeekHeader from './views/WeekHeader'
import TodoColumn from './views/TodoColumn'

export default class App extends Component<{}> {
  render() {
    return (
      <SafeAreaView style={{flex: 1, flexDirection: 'row', backgroundColor: 'white'}}>
        <View style={{
          flex: 1, 
          borderRightColor: '#ddd',
          borderRightWidth: 1
        }}>
          <WeekHeader />
        </View>
        <View style={{
          flex: 3, 
          borderRightColor: '#ddd',
          borderRightWidth: 1.2,
          flexDirection: 'column'
        }}>
          <TodoColumn icon={(<Icon size={20} name="weather-sunset"/>)}/>
        </View>
        <View style={{
          flex: 3,
          borderRightColor: '#ddd',
          borderRightWidth: 1
        }}>
          <TodoColumn icon={(<Icon size={20} name="weather-sunny"/>)}/>
        </View>
        <View style={{
          flex: 3,
          borderRightColor: '#ddd',
          borderRightWidth: 1
        }}>
          <TodoColumn icon={(<Icon size={20} name="weather-night"/>)}/>
        </View>
        <View style={{
          flex: 2,
        }}>
        </View>
      </SafeAreaView>
    );
  }
}

