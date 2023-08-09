import { Injectable } from '@angular/core'
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { Subscription, of } from 'rxjs'
import { catchError } from 'rxjs/operators'
import * as dayjs from 'dayjs'

import { IScromData, Storage } from '../../../project/ws/viewer/src/lib/plugins/html/SCORMAdapter/storage'
import { errorCodes } from '../../../project/ws/viewer/src/lib/plugins/html/SCORMAdapter/errors'

import * as _ from 'lodash'

const API_END_POINTS = {
  CONTENT_STATE_READ: `/api/course/v1/content/state/read`,
  PROGRESS_UPDATE: '/apis/public/v8/mobileApp/v2/updateProgress',
}

@Injectable({
  providedIn: 'root',
})
export class MobileScromAdapterService {
  initialize = false
  id = ''
  scromSubscription: Subscription | null = null
  private _userData: {
    userId: string
    batchId: string
    courseId: string
    authorization: string
    userToken: string
  } = {
      userId: '',
      batchId: '',
      courseId: '',
      authorization: '',
      userToken: '',
    };
  constructor(
    private http: HttpClient,
    private store: Storage,

  ) { }
  set contentId(id: string) {
    this.store.key = id
    this.id = id
  }

  get contentId() {
    return this.id
  }
  setProperty(key: any, value: string) {
    this._userData[key] = value
  }

  getProperty(key: any): string {
    return this._userData[key]
  }
  setProperties(properties: any) {
    _.forEach(properties, (value, key) => {
      this.setProperty(key, value)
    })
  }
  LMSInitialize(): boolean {
    this.store.contentKey = this.contentId
    this.store.setItem('Initialized', true)
    return true
  }
  LMSFinish() {
    if (!this._isInitialized()) {
      this._setError(301)
      return false
    }
    let _return = this.LMSCommit()
    this.store.setItem('Initialized', false)
    this.store.clearAll()
    return _return
  }
  LMSGetValue(element: any) {
    if (!this._isInitialized()) {
      this._setError(301)
      return false
    }
    let value = _.get(this.store.getAll(), element)
    if (!value) {
      this._setError(201)
      return ''
    }
    return value
  }
  LMSSetValue(element: any, value: any) {
    if (!this._isInitialized()) {
      this._setError(301)
      return false
    }
    this.store.setItem(element, value)
    return this.store.getItem(element)
  }
  postCordovaMessage(data?: any) {
    const message = { action: 'close', percentage: data }

    if (!window.webkit || !window.webkit.messageHandlers || !window.webkit.messageHandlers.cordova_iab) {
      console.warn('Cordova IAB postMessage API not found!')
      throw new Error('Cordova IAB postMessage API not found!')
    } else {
      console.log('Message sent!', message);
      (window.webkit.messageHandlers.cordova_iab as any).postMessage(JSON.stringify(message))
    }
  }


  LMSCommit() {
    console.log("lms commit")
    let data = this.store.getAll()
    console.log(data)
    let _return = false
    if (data) {
      delete data['errors']
      if ((data["cmi.core.lesson_status"] === 'completed' || data["cmi.core.lesson_status"] === 'passed')) {
        this.scromSubscription = this.updateScromProgress(data).subscribe(async (response: any) => {
          console.log(response)
          let result = await response.result
          result["type"] = 'scorm'
          if (this.getPercentage(data) === 100) {
            setTimeout(() => {
              this.LMSFinish()
              this.postCordovaMessage(this.getPercentage(data))
            })
          }
          if (response) {
            _return = true
          }

        }, (error) => {
          if (error) {
            this._setError(101)
            // console.log(error)
          }
        })

        return _return
      }

    }
    return false
  }
  LMSGetLastError() {
    const newErrors = JSON.parse(this.store.getItem('errors') || '[]')
    if (newErrors && newErrors.length > 0) {
      return newErrors.pop()
    }
    return ""
  }
  LMSGetErrorString(errorCode: number) {
    let error = errorCodes[errorCode]
    if (!error) return ""
    return error[errorCode]["errorString"]
  }
  LMSGetDiagnostic(errorCode: number) {
    let error = errorCodes[errorCode]
    if (!error) return ""
    return error[errorCode]["diagnostic"]
  }
  _isInitialized() {
    let initialized = this.store.getItem('Initialized')
    return initialized
  }
  _setError(errorCode: number) {
    let errors = this.store.getItem('errors')
    if (!errors) errors = '[]'
    const newErrors = JSON.parse(errors)
    if (newErrors && typeof (newErrors) === 'object') {
      newErrors.push(errorCode)
    }
    this.store.setItem('errors', errors)
  }
  downladFile() {
    console.log('downladFile')
  }
  loadDataV2(req: any, data: any) {
    console.log('loadDataV2', req)
    req.request.fields = ['progressdetails']

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${data.Authorization}`,
      'X-authenticated-user-token': data.userToken,
      'Content-Type': 'application/json',
    })

    const url = `${API_END_POINTS.CONTENT_STATE_READ}`

    this.http.post(url, req, { headers }).pipe(
      catchError((error: any) => {
        console.error('Error occurred:', error)
        return of(null)
      })
    ).subscribe((responseData: any) => {
      // tslint:disable-next-line: no-console
      console.log(responseData)
      if (responseData && responseData.result && responseData.result.contentList.length) {
        for (const content of responseData.result.contentList) {
          if (content.contentId === this.contentId && content.progressdetails) {
            const data = content.progressdetails
            const loadDatas: IScromData = {
              "cmi.core.exit": data["cmi.core.exit"],
              "cmi.core.lesson_status": data["cmi.core.lesson_status"],
              "cmi.core.session_time": data["cmi.core.session_time"],
              "cmi.suspend_data": data["cmi.suspend_data"],
              "Initialized": data["Initialized"],
            }
            // tslint:disable-next-line: no-console
            console.log('loaded data', loadDatas)
            this.store.setAll(loadDatas)
          }
        }
      }
    })
  }

  getStatus(postData: any): number {
    console.log(postData["cmi.core.lesson_status"], 'getStatus', (postData["cmi.core.lesson_status"] === 'completed' || postData["cmi.core.lesson_status"] === 'passed'))
    try {
      if (postData["cmi.core.lesson_status"] === 'completed' || postData["cmi.core.lesson_status"] === 'passed') {
        return 2
      } else {
        return 1
      }
    } catch (e) {
      // tslint:disable-next-line: no-console
      console.log('Error in getting completion status', e)
      return 1
    }
  }
  getPercentage(postData: any): number {
    console.log(postData["cmi.core.lesson_status"], 'getpercentage', (postData["cmi.core.lesson_status"] === 'completed' || postData["cmi.core.lesson_status"] === 'passed'))
    try {
      if (postData["cmi.core.lesson_status"] === 'completed' || postData["cmi.core.lesson_status"] === 'passed') {
        return 100
      } else {
        return 0
      }
    } catch (e) {
      // tslint:disable-next-line: no-console
      console.log('Error in getting completion status', e)
      return 0
    }
  }

  updateScromProgress(postData: any) {
    let req: any
    if (postData && (postData["cmi.core.lesson_status"] === 'completed' || postData["cmi.core.lesson_status"] === 'passed')) {
      req = {
        request: {
          userId: this.getProperty('userId') || '',
          contents: [
            {
              contentId: this.getProperty('contentId'),
              batchId: this.getProperty('batchId') || '',
              courseId: this.getProperty('courseId') || '',
              status: this.getStatus(postData) || 2,
              lastAccessTime: dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss:SSSZZ'),
              progressdetails: postData,
              completionPercentage: this.getPercentage(postData) || 0
            },
          ],
        },
      }

    }
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.getProperty('authorization')}`,
      'X-authenticated-user-token': this.getProperty('userToken'),
      'Content-Type': 'application/json',
    })
    const options = {
      url: `${API_END_POINTS.PROGRESS_UPDATE}`,
      payload: req,
    }
    return this.http.post(options.url, options.payload, { headers })
  }
}
