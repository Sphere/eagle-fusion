import { AppTocService } from './app-toc.service'
import { of, throwError } from 'rxjs'
import { NsContent } from '@ws-widget/collection/src/lib/_services/widget-content.model'
import { NsCohorts } from '../models/app-toc.model'

describe('AppTocService', () => {
  let service: AppTocService
  let httpMock: any
  let configSvcMock: any
  let loggerMock: any

  beforeEach(() => {
    httpMock = {
      get: jest.fn(),
      post: jest.fn(),
    }
    configSvcMock = {
      userProfile: null,
      rootOrg: 'root',
      org: ['org1'],
    }
    loggerMock = {
      log: jest.fn(),
    }
    service = new AppTocService(httpMock, configSvcMock, loggerMock)
  })

  it('should create', () => {
    expect(service).toBeTruthy()
  })

  it('should get and set content for widget', () => {
    service.setcontentForWidget({ a: 1 })
    expect(service.getcontentForWidget()).toEqual({ a: 1 })
    service.clearData()
    expect(service.getcontentForWidget()).toBeUndefined()
  })

  it('should get and set subtitleOnBanners', () => {
    service.subtitleOnBanners = true
    expect(service.subtitleOnBanners).toBe(true)
  })

  it('should get and set showDescription', () => {
    service.showDescription = true
    expect(service.showDescription).toBe(true)
  })

  it('should update resume data', done => {
    service.resumeData.subscribe(data => {
      expect(data).toEqual([{ contentId: 'c1' }])
      done()
    })
    service.updateResumaData([{ contentId: 'c1' }])
  })

  describe('showStartButton', () => {
    it('should return show false when content is null', () => {
      expect(service.showStartButton(null)).toEqual({ show: false, msg: '' })
    })

    it('should return youtube forbidden for China users on youtube content', () => {
      configSvcMock.userProfile = { country: 'China' }
      const result = service.showStartButton({
        artifactUrl: 'https://youtube.com/xyz',
        resourceType: 'Resource',
      } as any)
      expect(result).toEqual({ show: false, msg: 'youtubeForbidden' })
    })

    it('should return show true when resourceType is not Certification', () => {
      const result = service.showStartButton({ resourceType: 'Resource' } as any)
      expect(result).toEqual({ show: true, msg: '' })
    })

    it('should return default when resourceType is Certification', () => {
      const result = service.showStartButton({ resourceType: 'Certification' } as any)
      expect(result).toEqual({ show: false, msg: '' })
    })
  })

  describe('initData', () => {
    it('should return content when data is valid', () => {
      const data = { content: { data: { identifier: 'id1' } } } as any
      const result = service.initData(data)
      expect(result.content).toEqual({ identifier: 'id1' })
      expect(result.errorCode).toBeNull()
    })

    it('should subscribe to resumeData when needResumeData is true', () => {
      const content = { identifier: 'id1', children: [{ identifier: 'id1', children: [] }] }
      const data = { content: { data: content } } as any
      service.initData(data, true)
      expect(service.resumeDataSubscription).toBeTruthy()
      service.resumeData.next([{ contentId: 'id1', completionPercentage: 50, status: 2 }])
      expect(content.children[0].completionPercentage).toBe(50)
    })

    it('should return API_FAILURE errorCode when data.error is set', () => {
      const data = { content: {}, error: true } as any
      const result = service.initData(data)
      expect(result.errorCode).toBe('API_FAILURE')
    })

    it('should return NO_DATA errorCode when no content and no error', () => {
      const data = { content: {} } as any
      const result = service.initData(data)
      expect(result.errorCode).toBe('NO_DATA')
    })
  })

  describe('mapCompletionPercentage', () => {
    it('should do nothing when content is null', () => {
      expect(() => service.mapCompletionPercentage(null, [])).not.toThrow()
    })

    it('should map completion percentage on matching children recursively', () => {
      const content: any = {
        children: [
          { identifier: 'a', children: [{ identifier: 'b', children: [] }] },
        ],
      }
      const dataResult = [
        { contentId: 'a', completionPercentage: 10, status: 1 },
        { contentId: 'b', completionPercentage: 20, status: 2 },
      ]
      service.mapCompletionPercentage(content, dataResult)
      expect(content.children[0].completionPercentage).toBe(10)
      expect(content.children[0].children[0].completionPercentage).toBe(20)
    })
  })

  describe('getTocStructure', () => {
    const emptyStructure = () => ({
      assessment: 0, course: 0, handsOn: 0, interactiveVideo: 0, learningModule: 0,
      other: 0, pdf: 0, podcast: 0, quiz: 0, video: 0, webModule: 0, webPage: 0, youtube: 0,
    })

    it('should increment course count', () => {
      const content: any = { contentType: 'Course', children: [] }
      const result = service.getTocStructure(content, emptyStructure())
      expect(result.course).toBe(1)
    })

    it('should increment learningModule count', () => {
      const content: any = { contentType: 'Collection', children: [] }
      const result = service.getTocStructure(content, emptyStructure())
      expect(result.learningModule).toBe(1)
    })

    it('should count resource mimeTypes', () => {
      const mimeTypes = [
        NsContent.EMimeTypes.HANDS_ON,
        NsContent.EMimeTypes.MP3,
        NsContent.EMimeTypes.MP4,
        NsContent.EMimeTypes.INTERACTION,
        NsContent.EMimeTypes.PDF,
        NsContent.EMimeTypes.HTML,
        NsContent.EMimeTypes.QUIZ,
        NsContent.EMimeTypes.WEB_MODULE,
        NsContent.EMimeTypes.YOUTUBE,
        'unknown-mime',
      ]
      mimeTypes.forEach(mimeType => {
        const content: any = { contentType: 'Resource', mimeType }
        const result = service.getTocStructure(content, emptyStructure())
        expect(result).toBeTruthy()
      })
    })

    it('should count assessment vs quiz for QUIZ mimeType', () => {
      const assessmentContent: any = { contentType: 'Resource', mimeType: NsContent.EMimeTypes.QUIZ, resourceType: 'Assessment' }
      expect(service.getTocStructure(assessmentContent, emptyStructure()).assessment).toBe(1)
      const quizContent: any = { contentType: 'Resource', mimeType: NsContent.EMimeTypes.QUIZ, resourceType: 'Quiz' }
      expect(service.getTocStructure(quizContent, emptyStructure()).quiz).toBe(1)
    })

    it('should recurse through children for course/collection types', () => {
      const content: any = {
        contentType: 'Course',
        children: [{ contentType: 'Resource', mimeType: NsContent.EMimeTypes.PDF, children: [] }],
      }
      const result = service.getTocStructure(content, emptyStructure())
      expect(result.pdf).toBe(1)
    })
  })

  describe('filterToc / filterUnitContent', () => {
    it('should return content for unit content matching ALL filter', () => {
      const content: any = { contentType: 'Resource', resourceType: 'Learning Resource' }
      expect(service.filterToc(content)).toEqual(content)
    })

    it('should return null for unit content that fails filter', () => {
      const content: any = { contentType: 'Resource', resourceType: 'Certification' }
      const result = service.filterToc(content, NsContent.EFilterCategory.PRACTICE)
      expect(result).toBeNull()
    })

    it('should filter children recursively and return filtered parent', () => {
      const content: any = {
        contentType: 'Course',
        children: [{ contentType: 'Resource', resourceType: 'Learning Resource' }],
      }
      const result = service.filterToc(content)
      expect(result).toBeTruthy()
      expect(result!.children.length).toBe(1)
    })

    it('should return null when no children pass filter', () => {
      const content: any = {
        contentType: 'Course',
        children: [],
      }
      expect(service.filterToc(content)).toBeNull()
    })
  })

  describe('fetchContentAnalyticsClientData / fetchContentAnalyticsData', () => {
    it('should call http get and publish analytics result', done => {
      httpMock.get.mockReturnValue(of({ some: 'data' }))
      service.analyticsReplaySubject.subscribe(result => {
        expect(result).toEqual({ some: 'data' })
        done()
      })
      service.fetchContentAnalyticsClientData('c1')
      expect(service.analyticsFetchStatus).toBe('done')
    })

    it('should not fetch again when status is fetching', () => {
      service.analyticsFetchStatus = 'fetching'
      service.fetchContentAnalyticsClientData('c1')
      expect(httpMock.get).not.toHaveBeenCalled()
    })

    it('should handle error on fetchContentAnalyticsClientData', done => {
      service.analyticsFetchStatus = 'none'
      httpMock.get.mockReturnValue(throwError(() => new Error('err')))
      service.analyticsReplaySubject.subscribe(result => {
        expect(result).toBeNull()
        done()
      })
      service.fetchContentAnalyticsClientData('c1')
    })

    it('should call http get for fetchContentAnalyticsData', () => {
      httpMock.get.mockReturnValue(of({ some: 'data' }))
      service.fetchContentAnalyticsData('c1')
      expect(httpMock.get).toHaveBeenCalled()
    })

    it('should not fetch fetchContentAnalyticsData when already done', () => {
      service.analyticsFetchStatus = 'done'
      httpMock.get.mockClear()
      service.fetchContentAnalyticsData('c1')
      expect(httpMock.get).not.toHaveBeenCalled()
    })
  })

  it('should unsubscribe analytics replay subject on clearAnalyticsData', () => {
    const spy = jest.spyOn(service.analyticsReplaySubject, 'unsubscribe')
    service.clearAnalyticsData()
    expect(spy).toHaveBeenCalled()
  })

  it('should fetch content parents', () => {
    httpMock.get.mockReturnValue(of([]))
    service.fetchContentParents('c1').subscribe()
    expect(httpMock.get).toHaveBeenCalled()
  })

  it('should fetch content whats next with content type', () => {
    httpMock.get.mockReturnValue(of([]))
    service.fetchContentWhatsNext('c1', 'Course').subscribe()
    expect(httpMock.get).toHaveBeenCalled()
  })

  it('should fetch content whats next without content type', () => {
    httpMock.get.mockReturnValue(of([]))
    service.fetchContentWhatsNext('c1').subscribe()
    expect(httpMock.get).toHaveBeenCalled()
  })

  it('should fetch more like this paid/free', () => {
    httpMock.get.mockReturnValue(of([]))
    service.fetchMoreLikeThisPaid('c1').subscribe()
    service.fetchMoreLikeThisFree('c1').subscribe()
    expect(httpMock.get).toHaveBeenCalledTimes(2)
  })

  it('should fetch content cohorts', () => {
    httpMock.get.mockReturnValue(of([]))
    service.fetchContentCohorts(NsCohorts.ECohortTypes.ORGANISATION, 'c1').subscribe()
    expect(httpMock.get).toHaveBeenCalled()
  })

  it('should fetch external content access', () => {
    httpMock.get.mockReturnValue(of({ hasAccess: true }))
    service.fetchExternalContentAccess('c1').subscribe()
    expect(httpMock.get).toHaveBeenCalled()
  })

  it('should fetch cohort group users', () => {
    httpMock.get.mockReturnValue(of([]))
    service.fetchCohortGroupUsers(1).subscribe()
    expect(httpMock.get).toHaveBeenCalled()
  })

  it('should fetch more like this', () => {
    httpMock.get.mockReturnValue(of([]))
    service.fetchMoreLikeThis('c1', 'Course').subscribe()
    expect(httpMock.get).toHaveBeenCalled()
  })

  it('should fetch post assessment status', () => {
    httpMock.get.mockReturnValue(of({ result: [] }))
    service.fetchPostAssessmentStatus('c1').subscribe()
    expect(httpMock.get).toHaveBeenCalled()
  })

  it('should fetch content parent for preview', () => {
    httpMock.post.mockReturnValue(of({}))
    service.fetchContentParent('c1', {} as any, true).subscribe()
    expect(httpMock.post).toHaveBeenCalled()
  })

  it('should fetch content parent for non-preview', () => {
    httpMock.post.mockReturnValue(of({}))
    service.fetchContentParent('c1', {} as any, false).subscribe()
    expect(httpMock.post).toHaveBeenCalled()
  })

  it('should create batch', () => {
    httpMock.post.mockReturnValue(of({}))
    service.createBatch({ a: 1 }).subscribe()
    expect(httpMock.post).toHaveBeenCalled()
  })

  it('should update batch data', done => {
    service.batchReplaySubject.subscribe(() => done())
    service.updateBatchData()
  })

  it('should get and set node gating flag', () => {
    expect(service.getNode()).toBe(false)
    service.setNode(true)
    expect(service.getNode()).toBe(true)
  })
})
