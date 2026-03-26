import { Injectable } from '@angular/core'
import { Storage, IScromData } from './storage'
import { errorCodes } from './errors'
import { HttpBackend, HttpClient } from '@angular/common/http'
import { ActivatedRoute, Router } from '@angular/router'
import { ConfigurationsService, LoggerService, TelemetryService } from '../../../../../../../../library/ws-widget/utils/src/public-api'
import dayjs from 'dayjs'
import { Subscription } from 'rxjs'
import { NsContent, WidgetContentService } from '@ws-widget/collection'
import { first } from 'rxjs/operators'
import { IndexedDBService } from 'src/app/online-indexed-db.service'
import { API_END_POINTS } from '../../../../../../../../src/app/constants/apiConstants'

@Injectable({
  providedIn: 'root',
})
export class SCORMAdapterService {
  id = ''
  name = ''
  parent = ''
  scromSubscription: Subscription | null = null
  contentData: any
  scormData: any
  contentKey: any
  constructor(
    private store: Storage,
    private http: HttpClient,
    handler: HttpBackend,
    private activatedRoute: ActivatedRoute,
    private configSvc: ConfigurationsService,
    //private viewerDataSvc: ViewerDataService,
    private router: Router,
    private contentSvc: WidgetContentService,
    private telemetrySvc: TelemetryService,
    private onlineIndexedDbService: IndexedDBService,
    private logger: LoggerService
  ) {
    this.http = new HttpClient(handler)
  }

  set contentId(id: string) {
    this.store.key = id
    this.id = id
  }

  get contentId() {
    return this.id
  }

  set htmlName(name: string) {
    this.name = name
  }

  get htmlName() {
    return this.name
  }
  set parentName(parent: string) {
    this.parent = parent
  }

  get parentName() {
    return this.parent
  }

  LMSInitialize() {
    this.store.contentKey = this.contentId
    this.loadDataV2()
    // this.loadDataAsync().subscribe((response) => {
    //   const data = response.result.data
    //   const loadDatas: IScromData = {
    //     "cmi.core.exit": data["cmi.core.exit"],
    //     "cmi.core.lesson_status": data["cmi.core.lesson_status"],
    //     "cmi.core.session_time": data["cmi.core.session_time"],
    //     "cmi.suspend_data": data["cmi.suspend_data"],
    //     Initialized: true,
    //   }
    //   this.store.setAll(loadDatas)
    // }, (error) => {
    //   if (error) {
    //     this._setError(101)
    //   }
    // })
    this.store.setItem('Initialized', true)
    return true
  }

  LMSFinish() {
    if (!this._isInitialized()) {
      this._setError(301)
      return false
    }
    // this.viewerDataSvc.scromChangeSubject.next(
    //   {
    //     'completed': true,
    //     'batchId':
    //       this.activatedRoute.snapshot.queryParamMap.get('batchId'),
    //     'collectionId': this.activatedRoute.snapshot.queryParams.collectionId
    //     , 'collectionType': this.activatedRoute.snapshot.queryParams.collectionType,
    //   }
    // )
    let _return = this.LMSCommit()
    this.store.setItem('Initialized', false)
    this.store.clearAll()
    return _return
  }

  initValue() {
    let data = this.store.getAll()
    this.logger.log('data', data)
    if (data) {
      return data
    }
    return ''
  }


  LMSGetValue(element: any) {
    if (!this._isInitialized()) {
      this._setError(301)
      return false
    }
    let value = this.store.getItem(element)
    if (!value) {
      this._setError(201)
      return ""
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

  LMSCommit() {
    let data = this.store.getAll()
    this.contentKey = this.store.returnKey()
    this.logger.log('[SCORM] LMSCommit called, data:', data, 'contentKey:', this.contentKey)
    let url
    url = this.router.url
    let splitUrl1 = url.split('?primary')
    let splitUrl2 = splitUrl1[0].split('/viewer/html/')
    if (splitUrl2[1] !== this.contentId) {
      this.contentId = splitUrl2[1]
    }

    if (data) {
      delete data['errors']
      this.scormData = data
      this.logger.log('[SCORM] LMSCommit lesson_status:', data["cmi.core.lesson_status"],
        'contentId:', this.contentId, 'url contentId:', splitUrl2[1])

      // Always call addDataV2 to persist progress regardless of lesson_status.
      // The status (completed/passed/incomplete/browsed/failed) is handled inside addDataV2
      // via getStatus() and getPercentage() which determine the correct completion values.
      this.addDataV2(data)
      return true
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
  loadDataAsync() {
    return this.http.get<any>(API_END_POINTS.SCROM_FETCH + '/' + this.contentId)
  }

  downladFile(url: any) {
    return this.http.get(url, { responseType: 'blob' })
  }

  loadDataV2() {
    let userId
    if (this.configSvc.userProfile) {
      userId = this.configSvc.userProfile.userId || ''
    }
    const req: NsContent.IContinueLearningDataReq = {
      request: {
        userId,
        batchId: this.activatedRoute.snapshot.queryParamMap.get('batchId') || '',
        courseId: this.activatedRoute.snapshot.queryParams.collectionId || '',
        contentIds: [this.contentId],
        fields: ['progressdetails'],
      },
    }
    this.http.post<NsContent.IContinueLearningData>(
      `${API_END_POINTS.SCROM_FETCH_PROGRESS}/${req.request.courseId}`, req
    ).subscribe(
      data => {
        // let loadDatas: IScromData = {}
        // tslint:disable-next-line: no-console

        if (data && data.result && data.result.contentList.length) {
          const listOfContent = data.result.contentList
          this.logger.log(listOfContent)
          const self = this
          const progressDetails = listOfContent.filter((item: any) => {
            if (item.contentId === self.contentId) {
              return item
            }
          })
          //  let loadDatas: IScromData = {}
          this.logger.log('PD', progressDetails)
          if (progressDetails.length > 0) {
            const data = progressDetails[0]
             if (data.progressdetails && data.progressdetails.hasOwnProperty("cmi.suspend_data")) {
              if (Object.keys(data.progressdetails).length === 1) {
                data.progressdetails = {}
              }
              const loadDatas: IScromData = {
                "cmi.core.exit": data.progressdetails["cmi.core.exit"],
                "cmi.core.lesson_status": data.progressdetails["cmi.core.lesson_status"],
                "cmi.core.session_time": data.progressdetails["cmi.core.session_time"],
                "cmi.suspend_data": data.progressdetails["cmi.suspend_data"],
                Initialized: data.progressdetails["Initialized"],
              }
              // this.logger.log(loadDatas)
              this.store.setAll(loadDatas)
            }
          } else {
            this.logger.log('No initial data found')
          }

          //   }
          // for (const content of data.result.contentList) {

          //   if (content.contentId === this.contentId && content.progressdetails) {
          //     const data = content.progressdetails
          //     this.logger.log(data)
          //     if (data.hasOwnProperty('cmi.suspend_data')) {
          //       loadDatas["cmi.suspend_data"] = data['cmi.suspend_data']
          //     }

          //     this.logger.log('progress data',loadDatas)
          //     this.store.setAll(loadDatas)
          //   }
          // }
        }
      },
    )
  }

  loadData() {
    this.http.get<any>(API_END_POINTS.SCROM_FETCH + '/' + this.contentId).subscribe((response) => {
      const data = response.result.data
      const loadDatas: IScromData = {
        "cmi.core.exit": data["cmi.core.exit"],
        "cmi.core.lesson_status": data["cmi.core.lesson_status"],
        "cmi.core.session_time": data["cmi.core.session_time"],
        "cmi.suspend_data": data["cmi.suspend_data"],
        Initialized: data["Initialized"],
        // errors: data["errors"]
      }
      this.store.setAll(loadDatas)
    }, (error) => {
      if (error) {
        // this.logger.log(error)
        this._setError(101)
      }
    })
  }
  addData(postData: IScromData) {
    this.http.post(API_END_POINTS.SCROM_ADD_UPDTE + '/' + this.contentId, postData, {
      headers: {
        'content-type': 'application/json'
      }
    })
    return this.http.post(API_END_POINTS.SCROM_ADD_UPDTE + '/' + this.contentId, postData)
  }

  getStatus(postData: any): number {
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
  addDataV2(postData: IScromData) {
    let req: any
    let userId
    if (this.configSvc.userProfile) {
      userId = this.configSvc.userProfile.userId || ''
    }
    const req1: NsContent.IContinueLearningDataReq = {
      request: {
        userId,
        batchId: this.activatedRoute.snapshot.queryParamMap.get('batchId') || '',
        courseId: this.activatedRoute.snapshot.queryParams.collectionId || '',
        contentIds: [this.contentId],
        fields: ['progressdetails'],
      },
    }
    this.logger.log('[SCORM] addDataV2 called for contentId:', this.contentId, 'postData:', postData)
    this.http.post<NsContent.IContinueLearningData>(
      `${API_END_POINTS.SCROM_FETCH_PROGRESS}/${req1.request.courseId}`, req1
    ).subscribe(
      async data1 => {
        this.logger.log('[SCORM] addDataV2 READ response:', data1)

        // Find existing content data from response (may be null for first-time access)
        this.contentData = null
        if (data1 && data1.result && data1.result.contentList && data1.result.contentList.length) {
          const contentList = data1['result']['contentList']
          this.contentData = contentList.find((obj: any) => obj.contentId === this.contentId) || null
        }
        this.logger.log('[SCORM] existing contentData:', this.contentData)

        if (this.configSvc.userProfile && postData) {
          // Determine if content is already completed (don't downgrade)
          const alreadyCompleted = this.contentData && this.contentData.status === 2
          const currentStatus = alreadyCompleted ? 2 : this.getStatus(postData)
          const currentPercentage = alreadyCompleted ? 100 : this.getPercentage(postData)

          req = {
            request: {
              userId: this.configSvc.userProfile.userId || '',
              contents: [
                {
                  contentId: this.contentId !== undefined ? this.contentId : this.contentKey,
                  batchId: this.activatedRoute.snapshot.queryParamMap.get('batchId') || '',
                  courseId: this.activatedRoute.snapshot.queryParams.collectionId || '',
                  status: currentStatus,
                  lastAccessTime: dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss:SSSZZ'),
                  progressdetails: postData,
                  completionPercentage: currentPercentage,
                },
              ],
            },
          }

          this.logger.log('[SCORM] Built update request:', req)

          // Update IndexedDB cache
          this.onlineIndexedDbService.getRecordFromTable('userEnrollCourse', this.configSvc.userProfile!.userId, this.activatedRoute.snapshot.queryParams.collectionId).subscribe((record) => {
            this.logger.log('[SCORM] IndexedDB record found:', record)
            this.onlineIndexedDbService.deleteRecordByKey('userEnrollCourse', req.request.contents[0].courseId).subscribe(
              (message: any) => {
                this.logger.log('[SCORM] Record deleted successfully', message)
                this.onlineIndexedDbService.insertProgressData(this.configSvc.userProfile!.userId, req.request.contents[0].courseId, req.request.contents[0].contentId, 'userEnrollCourse', window.location.href, req.request).subscribe(
                  (dat: any) => {
                    this.logger.log('[SCORM] Data inserted successfully (update path)', dat)
                  },
                  (error: any) => {
                    this.logger.error('[SCORM] Error inserting progress data:', error)
                  }
                )
              },
              (error: any) => {
                this.logger.error('[SCORM] Error deleting record:', error)
              }
            )
          }, (error) => {
            this.logger.log('[SCORM] No existing IndexedDB record, inserting fresh:', error)
            this.onlineIndexedDbService.insertProgressData(this.configSvc.userProfile!.userId, req.request.contents[0].courseId, req.request.contents[0].contentId, 'userEnrollCourse', window.location.href, req.request).subscribe(
              (dat: any) => {
                this.logger.log('[SCORM] Data inserted successfully (fresh path)', dat)
              },
              (error2: any) => {
                this.logger.error('[SCORM] Error inserting fresh progress data:', error2)
              }
            )
          })

          // Call the progress UPDATE API
          this.logger.log('[SCORM] Calling progress UPDATE API:', API_END_POINTS.NEW_PROGRESS_UPDATE)
          this.scromSubscription = this.http.patch(`${API_END_POINTS.NEW_PROGRESS_UPDATE}`, req).pipe(first()).subscribe(async (response: any) => {
            this.logger.log('[SCORM] Progress UPDATE API success:', response)
            if (this.scormData) {
              let object = {
                "id": this.contentId,
                "type": "scorm",
                "version": "",
                "rollup": {
                  "l1": this.activatedRoute.snapshot.queryParams.collectionId,
                  "l2": this.contentId
                }
              }
              this.telemetrySvc.start('scorm', 'scorm-start', 'player', object)
              if (this.activatedRoute.snapshot.queryParams.collectionId) {
                let data2: any = {
                  id: this.contentId,
                  type: 'scrom',
                  version: "",
                  "rollup": {
                    "l1": this.activatedRoute.snapshot.queryParams.collectionId,
                    "l2": this.contentId
                  }
                }
                const extras: any = {
                  values: [{
                    courseID: this.activatedRoute.snapshot.queryParams.collectionId ?
                      this.activatedRoute.snapshot.queryParams.collectionId : this.contentId,
                    contentId: this.contentId,
                    name: this.htmlName,
                    moduleId: this.parent,
                    duration: this.scormData["cmi.core.session_time"],
                    type: 'scrom',
                    mode: 'scrom-play',
                  }]
                }
                this.telemetrySvc.end('scorm', 'scorm-close', 'player', data2, extras)
              }
            }

            if (this.getPercentage(this.scormData) === 100) {
              let result = await response.result
              result["type"] = 'scorm'
              this.contentSvc.changeMessage(result)
              setTimeout(() => {
                this.LMSFinish()
              })
            }
          }, (error) => {
            this.logger.error('[SCORM] Progress UPDATE API FAILED:', error)
            this._setError(101)
          })
        } else {
          this.logger.warn('[SCORM] addDataV2 skipped: no userProfile or postData')
        }
      },
      (error) => {
        this.logger.error('[SCORM] addDataV2 READ API FAILED:', error)
        // Even if READ fails, still attempt to update progress with default values
        if (this.configSvc.userProfile && postData) {
          req = {
            request: {
              userId: this.configSvc.userProfile.userId || '',
              contents: [
                {
                  contentId: this.contentId !== undefined ? this.contentId : this.contentKey,
                  batchId: this.activatedRoute.snapshot.queryParamMap.get('batchId') || '',
                  courseId: this.activatedRoute.snapshot.queryParams.collectionId || '',
                  status: this.getStatus(postData),
                  lastAccessTime: dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss:SSSZZ'),
                  progressdetails: postData,
                  completionPercentage: this.getPercentage(postData),
                },
              ],
            },
          }
          this.logger.log('[SCORM] Attempting progress UPDATE despite READ failure:', req)
          this.scromSubscription = this.http.patch(`${API_END_POINTS.NEW_PROGRESS_UPDATE}`, req).pipe(first()).subscribe(
            (response: any) => {
              this.logger.log('[SCORM] Progress UPDATE API success (fallback):', response)
            },
            (patchError) => {
              this.logger.error('[SCORM] Progress UPDATE API FAILED (fallback):', patchError)
              this._setError(101)
            }
          )
        }
      }
    )
  }
  ngOnDestroy() {
    if (this.scromSubscription) {
      this.scromSubscription.unsubscribe()
    }
  }
}
