import { ConfigurationsService } from '@ws-widget/utils'
import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import {
  // noop,
  Observable, BehaviorSubject,
} from 'rxjs'
import dayjs from 'dayjs'
import { NsContent } from '../../../../../library/ws-widget/collection/src/lib/_services/widget-content.model'
import { IndexedDBService } from 'src/app/online-indexed-db.service'

@Injectable({
  providedIn: 'root',
})
export class ViewerUtilService {
  API_ENDPOINTS = {
    setS3Cookie: `/apis/v8/protected/content/setCookie`,
    // PROGRESS_UPDATE: `/apis/protected/v8/user/realTimeProgress/update`,
    PROGRESS_UPDATE: `/apis/proxies/v8/content-progres`,
    NEW_PROGRESS_UPDATE: `/apis/protected/v8/updateProgressv2/update`,
    SCORM_UPDATE: `/apis/proxies/v8/getContents/`,
  }
  downloadRegex = new RegExp(`(/content-store/.*?)(\\\)?\\\\?['"])`, 'gm')
  authoringBase = '/apis/authContent/'
  competencyAsessment = new BehaviorSubject<any>(false)
  competencyAsessment$ = this.competencyAsessment.asObservable()
  constructor(private http: HttpClient, private configservice: ConfigurationsService,
    private onlineIndexedDbService: IndexedDBService
  ) { }

  private currentResource = new BehaviorSubject<NsContent.IContent | null>(null)
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
      .post(this.API_ENDPOINTS.setS3Cookie, { contentId })
      .toPromise()
      .catch((_err: any) => { })
    return
  }

  calculatePercent(current: any, max: number, mimeType?: string): number {
    try {
      // const temp = [...current]
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
          // if (percent <= 5) {
          //   // if percentage is less than 5% make it 0
          //   percent = 0
          // } else if (percent >= 95) {
          //   // if percentage is greater than 95% make it 100
          //   percent = 100
          // }
        } if (mimeType === NsContent.EMimeTypes.TEXT_WEB || mimeType === 'application/json') {
          return 100
        } if (mimeType === NsContent.EMimeTypes.ZIP) {
          return 100

        } if (mimeType === NsContent.EMimeTypes.PDF) {

          const latest = parseFloat(temp.slice(-1) || '0')
          // const latest = parseFloat(temp[temp.length - 1] || '0')
          const percentMilis = (latest / max) * 100
          const percent = parseFloat(percentMilis.toFixed(2))
          return percent
        }
        return 2

      }
      return 0
    } catch (e) {
      // tslint:disable-next-line: no-console
      console.log('Error in calculating percentage', e)
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
        // if percentage is less than 6% then make status started
        if (Math.ceil(percentage) >= 5 && Math.ceil(percentage) <= 6) {
          return 1
        }
        // if percentage is greater than 95% then make status complete
        if (Math.ceil(percentage) >= 95) {
          return 2
        }
      } else if (mimeType === NsContent.EMimeTypes.TEXT_WEB || mimeType === 'application/json') {
        // if (current === 1) {
        //   return 0
        // }
        // if (current === 5) {
        //   return 1
        // }
        // if (current === 10) {
        //   return 2
        // }
        return 2
      } else if (mimeType === NsContent.EMimeTypes.PDF) {
        if (percentage <= 25) {
          return 0
        } if (percentage > 26 && percentage <= 75) {
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
      console.log('Error in getting completion status', e)
      return 1
    }
  }
  initUpdate(req: any) {
    console.log(req.request.contents[0])
    let cUrl = req.request.url ? req.request.url : window.location.href
    this.onlineIndexedDbService.getRecordFromTable('userEnrollCourse', this.configservice.userProfile!.userId, req.request.contents[0].courseId).subscribe((record) => {
      console.log(record, '153')
      console.log(cUrl.split('/'))
      let id = cUrl.split('/')[5]
      console.log(id)
      console.log(req.request)
      this.onlineIndexedDbService.deleteRecordByKey('userEnrollCourse', req.request.contents[0].courseId).subscribe({
        next: (next) => {
          console.log('Record deleted successfully', next)
          if (next) {

          }
          this.onlineIndexedDbService.insertProgressData(this.configservice.userProfile!.userId, req.request.contents[0].courseId, req.request.contents[0].contentId, 'userEnrollCourse', cUrl, req.request).subscribe(
            (dat: any) => {
              console.log('Data inserted successfully2', dat)

            })
        },
        error: (error) => {
          console.error('Error deleting record:', error)
        }
      })
    }, (error) => {
      console.log(error, '156',)
      this.onlineIndexedDbService.insertProgressData(this.configservice.userProfile!.userId, req.request.contents[0].courseId, req.request.contents[0].contentId, 'userEnrollCourse', cUrl, req.request).subscribe(
        (dat: any) => {
          console.log('Data inserted successfully1', dat)

        })
    })
    return this.http.patch(`${this.API_ENDPOINTS.NEW_PROGRESS_UPDATE}`, req)
  }

  realTimeProgressUpdate(contentId: string, request: any, collectionId?: string, batchId?: string) {
    let req: any
    if (this.configservice.userProfile) {
      let checkCollectionId = ''
      if (contentId === collectionId) {
        const storedCollectionId = localStorage.getItem('collectionId')
        if (storedCollectionId) {
          checkCollectionId = storedCollectionId
        }
      }
      let percentage = this.calculatePercent(request.current, request.max_size, request.mime_type)
      if (percentage > 95) {
        percentage = 100
      }
      req = {
        request: {
          userId: this.configservice.userProfile.userId || '',
          contents: [
            {
              contentId,
              batchId,
              status: this.getStatus(request.current, request.max_size, request.mime_type),
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
    } else {
      req = {}
    }
    console.log(req, `${this.API_ENDPOINTS.NEW_PROGRESS_UPDATE}`, '215')
    this.onlineIndexedDbService.getRecordFromTable('userEnrollCourse', this.configservice.userProfile!.userId, collectionId).subscribe((record) => {
      console.log(record, '217')

      let cUrl = window.location.href
      console.log(cUrl.split('/'))
      let id = cUrl.split('/')[5]
      console.log(id)
      this.onlineIndexedDbService.deleteRecordByKey('userEnrollCourse', req.request.contents[0].courseId).subscribe(
        (message: any) => { // 'next' callback
          console.log('Record deleted successfully', message)

          this.onlineIndexedDbService.insertProgressData(this.configservice.userProfile!.userId, req.request.contents[0].courseId, req.request.contents[0].contentId, 'userEnrollCourse', window.location.href, req.request).subscribe(
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
      console.log(error, '247')
      this.onlineIndexedDbService.insertProgressData(this.configservice.userProfile!.userId, req.request.contents[0].courseId, req.request.contents[0].contentId, 'userEnrollCourse', window.location.href, req.request).subscribe(
        (dat: any) => {
          console.log('Data inserted successfully1', dat)

        })
    })
    return this.http.patch(`${this.API_ENDPOINTS.NEW_PROGRESS_UPDATE}`, req)
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
              batchId,
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
    console.log(`${this.API_ENDPOINTS.NEW_PROGRESS_UPDATE}`, '201')
    // this.http
    //   .patch(`${this.API_ENDPOINTS.NEW_PROGRESS_UPDATE}/${contentId}`, req)
    //   .subscribe(noop, noop)
    return this.http.patch(`${this.API_ENDPOINTS.NEW_PROGRESS_UPDATE}`, req)
  }

  scormUpdate(artifactUrl: string): Observable<any> {
    return this.http.get(`${this.API_ENDPOINTS.SCORM_UPDATE}${artifactUrl}`, { responseType: 'text' as 'json' })
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

}
