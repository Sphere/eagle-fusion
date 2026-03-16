import { HttpClient, HttpErrorResponse } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { ConfigurationsService } from '@ws-widget/utils/src/lib/services/configurations.service'
import { Observable, of, throwError, Subject, BehaviorSubject } from 'rxjs'
import { catchError, retry, map } from 'rxjs/operators'
import { NsContentStripMultiple } from '../content-strip-multiple/content-strip-multiple.model'
import { NsContent } from './widget-content.model'
import { NSSearch } from './widget-search.model'
import { LanguageService } from '../../../../../../src/app/services/language.service'
import { LoggerService } from '../../../../utils/src/public-api'
import { API_END_POINTS } from '../../../../../../src/app/constants/apiConstants'
@Injectable({
  providedIn: 'root',
})
export class WidgetContentService {
  private messageSource = new Subject<any>()
  public currentMessage = this.messageSource.asObservable()

  private backSource = new Subject<any>()
  public backMessage = this.backSource.asObservable()

  private workSource = new Subject<any>()
  public workMessage = this.workSource.asObservable()

  public _updateValue = new BehaviorSubject<any>(undefined)
  // Observable navItem stream
  updateValue$ = this._updateValue.asObservable()
  _showConformation: any
  constructor(
    private http: HttpClient,
    private configSvc: ConfigurationsService,
    private languageSvc: LanguageService,
    private logger: LoggerService
  ) { }

  fetchMarkAsCompleteMeta(identifier: string): Promise<any> {
    const url = API_END_POINTS.MARK_AS_COMPLETE_META(identifier)
    return this.http.get(url).toPromise()
  }
  changeMessage(message: any) {
    this.messageSource.next(message)
  }
  changeBack(message: string) {
    this.backSource.next(message)
  }
  changeWork(msg: any) {
    this.logger.log('came1')
    this.workSource.next(msg)
  }

  // tslint:disable-next-line:max-line-length
  fetchUserBatchList(userId: string | undefined): Observable<NsContent.ICourse[]> {
    let path = ''
    path = API_END_POINTS.FETCH_USER_ENROLLMENT_LIST_COMP(userId)
    return this.http
      .get(path)
      .pipe(
        catchError(this.handleError),
        map(
          (data: any) => data.result.courses
        )
      )
  }
  fetchGeneralAndRcCertificates(): any {
    let path = ''
    path = API_END_POINTS.FETCH_GENERAL_RC_CERTIFICATE()
    return this.http
      .get(path)
      .pipe(
        catchError(this.handleError)
      )
  }
  fetchHierarchyContent(contentId: string): Observable<NsContent.IContent> {
    const url = API_END_POINTS.CONTENT_HIERARCHY(contentId, 'detail')
    const apiData = this.http
      .get<NsContent.IContent>(url)
      .pipe(retry(1))
    return apiData
  }

  readContentV2(id: string): Observable<NsContent.IContent> {
    let url = API_END_POINTS.CONTENT_READ(id)
    const apiData = this.http
      .get<NsContent.IContent>(url)
      .pipe(retry(1))
    return apiData
  }

  processCertificate(req: any): Observable<any> {
    const url = API_END_POINTS.BATCH_CERT_ISSUE
    return this.http.post<any>(url, req)
  }

  downloadCertificateAPI(certificateId: string): Observable<any> {
    const url = API_END_POINTS.DOWNLOAD_CERTIFICATE(certificateId)
    const apiData = this.http
      .get<any>(url)
      .pipe(retry(1))
    return apiData
  }

  getCertificateAPI(certificateId: string): Observable<any> {
    const url = API_END_POINTS.DOWNLOAD_CERTIFICATE(certificateId)
    const apiData = this.http
      .get<any>(url)
      .pipe(retry(1), map(res => this._updateValue.next({ [certificateId]: res.result.printUri })))
    return apiData
  }

  fetchContent(
    contentId: string,
    hierarchyType: 'all' | 'minimal' | 'detail' = 'detail',
    _additionalFields: string[] = [],
    primaryCategory?: string | null,
  ): Observable<NsContent.IContent> {
    let url = ''
    if (primaryCategory && this.isResource(primaryCategory)) {
      url = API_END_POINTS.CONTENT_READ(contentId)
    } else {
      url = API_END_POINTS.CONTENT_HIERARCHY(contentId, hierarchyType)
    }
    const apiData = this.http
      .get<NsContent.IContent>(url)
      .pipe(retry(1))
    return apiData
  }

  isResource(primaryCategory: string) {
    if (primaryCategory) {
      const isResource = primaryCategory === NsContent.EResourcePrimaryCategories.LEARNING_RESOURCE
      return isResource
    }
    return false
  }

  fetchAuthoringContent(contentId: string): Observable<NsContent.IContent> {
    const url = `${API_END_POINTS.AUTHORING_CONTENT}/${contentId}`
    return this.http.get<NsContent.IContent>(url).pipe(retry(1))
  }
  fetchMultipleContent(ids: string[]): Observable<NsContent.IContent[]> {
    return this.http.get<NsContent.IContent[]>(
      `${API_END_POINTS.MULTIPLE_CONTENT}/${ids.join(',')}`,
    )
  }
  fetchCollectionHierarchy(type: string, id: string, pageNumber: number = 0, pageSize: number = 1) {
    return this.http.get<NsContent.ICollectionHierarchyResponse>(
      `${API_END_POINTS.COLLECTION_HIERARCHY(
        type,
        id,
      )}?pageNumber=${pageNumber}&pageSize=${pageSize}`,
    )
  }
  enrollUserToBatch(req: any) {
    return this.http
      .post(API_END_POINTS.ENROLL_BATCH, req)
      .toPromise()
  }
  submitCourseRating(req: any) {
    return this.http
      .post(API_END_POINTS.COURSE_RATING, req)
      .toPromise()
  }
  readCourseRating(req: any) {
    return this.http
      .post(API_END_POINTS.READ_COURSE_RATING, req)
      .toPromise()
  }
  readCourseRatingSummary(req: any) {
    return this.http
      .get(`${API_END_POINTS.READ_COURSE_RATING_SUMMARY}?courseId=${req.activityId}`)
      .toPromise()
  }
  fetchContentLikes(contentIds: { content_id: string[] }) {
    return this.http
      .post<{ [identifier: string]: number }>(API_END_POINTS.CONTENT_LIKES, contentIds)
      .toPromise()
  }
  fetchContentRatings(contentIds: { contentIds: string[] }) {
    return this.http
      .post(`${API_END_POINTS.CONTENT_RATING}/rating`, contentIds)
      .toPromise()
  }

  fetchContentHistory(contentId: string): Observable<NsContent.IContinueLearningData> {
    return this.http.get<NsContent.IContinueLearningData>(
      `${API_END_POINTS.CONTENT_HISTORY}/${contentId}`,
    )
  }

  fetchContentHistoryV2(req: NsContent.IContinueLearningDataReq): Observable<NsContent.IContinueLearningData> {
    req.request.fields = ['progressdetails']
    return this.http.post<NsContent.IContinueLearningData>(
      `${API_END_POINTS.CONTENT_HISTORYV2}/${req.request.courseId}`, req
    )
  }
  // async continueLearning(id: string, collectionId?: string, collectionType?: string): Promise<any> {
  //   return new Promise(async resolve => {
  //     if (collectionType &&
  //       collectionType.toLowerCase() === 'playlist') {
  //       const reqBody = {
  //         contextPathId: collectionId ? collectionId : id,
  //         resourceId: id,
  //         data: JSON.stringify({
  //           timestamp: Date.now(),
  //           contextFullPath: [collectionId, id],
  //         }),
  //         dateAccessed: Date.now(),
  //         contextType: 'playlist',
  //       }
  //       await this.saveContinueLearning(reqBody).toPromise().catch().finally(() => {
  //         resolve(true)
  //       }
  //       )
  //     } else {
  //       const reqBody = {
  //         contextPathId: collectionId ? collectionId : id,
  //         resourceId: id,
  //         data: JSON.stringify({ timestamp: Date.now() }),
  //         dateAccessed: Date.now(),
  //       }
  //       await this.saveContinueLearning(reqBody).toPromise().catch().finally(() => {
  //         resolve(true)
  //       })
  //     }
  //   })
  // }
  // saveContinueLearning(content: NsContent.IViewerContinueLearningRequest): Observable<any> {
  //   const url = API_END_POINTS.USER_CONTINUE_LEARNING
  //   return this.http.post<any>(url, content)
  // }

  setS3Cookie(
    contentId: string,
    // _path: string,
  ): Observable<any> {
    return this.http
      .post(API_END_POINTS.SET_S3_COOKIE, { contentId })
      .pipe(catchError(_err => of(true)))
  }

  setS3ImageCookie(): Observable<any> {
    return this.http.post(API_END_POINTS.SET_S3_IMAGE_COOKIE, {}).pipe(catchError(_err => of(true)))
  }

  fetchManifest(url: string): Observable<any> {
    return this.http.post(API_END_POINTS.FETCH_MANIFEST, { url })
  }
  fetchWebModuleContent(url: string): Observable<any> {
    return this.http.get(`${API_END_POINTS.FETCH_WEB_MODULE_FILES}?url=${encodeURIComponent(url)}`)
  }
  search(req: NSSearch.ISearchRequest): Observable<NSSearch.ISearchApiResult> {
    req.query = req.query || ''
    return this.http.post<NSSearch.ISearchApiResult>(API_END_POINTS.CONTENT_SEARCH_V5, {
      request: req,
    })
  }

  searchRegionRecommendation(
    req: NSSearch.ISearchOrgRegionRecommendationRequest,
  ): Observable<NsContentStripMultiple.IContentStripResponseApi> {
    req.query = req.query || ''
    req.preLabelValue =
      (req.preLabelValue || '') +
      ((this.configSvc.userProfile && this.configSvc.userProfile.country) || '')
    req.filters = {
      ...req.filters,
      labels: [req.preLabelValue || ''],
    }
    return this.http.post<NsContentStripMultiple.IContentStripResponseApi>(
      API_END_POINTS.CONTENT_SEARCH_REGION_RECOMMENDATION,
      { request: req },
    )
  }
  searchV6(req: any) {
    // Use LanguageService instead of checking location.href
    if (this.languageSvc.isHindi()) {
      req.request.filters.lang = 'hi'
    }
    req.query = req.query || ''
    req.sort = [
      {
        lastUpdatedOn: 'desc',
      },
    ]
    return this.http.post<NSSearch.ISearchV6ApiResult>(API_END_POINTS.PUBLIC_CONTENT_SEARCH, req)
  }

  publicContentSearch(req: any) {
    // Use LanguageService instead of checking location.href
    if (this.languageSvc.isHindi()) {
      req.request.filters.lang = 'hi'
    }
    req.query = req.query || ''
    return this.http.post<NSSearch.ISearchV6ApiResult>(API_END_POINTS.PUBLIC_CONTENT_SEARCH,
      req,
    )
  }
  fetchContentRating(contentId: string): Observable<{ rating: number }> {
    return this.http.get<{ rating: number }>(`${API_END_POINTS.CONTENT_RATING}/${contentId}`)
  }
  deleteContentRating(contentId: string): Observable<any> {
    return this.http.delete(`${API_END_POINTS.CONTENT_RATING}/${contentId}`)
  }
  addContentRating(contentId: string, data: { rating: number }): Observable<any> {
    return this.http.post<any>(`${API_END_POINTS.CONTENT_RATING}/${contentId}`, data)
  }

  getFirstChildInHierarchy(content: NsContent.IContent): NsContent.IContent {
    if (!(content.children || []).length) {
      return content
    }
    if (
      content.contentType === 'Learning Path' &&
      !(content.artifactUrl && content.artifactUrl.length)
    ) {
      const child = content.children[0]
      return this.getFirstChildInHierarchy(child)
    }
    if (
      content.contentType === 'Resource' ||
      content.contentType === 'Knowledge Artifact' ||
      content.contentType === 'Learning Path'
    ) {
      return content
    }
    const firstChild = content.children[0]
    const resultContent = this.getFirstChildInHierarchy(firstChild)
    return resultContent
  }

  getRegistrationStatus(source: string): Promise<{ hasAccess: boolean; registrationUrl?: string }> {
    return this.http.get<any>(`${API_END_POINTS.REGISTRATION_STATUS}/${source}`).toPromise()
  }

  fetchConfig(url: string) {
    return this.http.get<any>(url)
  }

  loginAuth(req: any): Observable<any> {
    return this.http.post<any>(API_END_POINTS.LOGIN_USER, req).pipe(retry(1),
      map(
        (data: any) => data
      )
    )
  }
  googleAuthenticate(req: any): Observable<any> {
    return this.http.post<any>(API_END_POINTS.GOOGLE_AUTHENTICATE, req).pipe(catchError(this.handleError))
  }
  handleError(error: HttpErrorResponse) {
    return throwError(error)
  }
  fetchCourseBatches(req: any): Observable<NsContent.IBatchListResponse> {
    return this.http
      .post<NsContent.IBatchListResponse>(API_END_POINTS.COURSE_BATCH_LIST, req)
      .pipe(
        retry(1),
        map(
          (data: any) => data.result.response
        )
      )
  }
  fetchCourseRemommendations(profession: any): Observable<NsContent.ICourse[]> {
    let path = API_END_POINTS.COURSE_RECOMENDATION(profession)
    return this.http
      .get(path)
      .pipe(
        catchError(this.handleError),
        map(
          (data: any) => data
        )
      )

  }
  COURSE_RECOMMENDATION_V2(req: any): Observable<NsContent.ICourse[]> {
    let payload = {
      offset: 1,
      limit: 300,
      "search_text": req.designation,
      "search_fieldnames": [
        "rolesMapped"
      ],
      "course_status": "Live",
      "primaryCategory": "Course",
      orgId: req.orgId,
      language: req.language
    }
    return this.http
      .post<NsContent.ICourse[]>(API_END_POINTS.COURSE_RECOMMENDATION_V2, payload)
      .pipe(
        catchError(this.handleError),
        map(
          (data: any) => data
        )
      )
  }

  getLatestCourse() {
    return this.http.get<any>(`${API_END_POINTS.LATEST_HOMEPAGE_COURSE}`)
  }

  set showConformation(completionPersentage: any) {
    this._showConformation = completionPersentage !== 100 ? true : false
    localStorage.setItem('showConformation', this._showConformation)
  }

  get showConformation() {
    if (this._showConformation === undefined) {
      let showConformation = localStorage.getItem('showConformation')
      this._showConformation = showConformation === 'false' ? false : true
    }
    return this._showConformation
  }

  getCouseByContentSearch(identifiers: string[], includeRating: boolean = false, requestBody?: any): Observable<any> {
    const req = requestBody || {
      request: {
        filters: {
          primaryCategory: ['Course'],
          contentType: ['Course'],
          status: ['Live'],
          identifier: identifiers,
        },
        offset: '0',
      },
      query: '',
      sort: [{ lastUpdatedOn: 'desc' }],
    }
    const url = includeRating
      ? `${API_END_POINTS.CONTENT_SEARCH}?rating=true`
      : API_END_POINTS.CONTENT_SEARCH
    return this.http.post<any>(url, req).pipe(catchError(this.handleError))
  }
}
