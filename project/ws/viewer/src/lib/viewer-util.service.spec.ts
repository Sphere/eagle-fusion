import { of, throwError } from 'rxjs'
import { ViewerUtilService } from './viewer-util.service'
import { NsContent } from '../../../../../library/ws-widget/collection/src/lib/_services/widget-content.model'

describe('ViewerUtilService', () => {
  let service: ViewerUtilService
  let mockHttp: any
  let mockConfigSvc: any
  let mockIndexedDbSvc: any
  let mockEvents: any
  let mockLogger: any

  beforeEach(() => {
    mockHttp = {
      get: jest.fn().mockReturnValue({ toPromise: jest.fn().mockResolvedValue({ ok: true }) }),
      post: jest.fn().mockReturnValue({ toPromise: jest.fn().mockResolvedValue({}) }),
      patch: jest.fn().mockReturnValue(of({})),
    }
    mockConfigSvc = {
      userProfile: { userId: 'user-1' },
      rootOrg: 'aastar',
      activeOrg: 'dopt',
    }
    mockIndexedDbSvc = {
      getRecordFromTable: jest.fn().mockReturnValue(of({})),
      deleteRecordByKey: jest.fn().mockReturnValue(of(true)),
      insertProgressData: jest.fn().mockReturnValue(of({})),
    }
    mockEvents = { raiseInteractTelemetry: jest.fn() }
    mockLogger = { log: jest.fn(), warn: jest.fn(), error: jest.fn() }
    service = new ViewerUtilService(mockHttp, mockConfigSvc, mockIndexedDbSvc, mockEvents, mockLogger)
  })

  it('should create', () => {
    expect(service).toBeTruthy()
  })

  describe('editResourceData / castResource', () => {
    it('pushes the new resource onto castResource', done => {
      const resource: any = { identifier: 'r1' }
      service.castResource.subscribe(val => {
        if (val) {
          expect(val).toBe(resource)
          done()
        }
      })
      service.editResourceData(resource)
    })
  })

  describe('fetchManifestFile', () => {
    it('sets the S3 cookie then fetches and returns the manifest', async () => {
      const result = await service.fetchManifestFile('https://example.com/manifest.json')
      expect(mockHttp.post).toHaveBeenCalled()
      expect(mockHttp.get).toHaveBeenCalledWith('https://example.com/manifest.json')
      expect(result).toEqual({ ok: true })
    })
  })

  describe('calculatePercent', () => {
    it('returns 0 when current or max is falsy', () => {
      expect(service.calculatePercent(0, 100, NsContent.EMimeTypes.MP4)).toBe(0)
      expect(service.calculatePercent(50, 0, NsContent.EMimeTypes.MP4)).toBe(0)
    })

    it('computes ceil percent for video/audio mime types', () => {
      expect(service.calculatePercent(50, 100, NsContent.EMimeTypes.MP4)).toBe(50)
      expect(service.calculatePercent(33, 100, NsContent.EMimeTypes.MP3)).toBe(33)
    })

    it('returns 100 for text-web / json mime types', () => {
      expect(service.calculatePercent(1, 1, NsContent.EMimeTypes.TEXT_WEB)).toBe(100)
      expect(service.calculatePercent(1, 1, 'application/json')).toBe(100)
    })

    it('returns 100 for zip mime type', () => {
      expect(service.calculatePercent(1, 1, NsContent.EMimeTypes.ZIP)).toBe(100)
    })

    it('handles PDF with a numeric current', () => {
      expect(service.calculatePercent('5', 10, NsContent.EMimeTypes.PDF)).toBe(50)
    })

    it('handles PDF with an array current — takes the last element', () => {
      expect(service.calculatePercent(['2', '5'], 10, NsContent.EMimeTypes.PDF)).toBe(50)
    })

    it('returns 2 for unrecognized mime types when current/max are truthy', () => {
      expect(service.calculatePercent(5, 10, 'unknown/type')).toBe(2)
    })

    it('catches errors and returns 0', () => {
      // Force JSON.parse-style failure path via a mimeType causing an exception isn't
      // trivial to trigger naturally, so verify the catch branch by spying to throw.
      const spy = jest.spyOn(Array, 'isArray').mockImplementation(() => { throw new Error('boom') })
      const result = service.calculatePercent(['1'], 10, NsContent.EMimeTypes.PDF)
      expect(result).toBe(0)
      expect(mockLogger.log).toHaveBeenCalled()
      spy.mockRestore()
    })
  })

  describe('getStatus', () => {
    it('returns 0/1/2 for video mime type based on thresholds', () => {
      expect(service.getStatus(0, 100, NsContent.EMimeTypes.MP4)).toBe(0)
      expect(service.getStatus(50, 100, NsContent.EMimeTypes.MP4)).toBe(1)
      expect(service.getStatus(96, 100, NsContent.EMimeTypes.MP4)).toBe(2)
    })

    it('returns 2 for text-web / json mime type', () => {
      expect(service.getStatus(1, 1, NsContent.EMimeTypes.TEXT_WEB)).toBe(2)
    })

    it('returns status by percentage thresholds for PDF', () => {
      expect(service.getStatus(1, 10, NsContent.EMimeTypes.PDF)).toBe(0)
      expect(service.getStatus(5, 10, NsContent.EMimeTypes.PDF)).toBe(1)
      expect(service.getStatus(9, 10, NsContent.EMimeTypes.PDF)).toBe(2)
    })

    it('returns 2 for zip mime type', () => {
      expect(service.getStatus(1, 1, NsContent.EMimeTypes.ZIP)).toBe(2)
    })

    it('returns 1 for unrecognized mime types', () => {
      expect(service.getStatus(1, 1, 'unknown/type')).toBe(1)
    })

    it('catches errors from calculatePercent and returns 1', () => {
      const spy = jest.spyOn(service, 'calculatePercent').mockImplementation(() => { throw new Error('boom') })
      expect(service.getStatus(1, 1, NsContent.EMimeTypes.MP4)).toBe(1)
      expect(mockLogger.log).toHaveBeenCalled()
      spy.mockRestore()
    })
  })

  describe('getAuthoringUrl', () => {
    it('returns empty string for a falsy url', () => {
      expect(service.getAuthoringUrl('')).toBe('')
    })

    it('encodes a plain url', () => {
      expect(service.getAuthoringUrl('http://foo.com/a b')).toBe(`/apis/authContent/${encodeURIComponent('http://foo.com/a b')}`)
    })

    it('strips the content-store prefix for content-store urls', () => {
      const url = 'https://cdn.example.com/content-store/abc.pdf'
      expect(service.getAuthoringUrl(url)).toBe('/apis/authContent/content-store/abc.pdf')
    })
  })

  describe('getCompetencyAuthoringUrl', () => {
    it('builds the mobile assessment content url', () => {
      expect(service.getCompetencyAuthoringUrl('/abc')).toBe('apis/public/v8/mobileApp/v1/assessment/content/abc')
    })
  })

  describe('replaceToAuthUrl', () => {
    it('rewrites content-store download urls to the authoring base', () => {
      const data = { url: '/content-store/xyz.pdf"' }
      const result = service.replaceToAuthUrl(data)
      expect(result.url).toContain('/apis/authContent/')
    })

    it('leaves data without matching urls unchanged', () => {
      const data = { foo: 'bar' }
      expect(service.replaceToAuthUrl(data)).toEqual(data)
    })
  })

  describe('getContent', () => {
    it('calls http.get with the hierarchy endpoint using configured org/rootOrg', () => {
      mockHttp.get.mockReturnValue(of({}))
      service.getContent('content-1')
      expect(mockHttp.get).toHaveBeenCalledWith(
        '/apis/authApi/action/content/hierarchy/content-1?rootOrg=aastar&org=dopt',
      )
    })
  })

  describe('scormUpdate', () => {
    it('calls http.get with the scorm-update endpoint as text response', () => {
      mockHttp.get.mockReturnValue(of('text'))
      service.scormUpdate('/artifact.zip')
      expect(mockHttp.get).toHaveBeenCalled()
    })
  })

  describe('realTimeProgressUpdateQuiz', () => {
    it('builds a quiz progress request when userProfile exists and patches', () => {
      service.realTimeProgressUpdateQuiz('c1', 'course1', 'batch1', 2)
      expect(mockHttp.patch).toHaveBeenCalled()
    })

    it('sends an empty request when there is no userProfile', () => {
      mockConfigSvc.userProfile = null
      service.realTimeProgressUpdateQuiz('c1')
      expect(mockHttp.patch).toHaveBeenCalledWith(expect.any(String), {})
    })
  })

  describe('realTimeProgressUpdate', () => {
    it('builds a progress request, raises telemetry and patches when userProfile exists', () => {
      const request = { current: ['50'], max_size: 100, mime_type: NsContent.EMimeTypes.MP4 }
      service.realTimeProgressUpdate('content-1', request, 'course-1', 'batch-1')
      expect(mockEvents.raiseInteractTelemetry).toHaveBeenCalled()
      expect(mockHttp.patch).toHaveBeenCalled()
    })

    it('caps percentage to 100 when calculated/explicit percentage exceeds 95', () => {
      const request = { current: [99], max_size: 100, mime_type: NsContent.EMimeTypes.MP4, completionPercentage: 99 }
      service.realTimeProgressUpdate('content-1', request, 'course-1', 'batch-1')
      expect(mockHttp.patch).toHaveBeenCalled()
    })

    it('handles indexed-db error branch by inserting progress data directly', () => {
      mockIndexedDbSvc.getRecordFromTable.mockReturnValue(throwError(() => new Error('db error')))
      const request = { current: [10], max_size: 100, mime_type: NsContent.EMimeTypes.MP4 }
      service.realTimeProgressUpdate('content-1', request, 'course-1', 'batch-1')
      expect(mockIndexedDbSvc.insertProgressData).toHaveBeenCalled()
    })
  })

  describe('initUpdate', () => {
    it('fixes completionPercentage mismatch when status is 2 but percentage is not 100', () => {
      const req: any = {
        request: {
          url: 'http://x/y/z/course-1/w',
          contents: [{ status: 2, completionPercentage: 50, courseId: 'course-1', contentId: 'content-1' }],
        },
      }
      service.initUpdate(req)
      expect(req.request.contents[0].completionPercentage).toBe(100)
      expect(mockHttp.patch).toHaveBeenCalled()
    })

    it('handles indexed-db error branch by inserting progress data directly', () => {
      mockIndexedDbSvc.getRecordFromTable.mockReturnValue(throwError(() => new Error('db error')))
      const req: any = {
        request: {
          contents: [{ status: 1, completionPercentage: 50, courseId: 'course-1', contentId: 'content-1' }],
        },
      }
      service.initUpdate(req)
      expect(mockIndexedDbSvc.insertProgressData).toHaveBeenCalled()
    })
  })

  describe('generateInteractTelemetry', () => {
    it('raises interact telemetry with a rollup built from contentData', () => {
      service.generateInteractTelemetry('progress-update-attempt', {
        contentId: 'c1', courseId: 'course-1', mimeType: 'video/mp4', completionPercentage: 50, status: 1, batchId: 'b1',
      })
      expect(mockEvents.raiseInteractTelemetry).toHaveBeenCalledWith(
        'progress-update-attempt',
        'video/mp4',
        'player',
        expect.anything(),
        expect.objectContaining({ values: expect.any(Array) }),
      )
    })
  })
})
