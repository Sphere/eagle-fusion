import { Injectable } from '@angular/core'
import { Data } from '@angular/router'
import { Subject, Observable, Subscription, BehaviorSubject } from 'rxjs'
import { HttpClient } from '@angular/common/http'
import { NsContent } from '@ws-widget/collection/src/lib/_services/widget-content.model'
import { NsContentConstants } from '@ws-widget/collection/src/lib/_constants/widget-content.constants'
import { NsAppToc, NsCohorts } from '../models/app-toc.model'
import { TFetchStatus, ConfigurationsService, LoggerService } from '@ws-widget/utils'
import { API_END_POINTS } from '../../../../../../../../src/app/constants/apiConstants'

@Injectable()
export class AppTocService {
  analyticsReplaySubject: Subject<any> = new Subject()
  analyticsFetchStatus: TFetchStatus = 'none'
  private showSubtitleOnBanners = false
  private canShowDescription = false
  public _showComponent = new BehaviorSubject<any>(undefined)
  // Observable navItem stream
  showComponent$ = this._showComponent.asObservable()
  batchReplaySubject: Subject<any> = new Subject()
  resumeData: Subject<NsContent.IContinueLearningData | null> = new Subject<NsContent.IContinueLearningData | null>()
  resumeDataSubscription: Subscription | null = null
  gatingEnabled = false
  constructor(private readonly http: HttpClient, private readonly configSvc: ConfigurationsService, private readonly logger: LoggerService) { }
  private data: any

  getcontentForWidget() {
    const temp = this.data
    return temp
  }
  setcontentForWidget(val: any) {
    this.data = val
  }
  clearData() {
    this.data = undefined
  }
  get subtitleOnBanners(): boolean {
    return this.showSubtitleOnBanners
  }
  set subtitleOnBanners(val: boolean) {
    this.showSubtitleOnBanners = val
  }
  get showDescription(): boolean {
    return this.canShowDescription
  }
  set showDescription(val: boolean) {
    this.canShowDescription = val
  }

  updateResumaData(data: any) {
    this.resumeData.next(data)
  }

  showStartButton(content: NsContent.IContent | null): { show: boolean; msg: string } {
    const status = {
      show: false,
      msg: '',
    }
    if (content) {
      if (
        content.artifactUrl && content.artifactUrl.match(/youtu(.)?be/gi) &&
        this.configSvc.userProfile &&
        this.configSvc.userProfile.country === 'China'
      ) {
        status.show = false
        status.msg = 'youtubeForbidden'
        return status
      }
      if (content.resourceType !== 'Certification') {
        status.show = true
        return status
      }
    }
    return status
  }

  initData(data: Data, needResumeData = false): NsAppToc.IWsTocResponse {
    let content: NsContent.IContent | null = null
    let errorCode: NsAppToc.EWsTocErrorCode | null = null

    if (data.content && data.content.data && data.content.data.identifier) {
      content = data.content.data
      if (needResumeData) {
        this.resumeDataSubscription = this.resumeData.subscribe(
          (dataResult: any) => {
            if (dataResult && dataResult.length) {
              this.mapCompletionPercentage(content, dataResult)
            }
          },
          () => {
            // tslint:disable-next-line: no-console
            this.logger.log('error on resumeDataSubscription')
          },
        )
      }
    } else {
      if (data.error) {
        errorCode = NsAppToc.EWsTocErrorCode.API_FAILURE
      } else {
        errorCode = NsAppToc.EWsTocErrorCode.NO_DATA
      }
    }
    return {
      content,
      errorCode,
    }
  }

  mapCompletionPercentage(content: NsContent.IContent | null, dataResult: any) {
    if (content && content.children) {
      content.children.forEach(child => {
        const foundContent = dataResult.find((el: any) => el.contentId === child.identifier)
        if (foundContent) {
          child.completionPercentage = foundContent.completionPercentage
          child.completionStatus = foundContent.status
        }
        // else {
        if (child.children) {
          this.mapCompletionPercentage(child, dataResult)
        }
        // }
      })
    }
  }

  getTocStructure(
    content: NsContent.IContent,
    tocStructure: NsAppToc.ITocStructure,
  ): NsAppToc.ITocStructure {
    if (!content) {
      return tocStructure
    }
    const isResource = content.contentType === 'Resource' || content.contentType === 'Knowledge Artifact'
    if (!isResource) {
      return this.applyContainerNode(content, tocStructure)
    }
    this.tallyResourceMimeType(content, tocStructure)
    return tocStructure
  }

  private applyContainerNode(
    content: NsContent.IContent,
    tocStructure: NsAppToc.ITocStructure,
  ): NsAppToc.ITocStructure {
    if (content.contentType === 'Course') {
      tocStructure.course += 1
    } else if (content.contentType === 'Collection') {
      tocStructure.learningModule += 1
    }
    content.children.forEach(child => {
      // tslint:disable-next-line: no-parameter-reassignment
      tocStructure = this.getTocStructure(child, tocStructure)
    })
    return tocStructure
  }

  private tallyResourceMimeType(content: NsContent.IContent, tocStructure: NsAppToc.ITocStructure): void {
    switch (content.mimeType) {
      case NsContent.EMimeTypes.HANDS_ON:
        tocStructure.handsOn += 1
        break
      case NsContent.EMimeTypes.MP3:
        tocStructure.podcast += 1
        break
      case NsContent.EMimeTypes.MP4:
      case NsContent.EMimeTypes.M3U8:
        tocStructure.video += 1
        break
      case NsContent.EMimeTypes.INTERACTION:
        tocStructure.interactiveVideo += 1
        break
      case NsContent.EMimeTypes.PDF:
        tocStructure.pdf += 1
        break
      case NsContent.EMimeTypes.HTML:
        tocStructure.webPage += 1
        break
      case NsContent.EMimeTypes.QUIZ:
        if (content.resourceType === 'Assessment') {
          tocStructure.assessment += 1
        } else {
          tocStructure.quiz += 1
        }
        break
      case NsContent.EMimeTypes.WEB_MODULE:
        tocStructure.webModule += 1
        break
      case NsContent.EMimeTypes.YOUTUBE:
        tocStructure.youtube += 1
        break
      default:
        tocStructure.other += 1
        break
    }
  }

  filterToc(
    content: NsContent.IContent,
    filterCategory: NsContent.EFilterCategory = NsContent.EFilterCategory.ALL,
  ): NsContent.IContent | null {
    if (content.contentType === 'Resource' || content.contentType === 'Knowledge Artifact') {
      return this.filterUnitContent(content, filterCategory) ? content : null
    }
    const filteredChildren: NsContent.IContent[] = content.children
      .map(childContent => this.filterToc(childContent, filterCategory))
      .filter(unitContent => Boolean(unitContent)) as NsContent.IContent[]
    if (filteredChildren && filteredChildren.length) {
      return {
        ...content,
        children: filteredChildren,
      }
    }
    return null
  }

  filterUnitContent(
    content: NsContent.IContent,
    filterCategory: NsContent.EFilterCategory = NsContent.EFilterCategory.ALL,
  ): boolean {
    switch (filterCategory) {
      case NsContent.EFilterCategory.LEARN:
        return (
          !NsContentConstants.VALID_PRACTICE_RESOURCES.has(content.resourceType) &&
          !NsContentConstants.VALID_ASSESSMENT_RESOURCES.has(content.resourceType)
        )
      case NsContent.EFilterCategory.PRACTICE:
        return NsContentConstants.VALID_PRACTICE_RESOURCES.has(content.resourceType)
      case NsContent.EFilterCategory.ASSESS:
        return NsContentConstants.VALID_ASSESSMENT_RESOURCES.has(content.resourceType)
      case NsContent.EFilterCategory.ALL:
      default:
        return true
    }
  }
  fetchContentAnalyticsClientData(contentId: string) {
    if (this.analyticsFetchStatus !== 'fetching' && this.analyticsFetchStatus !== 'done') {
      this.getContentAnalyticsClient(contentId)
    }
  }
  private getContentAnalyticsClient(contentId: string) {
    this.analyticsFetchStatus = 'fetching'
    const url = API_END_POINTS.CONTENT_ANALYTICS(contentId)
    this.http.get(url).subscribe(
      result => {
        this.analyticsFetchStatus = 'done'
        this.analyticsReplaySubject.next(result)
      },
      () => {
        this.analyticsReplaySubject.next(null)
        this.analyticsFetchStatus = 'done'
      },
    )
  }

  fetchContentAnalyticsData(contentId: string) {
    if (this.analyticsFetchStatus !== 'fetching' && this.analyticsFetchStatus !== 'done') {
      this.getContentAnalytics(contentId)
    }
  }
  private getContentAnalytics(contentId: string) {
    this.analyticsFetchStatus = 'fetching'
    const url = `${API_END_POINTS.LA_LA_USER}?refinementfilter=${encodeURIComponent(
      '"source":["Wingspan","Learning Hub"]',
    )}$${encodeURIComponent(`"courseCode": ["${contentId}"]`)}`
    this.http.get(url).subscribe(
      result => {
        this.analyticsFetchStatus = 'done'
        this.analyticsReplaySubject.next(result)
      },
      () => {
        this.analyticsReplaySubject.next(null)
        this.analyticsFetchStatus = 'done'
      },
    )
  }

  clearAnalyticsData() {
    if (this.analyticsReplaySubject) {
      this.analyticsReplaySubject.unsubscribe()
    }
  }

  fetchContentParents(contentId: string): Observable<NsContent.IContentMinimal[]> {
    return this.http.get<NsContent.IContentMinimal[]>(
      `${API_END_POINTS.CONTENT_PARENTS}/${contentId}`,
    )
  }
  fetchContentWhatsNext(
    contentId: string,
    contentType?: string,
  ): Observable<NsContent.IContentMinimal[]> {
    if (contentType) {
      return this.http.get<NsContent.IContentMinimal[]>(
        `${API_END_POINTS.CONTENT_NEXT}/${contentId}?contentType=${contentType}`,
      )
    }
    return this.http.get<NsContent.IContentMinimal[]>(
      `${API_END_POINTS.CONTENT_NEXT}/${contentId}?ts=${new Date().getTime()}`,
    )
  }

  fetchMoreLikeThisPaid(contentId: string): Observable<NsContent.IContentMinimal[]> {
    return this.http.get<NsContent.IContentMinimal[]>(
      `${API_END_POINTS.CONTENT_NEXT
      }/${contentId}?exclusiveContent=true&ts=${new Date().getTime()}`,
    )
  }

  fetchMoreLikeThisFree(contentId: string): Observable<NsContent.IContentMinimal[]> {
    return this.http.get<NsContent.IContentMinimal[]>(
      `${API_END_POINTS.CONTENT_NEXT
      }/${contentId}?exclusiveContent=false&ts=${new Date().getTime()}`,
    )
  }

  fetchContentCohorts(
    cohortType: NsCohorts.ECohortTypes,
    contentId: string,
  ): Observable<NsCohorts.ICohortsContent[]> {
    return this.http.get<NsCohorts.ICohortsContent[]>(API_END_POINTS.COHORTS(cohortType, contentId))
  }
  fetchExternalContentAccess(contentId: string): Observable<{ hasAccess: boolean }> {
    return this.http.get<{ hasAccess: boolean }>(API_END_POINTS.EXTERNAL_CONTENT(contentId))
  }
  fetchCohortGroupUsers(groupId: number) {
    return this.http.get<NsCohorts.ICohortsGroupUsers[]>(API_END_POINTS.COHORTS_GROUP_USER(groupId))
  }
  fetchMoreLikeThis(contentId: string, contentType: string): Observable<any> {
    return this.http.get<NsContent.IContent[]>(
      API_END_POINTS.RELATED_RESOURCE(contentId, contentType),
    )
  }

  fetchPostAssessmentStatus(contentId: string) {
    return this.http.get<{ result: NsAppToc.IPostAssessment[] }>(
      API_END_POINTS.POST_ASSESSMENT(contentId),
    )
  }

  fetchContentParent(contentId: string, data: NsAppToc.IContentParentReq, forPreview = false) {
    return this.http.post<NsAppToc.IContentParentResponse>(
      forPreview
        ? API_END_POINTS.CONTENT_AUTH_PARENT(
          contentId,
          this.configSvc.rootOrg || '',
          this.configSvc.org ? this.configSvc.org[0] : '',
        )
        : API_END_POINTS.CONTENT_PARENT(contentId),
      data,
    )
  }

  createBatch(batchData: any) {
    return this.http.post(
      API_END_POINTS.BATCH_CREATE,
      { request: batchData },
    )
  }
  updateBatchData() {
    this.batchReplaySubject.next(undefined)
  }

  getNode(): boolean {
    return this.gatingEnabled
  }

  setNode(value: any) {
    this.gatingEnabled = value
  }
}
