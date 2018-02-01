import { AsyncStorage } from 'react-native'

export default class DataManager {

  static async getWeekDataForKey(key) {
    return new Promise(async (resolve, reject) => {
      let k = 'week_' + key
      try {
        let value = await AsyncStorage.getItem(k)
        resolve(JSON.parse(value))
      }
      catch (e) {
        reject(e)
      }
    })
  }

  static async setWeekDataForKey(key, data) {
    return new Promise(async (resolve, reject) => {
      let k = 'week_' + key
      try {
        await AsyncStorage.setItem(k, JSON.stringify(data))
        resolve()
      } catch (e) {
        reject(e)
      }
    })
  }



}