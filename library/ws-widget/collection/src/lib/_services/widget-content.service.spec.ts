import { HttpClient } from '@angular/common/http'
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing'
import { TestBed } from '@angular/core/testing'
import { API_END_POINTS } from '../../../../../../src/app/constants/apiConstants'
import { WidgetContentService } from './widget-content.service'

describe('WidgetContentService', () => {
  let service: WidgetContentService
  let httpMock: HttpTestingController
  let configSvcMock: any
  let languageSvcMock: any
  let loggerMock: any
  let cacheServiceMock: any

  beforeEach(() => {
    configSvcMock = { userProfile: { country: 'IN' } }
    languageSvcMock = { isHindi: jest.fn().mockReturnValue(false) }
    loggerMock = { log: jest.fn(), error: jest.fn(), warn: jest.fn() }
    cacheServiceMock = { getCourseHierarchy: jest.fn().mockReturnValue('cached-observable') }

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    })
    const httpClient = TestBed.inject(HttpClient)
    httpMock = TestBed.inject(HttpTestingController)
    service = new WidgetContentService(
      httpClient,
      configSvcMock,
      languageSvcMock,
      loggerMock,
      cacheServiceMock,
    )
  })

  afterEach(() => {
    httpMock.verify()
  })

  it('should create', () => {
    expect(service).toBeTruthy()
  })

  it('fetchMarkAsCompleteMeta should GET and resolve', async () => {
    const promise = service.fetchMarkAsCompleteMeta('c1')
    const req = httpMock.expectOne(API_END_POINTS.MARK_AS_COMPLETE_META('c1'))
    expect(req.request.method).toBe('GET')
    req.flush({ ok: true })
    await expect(promise).resolves.toEqual({ ok: true })
  })

  it('changeMessage should emit on currentMessage', done => {
    service.currentMessage.subscribe(msg => {
      expect(msg).toBe('hello')
      done()
    })
    service.changeMessage('hello')
  })

  it('changeBack should emit on backMessage', done => {
    service.backMessage.subscribe(msg => {
      expect(msg).toBe('back')
      done()
    })
    service.changeBack('back')
  })

  it('changeWork should log and emit on workMessage', done => {
    service.workMessage.subscribe(msg => {
      expect(msg).toBe('work')
      expect(loggerMock.log).toHaveBeenCalledWith('came1')
      done()
    })
    service.changeWork('work')
  })

  it('fetchUserBatchList should GET and map to result.courses', done => {
    service.fetchUserBatchList('u1').subscribe(courses => {
      expect(courses).toEqual(['course1'])
      done()
    })
    const req = httpMock.expectOne(API_END_POINTS.FETCH_USER_ENROLLMENT_LIST_COMP('u1'))
    req.flush({ result: { courses: ['course1'] } })
  })

  it('fetchGeneralAndRcCertificates should GET', () => {
    service.fetchGeneralAndRcCertificates().subscribe()
    const req = httpMock.expectOne(API_END_POINTS.FETCH_GENERAL_RC_CERTIFICATE())
    req.flush({})
  })

  it('fetchHierarchyContent should delegate to cache service', () => {
    const result = service.fetchHierarchyContent('c1')
    expect(cacheServiceMock.getCourseHierarchy).toHaveBeenCalledWith('c1')
    expect(result).toBe('cached-observable')
  })

  it('readContentV2 should return error observable when id is undefined', done => {
    service.readContentV2('undefined').subscribe({
      error: err => {
        expect(err.message).toBe('Content ID is required')
        done()
      },
    })
  })

  it('readContentV2 should return error observable when id is empty', done => {
    service.readContentV2('').subscribe({
      error: err => {
        expect(err.message).toBe('Content ID is required')
        done()
      },
    })
  })

  it('readContentV2 should GET when id is valid', () => {
    service.readContentV2('c1').subscribe()
    const req = httpMock.expectOne('/apis/proxies/v8/action/content/v3/read/c1')
    req.flush({})
  })

  it('processCertificate should POST', () => {
    service.processCertificate({ a: 1 }).subscribe()
    const req = httpMock.expectOne(API_END_POINTS.BATCH_CERT_ISSUE)
    expect(req.request.method).toBe('POST')
    req.flush({})
  })

  it('downloadCertificateAPI should GET', () => {
    service.downloadCertificateAPI('cert1').subscribe()
    const req = httpMock.expectOne(API_END_POINTS.DOWNLOAD_CERTIFICATE('cert1'))
    req.flush({})
  })

  it('getCertificateAPI should GET and update _updateValue', done => {
    service.updateValue$.subscribe(val => {
      if (val) {
        expect(val).toEqual({ cert1: 'uri1' })
        done()
      }
    })
    service.getCertificateAPI('cert1').subscribe()
    const req = httpMock.expectOne(API_END_POINTS.DOWNLOAD_CERTIFICATE('cert1'))
    req.flush({ result: { printUri: 'uri1' } })
  })

  it('fetchContent should return error observable when contentId is undefined', done => {
    service.fetchContent('undefined').subscribe({
      error: err => {
        expect(err.message).toBe('Content ID is required')
        done()
      },
    })
  })

  it('fetchContent should GET directly when primaryCategory is a resource', () => {
    service.fetchContent('c1', 'detail', [], 'Learning Resource').subscribe()
    const req = httpMock.expectOne('/apis/proxies/v8/action/content/v3/read/c1')
    req.flush({})
  })

  it('fetchContent should use cache service for collections', () => {
    const result = service.fetchContent('c1', 'detail', [], null)
    expect(cacheServiceMock.getCourseHierarchy).toHaveBeenCalledWith('c1')
    expect(result).toBe('cached-observable')
  })

  it('isResource should return true for learning resource category', () => {
    expect(service.isResource('Learning Resource' as any)).toBe(true)
  })

  it('isResource should return false for empty category', () => {
    expect(service.isResource('' as any)).toBe(false)
  })

  it('fetchAuthoringContent should GET', () => {
    service.fetchAuthoringContent('c1').subscribe()
    const req = httpMock.expectOne(`${API_END_POINTS.AUTHORING_CONTENT}/c1`)
    req.flush({})
  })

  it('fetchMultipleContent should GET with joined ids', () => {
    service.fetchMultipleContent(['a', 'b']).subscribe()
    const req = httpMock.expectOne(`${API_END_POINTS.MULTIPLE_CONTENT}/a,b`)
    req.flush([])
  })

  it('fetchCollectionHierarchy should GET with pageNumber/pageSize', () => {
    service.fetchCollectionHierarchy('type1', 'id1').subscribe()
    const req = httpMock.expectOne(
      `${API_END_POINTS.COLLECTION_HIERARCHY('type1', 'id1')}?pageNumber=0&pageSize=1`,
    )
    req.flush({})
  })

  it('enrollUserToBatch should POST', async () => {
    const promise = service.enrollUserToBatch({ a: 1 })
    const req = httpMock.expectOne(API_END_POINTS.ENROLL_BATCH)
    req.flush({})
    await expect(promise).resolves.toEqual({})
  })

  it('submitCourseRating should POST', async () => {
    const promise = service.submitCourseRating({ a: 1 })
    const req = httpMock.expectOne(API_END_POINTS.COURSE_RATING)
    req.flush({})
    await expect(promise).resolves.toEqual({})
  })

  it('readCourseRating should POST', async () => {
    const promise = service.readCourseRating({ a: 1 })
    const req = httpMock.expectOne(API_END_POINTS.READ_COURSE_RATING)
    req.flush({})
    await expect(promise).resolves.toEqual({})
  })

  it('readCourseRatingSummary should GET with activityId param', async () => {
    const promise = service.readCourseRatingSummary({ activityId: 'a1' })
    const req = httpMock.expectOne(`${API_END_POINTS.READ_COURSE_RATING_SUMMARY}?courseId=a1`)
    req.flush({})
    await expect(promise).resolves.toEqual({})
  })

  it('fetchContentLikes should POST', async () => {
    const promise = service.fetchContentLikes({ content_id: ['a'] })
    const req = httpMock.expectOne(API_END_POINTS.CONTENT_LIKES)
    req.flush({})
    await expect(promise).resolves.toEqual({})
  })

  it('fetchContentRatings should POST', async () => {
    const promise = service.fetchContentRatings({ contentIds: ['a'] })
    const req = httpMock.expectOne(`${API_END_POINTS.CONTENT_RATING}/rating`)
    req.flush({})
    await expect(promise).resolves.toEqual({})
  })

  it('fetchContentHistory should GET', () => {
    service.fetchContentHistory('c1').subscribe()
    const req = httpMock.expectOne(`${API_END_POINTS.CONTENT_HISTORY}/c1`)
    req.flush({})
  })

  it('fetchContentHistoryV2 should POST with fields set', () => {
    const req1 = { request: { courseId: 'c1', fields: [] } } as any
    service.fetchContentHistoryV2(req1).subscribe()
    const req = httpMock.expectOne(`${API_END_POINTS.CONTENT_HISTORYV2}/c1`)
    expect(req1.request.fields).toEqual(['progressdetails'])
    req.flush({})
  })

  it('setS3Cookie should POST and recover from error', done => {
    service.setS3Cookie('c1').subscribe(val => {
      expect(val).toBe(true)
      done()
    })
    const req = httpMock.expectOne(API_END_POINTS.SET_S3_COOKIE)
    req.error(new ProgressEvent('error'))
  })

  it('setS3ImageCookie should POST and recover from error', done => {
    service.setS3ImageCookie().subscribe(val => {
      expect(val).toBe(true)
      done()
    })
    const req = httpMock.expectOne(API_END_POINTS.SET_S3_IMAGE_COOKIE)
    req.error(new ProgressEvent('error'))
  })

  it('fetchManifest should POST', () => {
    service.fetchManifest('url1').subscribe()
    const req = httpMock.expectOne(API_END_POINTS.FETCH_MANIFEST)
    req.flush({})
  })

  it('fetchWebModuleContent should GET with encoded url', () => {
    service.fetchWebModuleContent('http://a.com').subscribe()
    const req = httpMock.expectOne(`${API_END_POINTS.FETCH_WEB_MODULE_FILES}?url=${encodeURIComponent('http://a.com')}`)
    req.flush({})
  })

  it('search should POST with default query', () => {
    service.search({} as any).subscribe()
    const req = httpMock.expectOne(API_END_POINTS.CONTENT_SEARCH_V5)
    expect(req.request.body.request.query).toBe('')
    req.flush({})
  })

  it('searchRegionRecommendation should POST with computed preLabelValue and filters', () => {
    service.searchRegionRecommendation({ preLabelValue: 'x' } as any).subscribe()
    const req = httpMock.expectOne(API_END_POINTS.CONTENT_SEARCH_REGION_RECOMMENDATION)
    expect(req.request.body.request.preLabelValue).toBe('xIN')
    expect(req.request.body.request.filters.labels).toEqual(['xIN'])
    req.flush({})
  })

  it('searchV6 should set hindi lang filter when isHindi true', () => {
    languageSvcMock.isHindi.mockReturnValue(true)
    service.searchV6({ request: { filters: {} } }).subscribe()
    const req = httpMock.expectOne(API_END_POINTS.SEARCH_V7PUBLIC)
    expect(req.request.body.request.filters.lang).toBe('hi')
    req.flush({})
  })

  it('searchV6 should not set lang filter when isHindi false', () => {
    languageSvcMock.isHindi.mockReturnValue(false)
    service.searchV6({ request: { filters: {} } }).subscribe()
    const req = httpMock.expectOne(API_END_POINTS.SEARCH_V7PUBLIC)
    expect(req.request.body.request.filters.lang).toBeUndefined()
    req.flush({})
  })

  it('publicContentSearch should set hindi lang filter when isHindi true', () => {
    languageSvcMock.isHindi.mockReturnValue(true)
    service.publicContentSearch({ request: { filters: {} } }).subscribe()
    const req = httpMock.expectOne(API_END_POINTS.SEARCH_V7PUBLIC)
    expect(req.request.body.request.filters.lang).toBe('hi')
    req.flush({})
  })

  it('fetchContentRating should GET', () => {
    service.fetchContentRating('c1').subscribe()
    const req = httpMock.expectOne(`${API_END_POINTS.CONTENT_RATING}/c1`)
    req.flush({ rating: 5 })
  })

  it('deleteContentRating should DELETE', () => {
    service.deleteContentRating('c1').subscribe()
    const req = httpMock.expectOne(`${API_END_POINTS.CONTENT_RATING}/c1`)
    expect(req.request.method).toBe('DELETE')
    req.flush({})
  })

  it('addContentRating should POST', () => {
    service.addContentRating('c1', { rating: 5 }).subscribe()
    const req = httpMock.expectOne(`${API_END_POINTS.CONTENT_RATING}/c1`)
    expect(req.request.method).toBe('POST')
    req.flush({})
  })

  describe('getFirstChildInHierarchy', () => {
    it('should return content when no children', () => {
      const content = { children: [] } as any
      expect(service.getFirstChildInHierarchy(content)).toBe(content)
    })

    it('should recurse into first child for Learning Path without artifactUrl', () => {
      const leaf = { children: [] }
      const content = { contentType: 'Learning Path', children: [leaf] } as any
      expect(service.getFirstChildInHierarchy(content)).toBe(leaf)
    })

    it('should return content for Resource contentType', () => {
      const content = { contentType: 'Resource', children: [{ children: [] }] } as any
      expect(service.getFirstChildInHierarchy(content)).toBe(content)
    })

    it('should recurse into first child for other types', () => {
      const leaf = { children: [] }
      const content = { contentType: 'Collection', children: [leaf] } as any
      expect(service.getFirstChildInHierarchy(content)).toBe(leaf)
    })
  })

  it('getRegistrationStatus should GET', async () => {
    const promise = service.getRegistrationStatus('src1')
    const req = httpMock.expectOne(`${API_END_POINTS.REGISTRATION_STATUS}/src1`)
    req.flush({ hasAccess: true })
    await expect(promise).resolves.toEqual({ hasAccess: true })
  })

  it('fetchConfig should GET', () => {
    service.fetchConfig('http://cfg').subscribe()
    const req = httpMock.expectOne('http://cfg')
    req.flush({})
  })

  it('loginAuth should POST and map data', done => {
    service.loginAuth({ a: 1 }).subscribe(data => {
      expect(data).toEqual({ ok: true })
      done()
    })
    const req = httpMock.expectOne(API_END_POINTS.LOGIN_USER)
    req.flush({ ok: true })
  })

  it('googleAuthenticate should POST', () => {
    service.googleAuthenticate({ a: 1 }).subscribe()
    const req = httpMock.expectOne(API_END_POINTS.GOOGLE_AUTHENTICATE)
    req.flush({})
  })

  it('googleAuthenticate should catch errors via handleError', done => {
    service.googleAuthenticate({ a: 1 }).subscribe({
      error: err => {
        expect(err).toBeTruthy()
        done()
      },
    })
    const req = httpMock.expectOne(API_END_POINTS.GOOGLE_AUTHENTICATE)
    req.flush('err', { status: 500, statusText: 'Server Error' })
  })

  it('fetchCourseBatches should POST and map result.response', done => {
    service.fetchCourseBatches({ a: 1 }).subscribe(response => {
      expect(response).toEqual({ batches: [] })
      done()
    })
    const req = httpMock.expectOne(API_END_POINTS.COURSE_BATCH_LIST)
    req.flush({ result: { response: { batches: [] } } })
  })

  it('getLatestCourse should GET', () => {
    service.getLatestCourse().subscribe()
    const req = httpMock.expectOne(API_END_POINTS.LATEST_HOMEPAGE_COURSE)
    req.flush({})
  })

  describe('showConformation', () => {
    it('should set false when completion is 100', () => {
      service.showConformation = 100
      expect(service.showConformation).toBe(false)
    })

    it('should set true when completion is not 100', () => {
      service.showConformation = 50
      expect(service.showConformation).toBe(true)
    })

    it('getter should read from localStorage when unset', () => {
      ;(service as any)._showConformation = undefined
      localStorage.setItem('showConformation', 'false')
      expect(service.showConformation).toBe(false)
    })

    it('getter should default true when localStorage value is not false', () => {
      ;(service as any)._showConformation = undefined
      localStorage.setItem('showConformation', 'true')
      expect(service.showConformation).toBe(true)
    })
  })

  it('getCouseByContentSearch should POST default request without rating', () => {
    service.getCouseByContentSearch(['id1']).subscribe()
    const req = httpMock.expectOne(API_END_POINTS.CONTENT_SEARCH)
    expect(req.request.body.request.filters.identifier).toEqual(['id1'])
    req.flush({})
  })

  it('getCouseByContentSearch should POST with rating query param when includeRating true', () => {
    service.getCouseByContentSearch(['id1'], true).subscribe()
    const req = httpMock.expectOne(`${API_END_POINTS.CONTENT_SEARCH}?rating=true`)
    req.flush({})
  })

  it('getCouseByContentSearch should use provided requestBody when given', () => {
    const customReq = { request: { custom: true } }
    service.getCouseByContentSearch(['id1'], false, customReq).subscribe()
    const req = httpMock.expectOne(API_END_POINTS.CONTENT_SEARCH)
    expect(req.request.body).toBe(customReq)
    req.flush({})
  })

  it('getFilteredCourseSearchResults should POST', () => {
    service.getFilteredCourseSearchResults('c1').subscribe()
    const req = httpMock.expectOne(API_END_POINTS.SEARCH_V7PUBLIC)
    req.flush({})
  })

  it('setAshaData/getAshaData should update and read isAshaSubject', () => {
    service.setAshaData(true)
    expect(service.getAshaData()).toBe(true)
  })

  it('isAsha$ should emit updates from setAshaData', done => {
    service.isAsha$.subscribe(val => {
      if (val === true) {
        done()
      }
    })
    service.setAshaData(true)
  })

  it('setAshaCardData/getAshaCardData should update and read currentAshaCardSubject', () => {
    service.setAshaCardData({ id: 1 })
    expect(service.getAshaCardData()).toEqual({ id: 1 })
  })

  it('isCurrentAshaCard$ should emit updates from setAshaCardData', done => {
    service.isCurrentAshaCard$.subscribe(val => {
      if (val && val.id === 2) {
        done()
      }
    })
    service.setAshaCardData({ id: 2 })
  })
})
