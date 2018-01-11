import React, { Component } from 'react';
import {
  View, Text, StyleSheet
} from 'react-native';

const styles = StyleSheet.create({
  text: {
    fontWeight: 'bold',
    fontFamily: 'courier',
    // borderWidth: 1,
    // borderColor: 'red'
  },
  view: {
    flex: 1,
    justifyContent: 'center'
  }
});

export default class WeekHeader extends Component {
  render() {
    return (
      <View style={{flex: 1, alignItems: 'center'}}>
        <View style={styles.view}><Text style={styles.text}></Text></View>
        <View style={styles.view}><Text style={styles.text}>mon</Text></View>
        <View style={styles.view}><Text style={styles.text}>tue</Text></View>
        <View style={styles.view}><Text style={styles.text}>wed</Text></View>
        <View style={styles.view}><Text style={styles.text}>thu</Text></View>
        <View style={styles.view}><Text style={styles.text}>fri</Text></View>
        <View style={styles.view}><Text style={styles.text}>sat</Text></View>
        <View style={styles.view}><Text style={styles.text}>sun</Text></View>
      </View>
    );
  }
}
