/* tslint:disable */
import { Injectable } from '@angular/core'
// import _ from 'lodash'
@Injectable({
  providedIn: 'root',
})

export class Storage {
  key = 'scormData'
  constructor() {

  }
  set contentKey(key: string) {
    this.key = key
  }

  get contentKey() {
    return this.key
  }
  setItem(element: any, value: any) {
    const item = window.localStorage.getItem(this.contentKey)
    if (!item) {
      window.localStorage.setItem(this.contentKey, '{}')
    }
    const getItem = window.localStorage.getItem(this.contentKey)
    if (getItem) {
      const itemParsed = JSON.parse(getItem)
      if (itemParsed) {
        // itemParsed[element] = JSON.parse(value)
        itemParsed[element] = value
        // _.set(itemParsed,'element',value);
        // console.log("return Item=> stringfy", JSON.stringify(itemParsed))
        window.localStorage.setItem(this.contentKey, JSON.stringify(itemParsed))
      }
    }

  }

  getItem(element: any): string | null {
    let item = window.localStorage.getItem(this.contentKey)
    if (!item) {
      return null
    }
    let newItem = JSON.parse(item)
    if (newItem) {
      return newItem[element]

    }
    return null
  }

  getAll(): IScromData | null {
    let item = window.localStorage.getItem(this.contentKey)
    if (!item) {
      return null
    }
    let newItem = JSON.parse(item)
    // console.log("GET ALL", item)
    return newItem || null
  }

  setAll(data: IScromData) {
    if (data) {
      window.localStorage.setItem(this.contentKey, JSON.stringify(data))
    }
  }

  clearAll() {
    window.localStorage.removeItem(this.contentKey)
  }
}



export interface IScromData {
  Initialized?: boolean
  "cmi.core.exit"?: string
  "cmi.core.lesson_status"?: string
  "cmi.core.session_time"?: string
  "cmi.suspend_data"?: string
  errors?: string

}