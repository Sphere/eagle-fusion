import { Injectable } from '@angular/core'
import { ActivatedRouteSnapshot, Router } from '@angular/router'
import * as _ from 'lodash'
import { forkJoin, of } from 'rxjs'
import { mergeMap } from 'rxjs/operators'
import { WidgetContentService } from '../../../library/ws-widget/collection/src/lib/_services/widget-content.service'
import { ConfigurationsService } from '../../../library/ws-widget/utils/src/lib/services/configurations.service'
import { viewerRouteGenerator } from '../../../library/ws-widget/collection/src/lib/_services/viewer-route-util'
import { LoggerService } from '../../../library/ws-widget/utils/src/lib/services/logger.service'
import { TranslateService } from '@ngx-translate/core'
import { parseCompetencies } from '@ws/app/src/lib/routes/app-toc/utils/competency.util'

@Injectable({
  providedIn: 'root',
})
export class SelfAssessmentGuard {
  resumeData: any = null;
  eventData: any = null;
  batchData: any
  resumeDataLink: any
  content: any
  batchId: any
  isAshaCourses: any = false
  competencyId: any
  language: any
  levelsDetaisl: any
  constructor(
    private contentSvc: WidgetContentService,
    private configSvc: ConfigurationsService,
    private router: Router,
    private translate: TranslateService,
    private logger: LoggerService
  ) { }

  canActivate(next: ActivatedRouteSnapshot) {
    if (this.configSvc.userProfile) {
      if (_.get(next, 'queryParams')) {
        return this.selfAssessment(_.get(next, 'queryParams'))
      } else {
        return false
      }
    } else {
      this.router.navigate(['public/home'])
      return false
    }
  }

  selfAssessment(event: any): boolean {
    localStorage.removeItem('competency_meta_data')
    this.eventData = _.cloneDeep(event)
    if (this.eventData) {
      // This guard is a root singleton, so batchId survives between clicks. Reset it every
      // time and seed from the batchId the competency card already handed us — without this
      // a stale batchId from a previously opened course can leak into the next navigation.
      this.batchId = this.eventData.batchId || undefined
      this.competencyId = this.eventData.competencyID
      this.language = this.eventData.lang || this.translate.getCurrentLang()
      this.levelsDetaisl = JSON.stringify(this.eventData.levels)
      this.logger.log('query paramas levels details', this.levelsDetaisl)
      this.isAshaCourses = this.eventData.isAsha ? true : false
      this.eventData['mimeType'] = 'application/json'
      const content$ = this.getContent()
      const enrolledCourseBatch$ = this.getEnrolledCourseList()
      forkJoin([content$, enrolledCourseBatch$])
        .pipe(
          mergeMap((res: any) => {
            this.content = _.get(res[0], 'result.content')
            let competency_meta_data = []
            if (this.content) {
              // competencies_v1 arrives as a JSON string from some content-service builds and
              // as an already-parsed array from others. A bare JSON.parse() throws on the array
              // form, and because that throw happens inside this mergeMap it used to kill the
              // whole chain silently — leaving the Assess button doing nothing.
              competency_meta_data = parseCompetencies(this.content.competencies_v1)
              const children = _.map(this.content.children, (item: any) => {
                return {
                  identifier: item.identifier,
                  competencyId: item.index,
                }
              })
              competency_meta_data.push({
                competencyIds: children,
              })
              localStorage.setItem(
                'competency_meta_data',
                JSON.stringify(competency_meta_data)
              )
            }
            this.batchData = _.find(res[1], { contentId: event.contentId })
            if (this.batchData) {
              return of(this.batchData)
            } else {
              // Fresh (never enrolled) course: pull the batch from the authoritative
              // batch-list endpoint. The search index (ratingsSearch) may not have
              // indexed a batch yet for a freshly created course, which would leave
              // batchId undefined and make the enrol call fail with 400.
              return this.getCourseBatch().pipe(
                mergeMap((res: any) => {
                  const batchData = _.get(res, 'content')
                  if (_.get(batchData, '[0].batchId')) {
                    return this.enrollUser(batchData, event.contentId)
                  }
                  return of(null)
                })
              )
            }
          })
        )
        .subscribe({
          next: (res: any) => {
            if (_.get(res, 'batchId')) {
              this.batchId = _.get(res, 'batchId')
            }
            this.navigateToplayer({ 'batchId': this.batchId })
          },
          error: (err: any) => {
            // Never swallow: this guard always returns false and navigates as a side effect,
            // so an unhandled error here means the user simply stays put with no feedback.
            this.logger.error('Self assessment: could not resolve batch, aborting navigation', err)
            this.navigateToplayer({ 'batchId': this.batchId })
          },
        })
    }
    return false
  }

  enrollUser(batchData: any, contentId: any) {
    const userId = _.get(this.configSvc, 'userProfile.userId') || ''
    this.batchId = _.get(batchData, '[0].batchId')
    const req = {
      request: {
        userId,
        courseId: contentId,
        batchId: _.get(batchData, '[0].batchId'),
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

  getEnrolledCourseList() {
    return this.contentSvc.fetchUserBatchList(
      _.get(this.configSvc, 'userProfile.userId')
    )
  }

  getFilteredCourseSearchResults(contentId: any) {
    return this.contentSvc.getFilteredCourseSearchResults(contentId)
  }

  navigateToplayer(data: any): boolean {
    const userId = _.get(this.configSvc, 'userProfile.userId') || ''
    const batchId = _.get(data, 'batchId')
    const req: any = {
      request: {
        batchId,
        userId,
        courseId: this.eventData.contentId || '',
        contentIds: [],
        fields: ['progressdetails'],
      },
    }
    if (!batchId) {
      // The progress API rejects a request with no batchId (400 MANDATORY_PARAMETER_MISSING),
      // so don't fire one we know will fail — start the course from its first resource.
      this.logger.error('Self assessment: no batchId resolved, starting from first resource')
      this.startFromFirstResource(batchId)
      return false
    }
    this.contentSvc.fetchContentHistoryV2(req).subscribe({
      next: (data: any) => {
        if (data?.result?.contentList?.length > 0) {
          this.resumeData = _.get(data, 'result.contentList')
          const lastItem = _.last(this.resumeData)
          const resumeDataV2 = {
            identifier: _.get(lastItem, 'contentId'),
            mimeType: _.get(lastItem, 'progressdetails.mimeType'),
          }
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
        } else {
          this.startFromFirstResource(batchId)
        }
      },
      error: (err: any) => {
        // Fall back to starting the course rather than leaving the user on a dead button.
        this.logger.error('Self assessment: progress lookup failed, starting from first resource', err)
        this.startFromFirstResource(batchId)
      },
    })
    return false
  }

  private startFromFirstResource(batchId?: any) {
    if (!this.content) {
      this.logger.error('Self assessment: no course hierarchy available, cannot navigate')
      return
    }
    const firstPlayableContent = this.contentSvc.getFirstChildInHierarchy(this.content)
    this.resumeDataLink = viewerRouteGenerator(
      _.get(firstPlayableContent, 'identifier'),
      _.get(firstPlayableContent, 'mimeType'),
      this.eventData.contentId,
      this.eventData.contentType,
      false,
      'Course',
      batchId
    )
    this.routeNavigation(batchId, 'START')
  }

  routeNavigation(batchId?: any, viewMode?: any) {
    if (!this.resumeDataLink) {
      // The old code spread `this.resumeDataLink.queryParams` in the else branch without a
      // null check, so an unresolved link threw here instead of reporting anything.
      this.logger.error('Self assessment: no playable resource resolved, cannot navigate')
      return
    }
    const qParams: { [key: string]: string } = {
      ...this.resumeDataLink.queryParams,
      batchId: batchId,
      viewMode: viewMode,
      competency: 'true',
      ...(this.isAshaCourses ? {
        isAsha: this.isAshaCourses,
        competencyId: this.competencyId,
        lang: this.language,
        levels: this.levelsDetaisl,
      } : {}),
    }
    this.logger.log('router url', this.resumeDataLink, qParams)
    this.router.navigate([this.resumeDataLink.url], {
      queryParams: qParams,
    })
  }

}
