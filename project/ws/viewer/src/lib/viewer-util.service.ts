import { ConfigurationsService, EventService, LoggerService } from '@ws-widget/utils'
import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import {
  Observable, BehaviorSubject,
} from 'rxjs'
import dayjs from 'dayjs'
import { NsContent } from '../../../../../library/ws-widget/collection/src/lib/_services/widget-content.model'
import { IndexedDBService } from 'src/app/services/online-indexed-db.service'
import { API_END_POINTS } from '../../../../../src/app/constants/apiConstants'

@Injectable({
  providedIn: 'root',
})
export class ViewerUtilService {
  // Character classes exclude the terminating quote/backslash so the group can't
  // backtrack ambiguously against the trailing optional chars — bounds worst-case cost.
  downloadRegex = new RegExp(`(/content-store/[^'"\\\\]*?)(\\\)?\\\\?['"])`, 'gm')
  authoringBase = '/apis/authContent/'
  competencyAsessment = new BehaviorSubject<any>(false)
  competencyAsessment$ = this.competencyAsessment.asObservable()
  constructor(private readonly http: HttpClient, private readonly configservice: ConfigurationsService,
    private readonly onlineIndexedDbService: IndexedDBService,
    private readonly events: EventService,
    private readonly logger: LoggerService
  ) { }

  private readonly currentResource = new BehaviorSubject<NsContent.IContent | null>(null)
  castResource = this.currentResource.asObservable()

  editResourceData(newResource: any) {
    this.currentResource.next(newResource)
  }

  async fetchManifestFile(url: string) {
    this.setS3Cookie(url)
    const manifestFile = await this.http
      .get<any>(url)
      .toPromise()
      .catch((_err: any) => { })
    return manifestFile
  }

  private async setS3Cookie(contentId: string) {
    await this.http
      .post(API_END_POINTS.setS3Cookie, { contentId })
      .toPromise()
      .catch((_err: any) => { })
    return
  }

  calculatePercent(current: any, max: number, mimeType?: string): number {
    try {
      const temp = current
      if (temp && max) {
        if (
          mimeType === NsContent.EMimeTypes.MP4 ||
          mimeType === NsContent.EMimeTypes.M3U8 ||
          mimeType === NsContent.EMimeTypes.MP3 ||
          mimeType === NsContent.EMimeTypes.M4A
        ) {
          const percent = (current / max) * 100
          return Math.ceil(percent)
        } else if (mimeType === NsContent.EMimeTypes.TEXT_WEB || mimeType === 'application/json') {
          return 100
        } else if (mimeType === NsContent.EMimeTypes.ZIP) {
          return 100

        } else if (mimeType === NsContent.EMimeTypes.PDF) {
          // Handle both array and number inputs
          let latest
          if (Array.isArray(temp)) {
            latest = Number.parseFloat(temp.slice(-1)[0] || '0')  // Get last element of array
          } else {
            latest = Number.parseFloat(temp || '0')
          }
          const percentMilis = (latest / max) * 100
          const percent = Number.parseFloat(percentMilis.toFixed(2))
          return percent
        }
        return 2

      }
      return 0
    } catch (e) {
      // tslint:disable-next-line: no-console
      this.logger.log('Error in calculating percentage', e)
      return 0
    }
  }

  getStatus(current: number, max: number, mimeType: string) {
    try {
      const percentage = this.calculatePercent(current, max, mimeType)
      // for videos and audios
      if (
        mimeType === NsContent.EMimeTypes.MP4 ||
        mimeType === NsContent.EMimeTypes.M3U8 ||
        mimeType === NsContent.EMimeTypes.MP3 ||
        mimeType === NsContent.EMimeTypes.M4A
      ) {
        if (Math.ceil(percentage) <= 1) {
          return 0
        }
        // if percentage is greater than or equal to 5% then make status in progress
        if (Math.ceil(percentage) >= 5 && Math.ceil(percentage) < 95) {
          return 1
        }
        // if percentage is greater than or equal to 95% then make status complete
        if (Math.ceil(percentage) >= 95) {
          return 2
        }
      } else if (mimeType === NsContent.EMimeTypes.TEXT_WEB || mimeType === 'application/json') {
        return 2
      } else if (mimeType === NsContent.EMimeTypes.PDF) {
        if (percentage <= 25) {
          return 0
        } else if (percentage > 26 && percentage <= 75) {
          return 1
        }
        return 2

      } else if (mimeType === NsContent.EMimeTypes.ZIP) {
        return 2
      } else {
        return 1
      }
      return 0
    } catch (e) {
      // tslint:disable-next-line: no-console
      this.logger.log('Error in getting completion status', e)
      return 1
    }
  }
  initUpdate(req: any) {
    // Ensure completionPercentage matches status
    if (req.request.contents && req.request.contents.length > 0) {
      const content = req.request.contents[0]
      if (content.status === 2 && content.completionPercentage !== 100) {
        content.completionPercentage = 100
        this.logger.log('Fixed completionPercentage mismatch: status=2 requires completionPercentage=100')
      }
    }
    this.logger.log(req.request.contents[0])
    const cUrl = req.request.url ? req.request.url : window.location.href
    this.onlineIndexedDbService.getRecordFromTable('userEnrollCourse', this.configservice.userProfile!.userId, req.request.contents[0].courseId).subscribe(record => {
      this.logger.log(record, '153')
      this.logger.log(cUrl.split('/'))
      const id = cUrl.split('/')[5]
      this.logger.log(id)
      this.logger.log(req.request)
      this.onlineIndexedDbService.deleteRecordByKey('userEnrollCourse', req.request.contents[0].courseId).subscribe({
        next: next => {
          this.logger.log('Record deleted successfully', next)
          this.onlineIndexedDbService.insertProgressData(this.configservice.userProfile!.userId, req.request.contents[0].courseId, req.request.contents[0].contentId, 'userEnrollCourse', cUrl, req.request).subscribe(
            (dat: any) => {
              this.logger.log('Data inserted successfully2', dat)

            })
        },
        error: error => {
          this.logger.error('Error deleting record:', error)
        },
      })
    }, error => {
      this.logger.log(error, '156',)
      this.onlineIndexedDbService.insertProgressData(this.configservice.userProfile!.userId, req.request.contents[0].courseId, req.request.contents[0].contentId, 'userEnrollCourse', cUrl, req.request).subscribe(
        (dat: any) => {
          this.logger.log('Data inserted successfully1', dat)

        })
    })
    return this.http.patch(`${API_END_POINTS.NEW_PROGRESS_UPDATE}`, req)
  }

  realTimeProgressUpdate(contentId: string, request: any, collectionId?: string, batchId?: string) {
    const { req, resolvedCollectionId } = this.prepareProgressUpdateRequest(contentId, request, collectionId, batchId)
    this.syncOnlineCourseProgress(req, resolvedCollectionId)
    return this.http.patch(`${API_END_POINTS.NEW_PROGRESS_UPDATE}`, req)
  }

  realTimeProgressUpdateV3(contentId: string, request: any, collectionId?: string, batchId?: string) {
    const { req, resolvedCollectionId } = this.prepareProgressUpdateRequest(contentId, request, collectionId, batchId)
    this.syncOnlineCourseProgress(req, resolvedCollectionId)
    return this.http.patch(`${API_END_POINTS.NEW_PROGRESS_UPDATE_V3}`, req)
  }

  private prepareProgressUpdateRequest(
    contentId: string,
    request: any,
    collectionId?: string,
    batchId?: string,
  ): { req: any; resolvedCollectionId?: string } {
    if (!collectionId) {
      const storedCollectionId = localStorage.getItem('collectionId')
      if (storedCollectionId) {
        collectionId = storedCollectionId
      }
    }

    // **CRITICAL**: Get batchId from query params if not provided as parameter
    if (!batchId) {
      const query = window.location.search
      const params = new URLSearchParams(query)
      batchId = params.get('batchId') || undefined
    }

    const req = this.configservice.userProfile
      ? this.buildProgressUpdateReq(contentId, request, collectionId, batchId)
      : {}

    this.logger.log(req, `${API_END_POINTS.NEW_PROGRESS_UPDATE_V3}`, '215')
    return { req, resolvedCollectionId: collectionId }
  }

  private buildProgressUpdateReq(contentId: string, request: any, collectionId?: string, batchId?: string): any {
    let checkCollectionId = ''
    if (contentId === collectionId) {
      const storedCollectionId = localStorage.getItem('collectionId')
      if (storedCollectionId) {
        checkCollectionId = storedCollectionId
      }
    }
    // **CRITICAL**: Use completionPercentage if provided by player-video, otherwise calculate it
    // This ensures we respect the percentage that was explicitly sent, not recalculate it
    let percentage = request.completionPercentage !== undefined
      ? request.completionPercentage
      : this.calculatePercent(request.current[0], request.max_size, request.mime_type)
    if (percentage > 95) {
      percentage = 100
    }
    const mimeType = request.mime_type
    // **CRITICAL**: Extract numeric value from current (could be array or number)
    // request.current comes as array ["69.613552"] from API responses
    const currentNumeric = Array.isArray(request.current)
      ? Number.parseFloat(request.current[0] || '0')
      : request.current
    // **CRITICAL**: Status code for API (2 = completed when 100%)
    const statusCode = percentage === 100 ? 2 : this.getStatus(currentNumeric, request.max_size, request.mime_type)

    // **CRITICAL**: For telemetry, pass statusCode (0=not started, 1=in progress, 2=completed)
    // batchId is passed along to ensure it's included in telemetry extras
    this.generateInteractTelemetry('progress-update-attempt', { contentId, checkCollectionId, percentage, mimeType, batchId, status: statusCode })
    return {
      request: {
        userId: this.configservice.userProfile.userId || '',
        contents: [
          {
            contentId,
            batchId: batchId || '',  // **CRITICAL**: Ensure batchId is never undefined in API request
            status: statusCode,  // **CRITICAL**: Use statusCode (2 when 100%)
            courseId: checkCollectionId ? checkCollectionId : collectionId,
            lastAccessTime: dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss:SSSZZ'),
            progressdetails: {
              max_size: request.max_size,
              current: request.current,
              mimeType: request.mime_type,
            },
            completionPercentage: percentage,
          },
        ],
      },
    }
  }

  private syncOnlineCourseProgress(req: any, collectionId?: string): void {
    this.onlineIndexedDbService.getRecordFromTable('userEnrollCourse', this.configservice.userProfile!.userId, collectionId).subscribe(record => {
      this.logger.log(record, '217')

      const cUrl = window.location.href
      this.logger.log(cUrl.split('/'))
      const id = cUrl.split('/')[5]
      this.logger.log(id)
      this.onlineIndexedDbService.deleteRecordByKey('userEnrollCourse', req.request.contents[0].courseId).subscribe(
        (message: any) => { // 'next' callback
          this.logger.log('Record deleted successfully', message)

          this.onlineIndexedDbService.insertProgressData(this.configservice.userProfile!.userId, req.request.contents[0].courseId, req.request.contents[0].contentId, 'userEnrollCourse', window.location.href, req.request).subscribe(
            (dat: any) => {
              this.logger.log('Data inserted successfully2', dat)
            },
            (error: any) => { // 'error' callback for insertProgressData
              this.logger.error('Error inserting progress data:', error)
            }
          )
        },
        (error: any) => { // 'error' callback for deleteRecordByKey
          this.logger.error('Error deleting record:', error)
        }
      )


    }, error => {
      this.logger.log(error, '247')
      this.onlineIndexedDbService.insertProgressData(this.configservice.userProfile!.userId, req.request.contents[0].courseId, req.request.contents[0].contentId, 'userEnrollCourse', window.location.href, req.request).subscribe(
        (dat: any) => {
          this.logger.log('Data inserted successfully1', dat)

        })
    })
  }

  realTimeProgressUpdateQuiz(contentId: string, collectionId?: string, batchId?: string, status?: number) {
    let req: any
    if (this.configservice.userProfile) {
      req = {
        request: {
          userId: this.configservice.userProfile.userId || '',
          contents: [
            {
              contentId,
              batchId: batchId || '',  // **CRITICAL**: Ensure batchId is never undefined
              status: status || 2,
              courseId: collectionId,
              lastAccessTime: dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss:SSSZZ'),
            },
          ],
        },
      }
    } else {
      req = {}
    }
    this.logger.log(`${API_END_POINTS.NEW_PROGRESS_UPDATE}`, '201')
    return this.http.patch(`${API_END_POINTS.NEW_PROGRESS_UPDATE}`, req)
  }

  scormUpdate(artifactUrl: string): Observable<any> {
    return this.http.get(`${API_END_POINTS.SCORM_UPDATE}${artifactUrl}`, { responseType: 'text' as 'json' })
  }
  getContent(contentId: string): Observable<NsContent.IContent> {
    return this.http.get<NsContent.IContent>(
      // tslint:disable-next-line:max-line-length
      `/apis/authApi/action/content/hierarchy/${contentId}?rootOrg=${this.configservice.rootOrg || 'aastar'}&org=${this.configservice.activeOrg || 'dopt'}`,
    )
  }

  getAuthoringUrl(url: string): string {
    return url
      // tslint:disable-next-line:max-line-length
      ? `/apis/authContent/${url.includes('/content-store/') ? new URL(url).pathname.slice(1) : encodeURIComponent(url)}`
      : ''
  }
  getCompetencyAuthoringUrl(url: string): string {
    return `apis/public/v8/mobileApp/v1/assessment/content${url}`

  }
  regexDownloadReplace = (_str = '', group1: string, group2: string): string => {
    return `${this.authoringBase}${encodeURIComponent(group1)}${group2}`
  }

  replaceToAuthUrl(data: any): any {
    return JSON.parse(
      JSON.stringify(data).replace(
        this.downloadRegex,
        this.regexDownloadReplace,
      ),
    )
  }

  generateInteractTelemetry(actionId: string, contentData) {
    const objRollup = { l1: '', l2: '' }
    const query = window.location.search
    const params = new URLSearchParams(query)
    const collectionId = params.get('collectionId')
    objRollup.l1 = contentData.courseId || contentData.checkCollectionId || collectionId
    objRollup.l2 = contentData.contentId || ''
    const value = new Map()
    value['id'] = contentData?.contentId || ''
    value['type'] = contentData.mimeType || ""
    value["version"] = ""
    value['rollup'] = objRollup
    const extras: any = {}
    // **CRITICAL**: Send progress percentage (for tracking) and status code (0/1/2) separately
    // batchId from contentData parameter should be included in telemetry
    const batchIdValue = contentData?.batchId || ''
    extras['values'] = [
      {
        "identifier": contentData?.contentId || '',
        "progress": contentData?.completionPercentage || contentData?.percentage || 0,
        "batchId": batchIdValue,  // **CRITICAL**: batchId from contentData should be forwarded to extras
        "status": contentData?.status || 1,  // **CRITICAL**: Use actual status code (0/1/2), not progress percentage
      },
    ]
    this.events.raiseInteractTelemetry(
      actionId,
      contentData.mimeType,
      'player',
      value,
      extras
    )
  }

}
