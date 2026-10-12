import { Injectable } from '@angular/core'
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { Subscription, of } from 'rxjs'
import { catchError, tap } from 'rxjs/operators'
import dayjs from 'dayjs'

import { IScromData, Storage } from '../../../project/ws/viewer/src/lib/plugins/html/SCORMAdapter/storage'
import { errorCodes } from '../../../project/ws/viewer/src/lib/plugins/html/SCORMAdapter/errors'

import * as _ from 'lodash'
import { TelemetryService } from '../../../library/ws-widget/utils/src/lib/services/telemetry.service'
import { ActivatedRoute } from '@angular/router'
import { UserAgentResolverService } from 'src/app/services/user-agent.service'
import { LoggerService } from '../../../library/ws-widget/utils/src/public-api'
import { API_END_POINTS } from '../constants/apiConstants'

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
    }
  constructor(
    private readonly http: HttpClient,
    private readonly store: Storage,
    private readonly telemetrySvc: TelemetryService,
    public route: ActivatedRoute,
    private readonly UserAgentResolverService: UserAgentResolverService,
    private readonly logger: LoggerService
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
    const _return = this.LMSCommit()
    this.store.setItem('Initialized', false)
    this.store.clearAll()
    return _return
  }
  LMSGetValue(element: any) {
    if (!this._isInitialized()) {
      this._setError(301)
      return false
    }
    const value = _.get(this.store.getAll(), element)
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
    this.logger.log('lms commit')
    const data = this.store.getAll()
    this.logger.log(data)
    if (!data) {
      return false
    }
    delete data['errors']
    const lessonStatus = data['cmi.core.lesson_status']
    const paramsJSON = this.extractQueryParams()

    if (lessonStatus === 'incomplete') {
      this.triggerTelemetryEvents(data, paramsJSON)
    } else if (this.isLessonCompleted(lessonStatus)) {
      this.handleCompletedStatus(data, paramsJSON)
    } else {
      this.updateScromProgress(data).subscribe(res => {
        this.logger.log(res)
      })
    }
    return true
  }

  private extractQueryParams(): string {
    const paramMap = this.route.snapshot.queryParamMap
    const params: any = {}
    paramMap.keys.forEach((key: string) => {
      const lowerKey = key.toLowerCase()
      if (lowerKey !== 'authorization' && lowerKey !== 'usertoken') {
        params[key] = paramMap.get(key)
      }
    })
    return JSON.stringify(params)
  }

  private getTelemetryData() {
    const userAgent = this.UserAgentResolverService.getUserAgent()
    const rollup = { l1: this.getProperty('courseId') || '', l2: this.getProperty('contentId') || '' }
    const user = { id: this.getProperty('userId') }
    return { userAgent, rollup, user }
  }

  private triggerTelemetryEvents(data: any, paramsJSON: string): void {
    const { userAgent, rollup, user } = this.getTelemetryData()
    const startParams = {
      type: 'scorm',
      mode: 'scorm-start',
      pageid: 'player',
      duration: 0,
    }
    this.telemetrySvc.paramTriggerStart(paramsJSON, userAgent.browserName, userAgent.OS, startParams, user, rollup)

    const endParams = {
      type: 'scorm',
      mode: 'scorm-close',
      pageid: 'player',
      duration: this.convertDurationToEpoch(data['cmi.core.session_time']),
    }
    this.telemetrySvc.paramTriggerEnd(paramsJSON, userAgent.browserName, userAgent.OS, endParams, user, rollup)
  }

  private isLessonCompleted(status: string): boolean {
    return status === 'completed' || status === 'passed'
  }

  private handleCompletedStatus(data: any, paramsJSON: string): void {
    this.scromSubscription = this.updateScromProgress(data).subscribe({
      next: (response: any) => {
        this.logger.log(response)
        this.triggerTelemetryEvents(data, paramsJSON)
        const result = response.result
        result['type'] = 'scorm'
        if (this.getPercentage(data) === 100) {
          setTimeout(() => {
            this.LMSFinish()
          })
          setTimeout(() => {
            this.postCordovaMessage(this.getPercentage(data))
          }, 6000)
        }
      },
      error: error => {
        if (error) {
          this._setError(101)
        }
      },
    })
  }

  LMSGetLastError() {
    const newErrors = JSON.parse(this.store.getItem('errors') || '[]')
    if (newErrors && newErrors.length > 0) {
      return newErrors.pop()
    }
    return ""
  }
  LMSGetErrorString(errorCode: number) {
    const error = errorCodes[errorCode]
    if (!error) return ""
    return error[errorCode]["errorString"]
  }
  LMSGetDiagnostic(errorCode: number) {
    const error = errorCodes[errorCode]
    if (!error) return ""
    return error[errorCode]["diagnostic"]
  }
  _isInitialized() {
    const initialized = this.store.getItem('Initialized')
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
    // Always create a properly formed request
    const req = {
      request: {
        userId: this.getProperty('userId') || '',
        contents: [
          {
            contentId: this.getProperty('contentId'),
            batchId: this.getProperty('batchId') || '',
            courseId: this.getProperty('courseId') || '',
            status: this.getStatus(postData) || 2,
            lastAccessTime: dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss:SSSZZ'),
            progressdetails: postData || {},
            completionPercentage: this.getPercentage(postData) || 0,
          },
        ],
      },
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.getProperty('authorization')}`,
      'X-authenticated-user-token': this.getProperty('userToken'),
      'Content-Type': 'application/json',
    })

    this.logger.log('Sending SCORM progress update:', req)

    return this.http.post(`${API_END_POINTS.PROGRESS_UPDATE}`, req, { headers }).pipe(
      tap((response: any) => {
        this.logger.log('SCORM progress response:', response)
      }),
      catchError((error: any) => {
        this.logger.error('SCORM progress update failed:', error)
        throw error
      })
    )
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
            completionPercentage: 0,
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
