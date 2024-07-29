/* tslint:disable */
import { Injectable } from '@angular/core'
import { Storage, IScromData } from './storage'
import { errorCodes } from './errors'
// import _ from 'lodash'
import { HttpBackend, HttpClient } from '@angular/common/http'
import { ActivatedRoute, Router } from '@angular/router'
import { ConfigurationsService, TelemetryService } from '../../../../../../../../library/ws-widget/utils/src/public-api'
import dayjs from 'dayjs'
import { ViewerDataService } from 'project/ws/viewer/src/lib/viewer-data.service'
import { Subscription } from 'rxjs'
import { NsContent, WidgetContentService } from '@ws-widget/collection'
import { first } from 'rxjs/operators'
import { IndexedDBService } from 'src/app/online-indexed-db.service'

const API_END_POINTS = {
  SCROM_ADD_UPDTE: '/apis/protected/v8/scrom/add',
  SCROM_FETCH: '/apis/protected/v8/scrom/get',
  SCROM_UPDTE_PROGRESS: `/apis/proxies/v8/content-progres`,
  SCROM_FETCH_PROGRESS: `/apis/proxies/v8/read/content-progres`,
  NEW_PROGRESS_UPDATE: `/apis/protected/v8/updateProgressv2/update`,
}
//import { ViewerDataService } from '../../../viewer-data.service'
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
    private viewerDataSvc: ViewerDataService,
    private router: Router,
    private contentSvc: WidgetContentService,
    private telemetrySvc: TelemetryService,
    private onlineIndexedDbService: IndexedDBService
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
    console.log('data', data)
    if (data) {
      return data
    }
    return
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
    console.log('data', data, this.contentKey)
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
      // delete data['Initialized']
      // let newData = JSON.stringify(data)
      // data = Base64.encode(newData)
      let _return = false
      //if(Object.keys(data).length >= 0) {
      console.log((splitUrl2[1] === this.contentId), splitUrl2[1], this.contentId, this.contentData)
      console.log(data, 'data.recieved')
      if (data["cmi.core.lesson_status"] === 'incomplete' || data['cmi.suspend_data']) {
        console.log('hey')
        this.addDataV2(data)
        // this.scromSubscription = this.addDataV2(data).subscribe(async (response: any) => {
        //   console.log('intereim progress response', response)
        //   if (data) {
        //     this.telemetrySvc.start('scorm', 'scorm-start', this.activatedRoute.snapshot.queryParams.collectionId ?
        //       this.activatedRoute.snapshot.queryParams.collectionId : this.contentId)
        //     if (this.activatedRoute.snapshot.queryParams.collectionId) {
        //       let data2: any = {
        //         courseID: this.activatedRoute.snapshot.queryParams.collectionId ?
        //           this.activatedRoute.snapshot.queryParams.collectionId : this.contentId,
        //         contentId: this.contentId,
        //         name: this.htmlName,
        //         moduleId: this.parent,
        //         duration: data["cmi.core.session_time"],
        //         type: 'scrom',
        //         mode: 'scrom-play'
        //       }
        //       this.telemetrySvc.end('scorm', 'scorm-close', this.activatedRoute.snapshot.queryParams.collectionId ?
        //         this.activatedRoute.snapshot.queryParams.collectionId : this.contentId, data2)
        //     }
        //   }
        // })
      }
      if (splitUrl2[1] === this.contentId && (data["cmi.core.lesson_status"] === 'completed' || data["cmi.core.lesson_status"] === 'passed')) {
        this.addDataV2(data)
        // this.scromSubscription = this.addDataV2(data).subscribe(async (response: any) => {
        //   this.telemetrySvc.start('scorm', 'scorm-start', this.activatedRoute.snapshot.queryParams.collectionId ?
        //     this.activatedRoute.snapshot.queryParams.collectionId : this.contentId)
        //   if (data) {
        //     let data1: any = {
        //       courseID: this.activatedRoute.snapshot.queryParams.collectionId ?
        //         this.activatedRoute.snapshot.queryParams.collectionId : this.contentId,
        //       contentId: this.contentId,
        //       name: this.htmlName,
        //       moduleId: this.parent,
        //       duration: data["cmi.core.session_time"],
        //       type: 'scrom',
        //       mode: 'scrom-play'
        //     }
        //     this.telemetrySvc.end('scorm', 'scorm-close', this.activatedRoute.snapshot.queryParams.collectionId ?
        //       this.activatedRoute.snapshot.queryParams.collectionId : this.contentId, data1)
        //   }
        // let result = await response.result
        // result["type"] = 'scorm'
        // this.contentSvc.changeMessage(result)
        // if (this.getPercentage(data) === 100) {
        //   this.viewerDataSvc.scromChangeSubject.next(
        //     {
        //       'completed': true,
        //       'batchId':
        //         this.activatedRoute.snapshot.queryParamMap.get('batchId'),
        //       'collectionId': this.activatedRoute.snapshot.queryParams.collectionId
        //       , 'collectionType': this.activatedRoute.snapshot.queryParams.collectionType,
        //     })
        //   setTimeout(() => {
        //     this.LMSFinish()
        //   })
        // }
        // if (response) {
        //   _return = true
        // }
        // }, (error) => {
        //   if (error) {
        //     this._setError(101)
        //     // console.log(error)
        //   }
        // })

        return _return
      }

      //}
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
        contentIds: [],
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
          console.log(listOfContent)
          const self = this
          const progressDetails = listOfContent.filter((item: any) => {
            if (item.contentId === self.contentId) {
              return item
            }
          })
          //  let loadDatas: IScromData = {}
          console.log('PD', progressDetails)
          if (progressDetails.length > 0) {
            const data = progressDetails[0]
            if (data.progressdetails && data.progressdetails.hasOwnProperty("cmi.suspend_data")) {
              const loadDatas: IScromData = {}
              loadDatas["cmi.suspend_data"] = data.progressdetails['cmi.suspend_data']
              // console.log(loadDatas)
              this.store.setAll(loadDatas)
            }
          } else {
            console.log('No initial data found')
          }

          //   }
          // for (const content of data.result.contentList) {

          //   if (content.contentId === this.contentId && content.progressdetails) {
          //     const data = content.progressdetails
          //     console.log(data)
          //     if (data.hasOwnProperty('cmi.suspend_data')) {
          //       loadDatas["cmi.suspend_data"] = data['cmi.suspend_data']
          //     }

          //     console.log('progress data',loadDatas)
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
        // console.log(error)
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
      console.log('Error in getting completion status', e)
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
      console.log('Error in getting completion status', e)
      return 0
    }
  }
  addDataV2(postData: IScromData) {
    let req: any
    //&& (postData["cmi.core.lesson_status"] === 'completed' || postData["cmi.core.lesson_status"] === 'passed'
    let userId
    if (this.configSvc.userProfile) {
      userId = this.configSvc.userProfile.userId || ''
    }
    const req1: NsContent.IContinueLearningDataReq = {
      request: {
        userId,
        batchId: this.activatedRoute.snapshot.queryParamMap.get('batchId') || '',
        courseId: this.activatedRoute.snapshot.queryParams.collectionId || '',
        contentIds: [],
        fields: ['progressdetails'],
      },
    }
    this.http.post<NsContent.IContinueLearningData>(
      `${API_END_POINTS.SCROM_FETCH_PROGRESS}/${req1.request.courseId}`, req1
    ).subscribe(
      async data1 => {
        // tslint:disable-next-line: no-console
        console.log(data1)
        if (data1 && data1.result && data1.result.contentList.length) {
          let data = await data1['result']['contentList']
          console.log(data)
          this.contentData = data.find((obj: any) => obj.contentId === this.contentId)

          console.log(this.contentData, 'sy')

          if (this.configSvc.userProfile && postData) {
            if ((this.contentData && this.contentData.completionPercentage < 100) || (this.contentData === undefined)) {
              req = {
                request: {
                  userId: this.configSvc.userProfile.userId || '',
                  contents: [
                    {
                      contentId: this.contentId !== undefined ? this.contentId : this.contentKey,
                      batchId: this.activatedRoute.snapshot.queryParamMap.get('batchId') || '',
                      courseId: this.activatedRoute.snapshot.queryParams.collectionId || '',
                      status: this.getStatus(postData) || 2,
                      lastAccessTime: dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss:SSSZZ'),
                      progressdetails: postData,
                      completionPercentage: this.getPercentage(postData) || 0
                    },
                  ],
                },
              }
            } else {
              req = {
                request: {
                  userId: this.configSvc.userProfile.userId || '',
                  contents: [
                    {
                      contentId: this.contentId !== undefined ? this.contentId : this.contentKey,
                      batchId: this.activatedRoute.snapshot.queryParamMap.get('batchId') || '',
                      courseId: this.activatedRoute.snapshot.queryParams.collectionId || '',
                      status: this.getStatus(postData) || 2,
                      lastAccessTime: dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss:SSSZZ'),
                      progressdetails: postData,
                      completionPercentage: 100
                    },
                  ],
                },
              }
            }

          }
          // else {
          //   req = {}
          // }
          // if (this.getPercentage(postData) === 100) {
          //   this.viewerDataSvc.changedSubject.next(true)
          // }
          // tslint:disable-next-line: no-console
          console.log(req)

          //if(Object.keys(postData).length > 3) {
          //return this.http.patch(`${API_END_POINTS.SCROM_UPDTE_PROGRESS}/${this.contentId}`, req)
          this.onlineIndexedDbService.getRecordFromTable('userEnrollCourse', this.configSvc.userProfile!.userId, this.activatedRoute.snapshot.queryParams.collectionId).subscribe((record) => {
            console.log(record, '450')

            let cUrl = window.location.href
            console.log(cUrl.split('/'))
            let id = cUrl.split('/')[5]
            console.log(id)
            this.onlineIndexedDbService.deleteRecordByKey('userEnrollCourse', req.request.contents[0].courseId).subscribe(
              (message: any) => { // 'next' callback
                console.log('Record deleted successfully', message)

                this.onlineIndexedDbService.insertProgressData(this.configSvc.userProfile!.userId, req.request.contents[0].courseId, req.request.contents[0].contentId, 'userEnrollCourse', window.location.href, req.request).subscribe(
                  async (dat: any) => {
                    console.log('Data inserted successfully2', dat)
                    let msg = await dat
                    if (msg) {

                    }
                  },
                  (error: any) => { // 'error' callback for insertProgressData
                    console.error('Error inserting progress data:', error)
                  }
                )
              },
              (error: any) => { // 'error' callback for deleteRecordByKey
                console.error('Error deleting record:', error)
              }
            )


          }, (error) => {
            console.log(error, '480')
            this.onlineIndexedDbService.insertProgressData(this.configSvc.userProfile!.userId, req.request.contents[0].courseId, req.request.contents[0].contentId, 'userEnrollCourse', window.location.href, req.request).subscribe(
              (dat: any) => {
                console.log('Data inserted successfully1', dat)

              })
          })

          console.log(`${API_END_POINTS.NEW_PROGRESS_UPDATE}`, '488')
          this.scromSubscription = this.http.patch(`${API_END_POINTS.NEW_PROGRESS_UPDATE}`, req).pipe(first()).subscribe(async (response: any) => {

            if (this.scormData) {
              let result = await response.result
              result["type"] = 'scorm'
              this.contentSvc.changeMessage(result)

              this.telemetrySvc.start('scorm', 'scorm-start', this.activatedRoute.snapshot.queryParams.collectionId ?
                this.activatedRoute.snapshot.queryParams.collectionId : this.contentId)
              if (this.activatedRoute.snapshot.queryParams.collectionId) {
                let data2: any = {
                  courseID: this.activatedRoute.snapshot.queryParams.collectionId ?
                    this.activatedRoute.snapshot.queryParams.collectionId : this.contentId,
                  contentId: this.contentId,
                  name: this.htmlName,
                  moduleId: this.parent,
                  duration: this.scormData["cmi.core.session_time"],
                  type: 'scrom',
                  mode: 'scrom-play'
                }
                this.telemetrySvc.end('scorm', 'scorm-close', this.activatedRoute.snapshot.queryParams.collectionId ?
                  this.activatedRoute.snapshot.queryParams.collectionId : this.contentId, data2)
              }
            }
            console.log(this.scormData, 'scormdata')
            if (this.getPercentage(this.scormData) === 100) {
              this.viewerDataSvc.scromChangeSubject.next(
                {
                  'completed': true,
                  'batchId':
                    this.activatedRoute.snapshot.queryParamMap.get('batchId'),
                  'collectionId': this.activatedRoute.snapshot.queryParams.collectionId
                  , 'collectionType': this.activatedRoute.snapshot.queryParams.collectionType,
                })
              setTimeout(() => {
                this.LMSFinish()
              })
            }
          }, (error) => {
            if (error) {
              this._setError(101)
              // console.log(error)
            }
          })
        }

      })
    //}

  }
  ngOnDestroy() {
    if (this.scromSubscription) {
      this.scromSubscription.unsubscribe()
    }
  }
}