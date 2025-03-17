import { Injectable } from '@angular/core'
import {
  ConfigurationsService,
} from '@ws-widget/utils'

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  numberOfNotificatios = 0;

  constructor(public configSvc: ConfigurationsService) { }

  async setLocalStorage(key: string, value: any): Promise<void> {
    try {
      if (this.configSvc.userProfile) {
        const userId = this.configSvc.userProfile.userId
        key = userId + key
      }
      localStorage.setItem(key, JSON.stringify(value))
      console.log("yes set", key, value)
    } catch (error) {
      console.error('Error setting storage', error)
      throw error
    }
  }

  async getLocalStorage(key: string): Promise<any> {
    try {
      if (this.configSvc.userProfile) {
        const userId = this.configSvc.userProfile.userId
        key = userId + key
      }
      const item = localStorage.getItem(key)

      // const { value } = await Storage.get({ key })
      return item ? JSON.parse(item) : null
    } catch (error) {
      console.error('Error getting storage', error)
      throw error
    }
  }

  async deleteAllStorage(): Promise<void> {
    try {
      localStorage.clear()
      // await Storage.clear()
    } catch (error) {
      console.error('Error clearing storage', error)
      throw error
    }
  }

  async deleteOneStorage(key: string): Promise<void> {
    try {
      if (this.configSvc.userProfile) {
        const userId = this.configSvc.userProfile.userId
        key = userId + key
      }
      localStorage.removeItem(key)
      // await Storage.remove({ key })
    } catch (error) {
      console.error('Error deleting storage item', error)
      throw error
    }
  }

  async hasKey(key: string): Promise<boolean> {
    try {
      if (this.configSvc.userProfile) {
        const userId = this.configSvc.userProfile.userId
        key = userId + key
      }
      const item = localStorage.getItem(key)
      const keys = item ? Object.keys(JSON.parse(item)) : []
      // const { keys } = await Storage.keys()
      return keys.includes(key)
    } catch (error) {
      console.error('Error checking key', error)
      throw error
    }
  }
  getNumberOfNotifications() {
    return this.numberOfNotificatios
  }

  setNumberOfNotifications(number) {
    this.numberOfNotificatios = number
  }
}
