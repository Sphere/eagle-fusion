import { Injectable } from '@angular/core'
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router'
import * as _ from 'lodash'
import { forkJoin, of } from 'rxjs'
import { mergeMap } from 'rxjs/operators'
import { WidgetContentService } from '../../../library/ws-widget/collection/src/public-api'
import { ConfigurationsService } from '../../../library/ws-widget/utils/src/public-api'
import { viewerRouteGenerator } from '@ws-widget/collection'

@Injectable({
  providedIn: 'root'
})
export class SelfAssessmentGuard implements CanActivate {

  resumeData: any = null
  eventData: any = null
  batchData: any
  resumeDataLink: any
  content: any

  constructor(
    private contentSvc: WidgetContentService,
    private configSvc: ConfigurationsService,
    private router: Router
  ) { }

  canActivate(
    next: ActivatedRouteSnapshot) {
    if (this.configSvc.userProfile) {
      if (_.get(next, 'queryParams')) {
        return this.selfAsesment(_.get(next, 'queryParams'))
      } else {
        return false
      }
    } else {
      this.router.navigate([`public/home`])
      return false
    }
  }

  selfAsesment(event: any): boolean {
    /**
    * here we will redirect to player screen
    */
    localStorage.removeItem('competency_meta_data')
    this.eventData = JSON.parse(JSON.stringify(event))
    if (this.eventData) {
      this.eventData['mimeType'] = 'application/json'
      const content = this.getContent()
      const courseBatch = this.getCourseBatch()
      forkJoin([content, courseBatch]).pipe(mergeMap((res: any) => {
        this.content = res[0].result.content
        if (this.content.competencies_v1) {
          localStorage.setItem('competency_meta_data', (this.content.competencies_v1))
        }
        this.batchData = res[1].content
        if (!this.batchData[0].enrollmentEndDate) {
          return this.enrollUser(this.batchData)
        } else {
          return of(this.batchData)
        }
      })).subscribe((res: any) => {
        return this.navigateToplayer(res[0])
      })
    }
    return false
  }

  enrollUser(batchData: any) {
    let userId = ''
    if (this.configSvc.userProfile) {
      userId = this.configSvc.userProfile.userId || ''
    }
    const req = {
      request: {
        userId,
        courseId: batchData[0].courseId,
        batchId: batchData[0].batchId,
      },
    }
    return this.contentSvc.enrollUserToBatch(req)
  }


  getContent() {
    return this.contentSvc.fetchContent(this.eventData.contentId)
  }

  getCourseBatch() {
    const req = {
      request: {
        filters: {
          courseId: this.eventData.contentId,
          status: ['0', '1', '2'],
        },
        sort_by: { createdDate: 'desc' },
      },
    }
    return this.contentSvc.fetchCourseBatches(req)
  }

  navigateToplayer(data: any): boolean {
    let userId = ''
    if (this.configSvc.userProfile) {
      userId = this.configSvc.userProfile.userId || ''
    }
    const batchId = data.batchId
    const req: any = {
      request: {
        batchId,
        userId,
        courseId: this.eventData.contentId || '',
        contentIds: [],
        fields: ['progressdetails'],
      },
    }
    this.contentSvc.fetchContentHistoryV2(req).subscribe((data: any) => {
      if (data && data.result && data.result.contentList && data.result.contentList.length > 0) {
        this.resumeData = _.get(data, 'result.contentList')
        const resumeDataV2 = this.getResumeDataFromList()
        resumeDataV2['mimeType'] = 'application/json'
        this.resumeDataLink = viewerRouteGenerator(
          resumeDataV2.identifier,
          resumeDataV2.mimeType,
          this.eventData.contentId,
          this.eventData.contentType,
          false,
          'Course',
          batchId
        )
        this.routeNavigation(batchId, 'RESUME')
        return false
      } else {
        const firstPlayableContent = this.contentSvc.getFirstChildInHierarchy(this.content)
        this.resumeDataLink = viewerRouteGenerator(
          firstPlayableContent.identifier,
          firstPlayableContent.mimeType,
          this.eventData.contentId,
          this.eventData.contentType,
          false,
          'Course',
          batchId
        )
        this.routeNavigation(batchId, 'START')
        return false
      }
    })
    return false


  }

  private getResumeDataFromList() {
    const lastItem = this.resumeData && this.resumeData.pop()
    return {
      identifier: lastItem.contentId,
      mimeType: lastItem.progressdetails && lastItem.progressdetails.mimeType,

    }
  }

  routeNavigation(batchId?: any, viewMode?: any) {
    if (this.resumeDataLink) {
      let qParams: { [key: string]: string } = {
        ...this.resumeDataLink.queryParams,
        batchId: batchId,
        viewMode: viewMode,
        competency: true
      }
      this.router.navigate([this.resumeDataLink.url], { queryParams: qParams })
    }

  }

}
