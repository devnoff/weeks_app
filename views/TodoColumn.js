import React, { Component } from 'react';
import {
  View, StyleSheet, VirtualizedList, Text
} from 'react-native';

const styles = StyleSheet.create({
  todoCell: {
    flex: 1,
    borderColor: 'white',
    borderWidth: 1
  },
  headerCell: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  item: {
    backgroundColor: 'white',
    borderRadius: 10,
    borderColor: 'black',
    borderWidth: 1,
    marginTop: 8,
    marginBottom: 8,
    marginLeft: 8,
    minWidth: 30,
    justifyContent: 'center',
    alignItems: 'center'
  },
  itemText: {
    color: 'black',
    fontSize: 15
  }
})


export default class TodoColumn extends Component {

  constructor(props) {
    super(props)
  }

  render() {
    const { icon } = this.props

    return (
      <View style={{flex: 1, flexDirection: 'column'}}>
        <View style={styles.headerCell}>{icon}</View>
        <View style={styles.todoCell}>
          <VirtualizedList
            data={[]}
            horizontal={true}
            initialNumberToRender={20}
            windowSize={21}
            getItemCount={(data) => 365}
            getItem={(data, index) => {
              return { key: index };
            }}
            keyExtractor={(item, index) => {
              return item.key;
            }}
            renderItem={({ item, index }) => {
              return (
                <View style={styles.item}>
                  <Text style={styles.itemText}>{item.key}</Text>
                </View>
              );
            }}
          />
        </View>
        <View style={styles.todoCell}></View>
        <View style={styles.todoCell}></View>
        <View style={styles.todoCell}></View>
        <View style={styles.todoCell}></View>
        <View style={styles.todoCell}></View>
        <View style={styles.todoCell}></View>
      </View>
    );
  }
}
