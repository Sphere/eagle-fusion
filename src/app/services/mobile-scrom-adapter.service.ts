import { Injectable } from '@angular/core'
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { Subscription, of } from 'rxjs'
import { catchError } from 'rxjs/operators'
import dayjs from 'dayjs'

import { IScromData, Storage } from '../../../project/ws/viewer/src/lib/plugins/html/SCORMAdapter/storage'
import { errorCodes } from '../../../project/ws/viewer/src/lib/plugins/html/SCORMAdapter/errors'

import * as _ from 'lodash'
import { TelemetryService } from '../../../library/ws-widget/utils/src/lib/services/telemetry.service'
import { ActivatedRoute } from '@angular/router'
import { UserAgentResolverService } from 'src/app/services/user-agent.service'
import { LoggerService } from '../../../library/ws-widget/utils/src/public-api'

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
    private telemetrySvc: TelemetryService,
    public route: ActivatedRoute,
    private UserAgentResolverService: UserAgentResolverService,
    private logger: LoggerService
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
      this.logger.warn('Cordova IAB postMessage API not found!')
      throw new Error('Cordova IAB postMessage API not found!')
    } else {
      this.logger.log('Message sent!', message);
      (window.webkit.messageHandlers.cordova_iab as any).postMessage(JSON.stringify(message))
    }
  }


  LMSCommit() {
    this.logger.log("lms commit")
    const data = this.store.getAll()
    this.logger.log(data)
    if (!data) {
      return false
    }
    delete data['errors']
    if (data["cmi.core.lesson_status"] === 'incomplete') {
      const paramMap = this.route.snapshot.queryParamMap
      const params: any = {}
      paramMap.keys.forEach((key: string) => {
        const lowerKey = key.toLowerCase()
        if (lowerKey !== 'authorization' && lowerKey !== 'usertoken') {
          params[key] = paramMap.get(key)
        }
      })
      const paramsJSON = JSON.stringify(params)
      const userAgent = this.UserAgentResolverService.getUserAgent()
      const rollup = { l1: this.getProperty('courseId') || "", l2: this.getProperty('contentId') || '' }
      const startEparams = {
        type: 'scorm',
        mode: 'scorm-start',
        pageid: 'player',
        duration: 0,
      }
      const user = {
        id: this.getProperty('userId')
      }
      this.telemetrySvc.
        paramTriggerStart(paramsJSON, userAgent.browserName, userAgent.OS, startEparams, user, rollup)

      if (data) {
        const endEparams = {
          type: 'scorm',
          mode: 'scorm-close',
          pageid: 'player',
          duration: this.convertDurationToEpoch(data["cmi.core.session_time"]),
        }
        this.telemetrySvc.
          paramTriggerEnd(paramsJSON, userAgent.browserName, userAgent.OS, endEparams, user, rollup)
      }
    }
    if (data["cmi.core.lesson_status"] === 'completed' || data["cmi.core.lesson_status"] === 'passed') {
      this.scromSubscription = this.updateScromProgress(data).subscribe(
        async (response: any) => {
          this.logger.log(response)
          const paramMap = this.route.snapshot.queryParamMap
          const params: any = {}
          paramMap.keys.forEach((key: string) => {
            const lowerKey = key.toLowerCase()
            if (lowerKey !== 'authorization' && lowerKey !== 'usertoken') {
              params[key] = paramMap.get(key)
            }
          })
          const paramsJSON = JSON.stringify(params)
          const userAgent = this.UserAgentResolverService.getUserAgent()
          const rollup = { l1: this.getProperty('courseId') || '', l2: this.getProperty('contentId') || '' }
          const startEparams = {
            type: 'scorm',
            mode: 'scorm-start',
            pageid: 'player',
            duration: 0,
          }
          const user = {
            id: this.getProperty('userId')
          }
          this.telemetrySvc.
            paramTriggerStart(paramsJSON, userAgent.browserName, userAgent.OS, startEparams, user, rollup)

          if (data) {
            const endEparams = {
              type: 'scorm',
              mode: 'scorm-close',
              pageid: 'player',
              duration: this.convertDurationToEpoch(data["cmi.core.session_time"]),
            }
            this.telemetrySvc.
              paramTriggerEnd(paramsJSON, userAgent.browserName, userAgent.OS, endEparams, user, rollup)
          }
          const result = await response.result
          result["type"] = 'scorm'
          if (this.getPercentage(data) === 100) {
            setTimeout(() => {
              this.LMSFinish()
            })
            setTimeout(() => {
              this.postCordovaMessage(this.getPercentage(data))
            }, 6000)
          }
          return !!response
        },
        (error) => {
          if (error) {
            this._setError(101)
            // this.logger.log(error)
          }
        }
      )
      return false
    } else {
      this.updateScromProgress(data).subscribe((res) => {
        this.logger.log(res)
      })
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
    this.logger.log('downladFile')
  }
  loadDataV2(req: any, data: any) {
    this.logger.log('loadDataV2', req)
    req.request.fields = ['progressdetails']

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${data.Authorization}`,
      'X-authenticated-user-token': data.userToken,
      'Content-Type': 'application/json',
    })

    const url = `${API_END_POINTS.CONTENT_STATE_READ}`

    this.http.post(url, req, { headers }).pipe(
      catchError((error: any) => {
        this.logger.error('Error occurred:', error)
        return of(null)
      })
    ).subscribe((responseData: any) => {
      // tslint:disable-next-line: no-console
      this.logger.log(responseData)
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
            this.logger.log('loaded data', loadDatas)
            this.store.setAll(loadDatas)
          } else {
            this.initzeroProgress()
          }
        }
      }
    })
  }

  getStatus(postData: any): number {
    this.logger.log(postData["cmi.core.lesson_status"], 'getStatus', (postData["cmi.core.lesson_status"] === 'completed' || postData["cmi.core.lesson_status"] === 'passed'))
    try {
      if (postData["cmi.core.lesson_status"] === 'completed' || postData["cmi.core.lesson_status"] === 'passed') {
        return 2
      } else {
        return 1
      }
    } catch (e) {
      // tslint:disable-next-line: no-console
      this.logger.log('Error in getting completion status', e)
      return 1
    }
  }
  getPercentage(postData: any): number {
    this.logger.log(postData["cmi.core.lesson_status"], 'getpercentage', (postData["cmi.core.lesson_status"] === 'completed' || postData["cmi.core.lesson_status"] === 'passed'))
    try {
      if (postData["cmi.core.lesson_status"] === 'completed' || postData["cmi.core.lesson_status"] === 'passed') {
        return 100
      } else {
        return 0
      }
    } catch (e) {
      // tslint:disable-next-line: no-console
      this.logger.log('Error in getting completion status', e)
      return 0
    }
  }

  updateScromProgress(postData: any) {
    let req: any
    if (postData && (postData["cmi.core.lesson_status"] === 'completed' ||
      postData["cmi.core.lesson_status"] === 'passed' || postData["cmi.core.lesson_status"] === 'incomplete')) {
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

  initzeroProgress() {

    let req: any
    req = {
      request: {
        userId: this.getProperty('userId') || '',
        contents: [
          {
            contentId: this.getProperty('contentId'),
            batchId: this.getProperty('batchId') || '',
            courseId: this.getProperty('courseId') || '',
            status: 1,
            lastAccessTime: dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss:SSSZZ'),
            progressdetails: null,
            completionPercentage: 0
          },
        ],
      },
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

  convertDurationToEpoch(duration: any): number {
    // Split HH:MM:SS.ms
    const [hours, minutes, seconds, ms] = duration.split(/[:.]/).map(Number)
    // Convert to seconds
    const durationSeconds = hours * 3600 + minutes * 60 + seconds + ms / 1000
    const currentEpochFloat = Date.now() / 1000
    return currentEpochFloat + durationSeconds
  }
}
