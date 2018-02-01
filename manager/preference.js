import { AsyncStorage } from 'react-native'

export default {
  getDoneItemStyle: async () => {
    return new Promise(async (resolve, reject) => {
      let key = 'preference.doneItemStyle'
      try {
        let value = await AsyncStorage.getItem(key)
        resolve(value)
      }
      catch (e) {
        reject(e)
      }
    })
  },
  setDoneItemStyle: async (doneItemStyle) => {
    return new Promise(async (resolve, reject) => {
      let key = 'preference.doneItemStyle'
      try {
        await AsyncStorage.setItem(key, doneItemStyle)
        resolve()
      } catch (e) {
        reject(e)
      }
    })
  },
  getTitleShortenRule: async () => {
    return new Promise(async (resolve, reject) => {
      let key = 'preference.titleShortenRule'
      try {
        let value = await AsyncStorage.getItem(key)
        resolve(value)
      }
      catch (e) {
        reject(e)
      }
    })
  },
  setTitleShortenRule: async (titleShortenRule) => {
    return new Promise(async (resolve, reject) => {
      let key = 'preference.titleShortenRule'
      try {
        await AsyncStorage.setItem(key, titleShortenRule)
        resolve()
      } catch (e) {
        reject(e)
      }
    }) 
  }
}