import { of } from 'rxjs'
import { WidgetContentShareService } from './widget-content-share.service'
import { API_END_POINTS } from '../../../../../../src/app/constants/apiConstants'

describe('WidgetContentShareService', () => {
  let service: WidgetContentShareService
  let mockHttp: any
  let configSvc: any

  const buildContent = (overrides: any = {}) => ({
    identifier: 'c1',
    name: 'Course One',
    description: 'A course',
    appIcon: 'icon.png',
    duration: 3600,
    creatorContacts: [{ name: 'Ada' }],
    ...overrides,
  })

  beforeEach(() => {
    mockHttp = {
      get: jest.fn().mockReturnValue(of({ ok: true })),
      post: jest.fn().mockReturnValue(of({ status: 'sent' })),
    }
    configSvc = { sitePath: 'assets/configurations', userProfile: { userName: 'Ada', email: 'ada@x.com' } }
    service = new WidgetContentShareService(mockHttp, configSvc)
  })

  afterEach(() => jest.clearAllMocks())

  it('should create and take its base url from the config service', () => {
    expect(service).toBeTruthy()
    expect(service.baseUrl).toBe('assets/configurations')
  })

  describe('fetchConfigFile', () => {
    it('should read the shared common.json', done => {
      service.fetchConfigFile().subscribe(res => {
        expect(res).toEqual({ ok: true })
        expect(mockHttp.get).toHaveBeenCalledWith('fusion-assets/files/common.json')
        done()
      })
    })
  })

  describe('shareContent', () => {
    it('should post a share request built from the content and profile', done => {
      service.shareContent(buildContent() as any, [{ email: 'bob@x.com' }], 'have a look').subscribe(() => {
        const [url, req] = mockHttp.post.mock.calls[0]
        expect(url).toBe(API_END_POINTS.USER_SHARE)
        expect(req.emailType).toBe('share')
        expect(req.emailTo).toEqual([{ email: 'bob@x.com' }])
        expect(req.ccTo).toEqual([{ name: 'Ada', email: 'ada@x.com' }])
        expect(req.sharedBy).toEqual([{ name: 'Ada', email: 'ada@x.com' }])
        expect(req.body).toEqual({ text: 'have a look', isHTML: false })
        expect(req.appURL).toBe(location.origin)
        expect(typeof req.timestamp).toBe('number')
        done()
      })
    })

    it('should default missing artifact fields', done => {
      service.shareContent(buildContent() as any, [], '').subscribe(() => {
        const [artifact] = mockHttp.post.mock.calls[0][1].artifacts
        expect(artifact.artifactUrl).toBe('')
        expect(artifact.downloadUrl).toBe('')
        expect(artifact.size).toBe(0)
        expect(artifact.track).toBe('')
        expect(artifact.duration).toBe('3600')
        expect(artifact.title).toBe('Course One')
        expect(artifact.thumbnailUrl).toBe('icon.png')
        expect(artifact.url).toContain('app/toc/c1/overview')
        done()
      })
    })

    it('should join the track names with semicolons', done => {
      const content = buildContent({ track: [{ name: 'a' }, { name: 'b' }] })
      service.shareContent(content as any, [], '').subscribe(() => {
        expect(mockHttp.post.mock.calls[0][1].artifacts[0].track).toBe('a;b')
        done()
      })
    })

    it('should mail an attachment back to the sharer with no cc', done => {
      service.shareContent(buildContent() as any, [{ email: 'bob@x.com' }], '', 'attachment').subscribe(() => {
        const req = mockHttp.post.mock.calls[0][1]
        expect(req.emailType).toBe('attachment')
        expect(req.ccTo).toEqual([])
        expect(req.emailTo).toEqual([{ name: 'Ada', email: 'ada@x.com' }])
        done()
      })
    })

    it('should fall back to blank sender details when there is no profile', done => {
      configSvc.userProfile = null
      service.shareContent(buildContent() as any, [], '').subscribe(() => {
        expect(mockHttp.post.mock.calls[0][1].sharedBy).toEqual([{ name: '', email: '' }])
        done()
      })
    })

    it('should fall back to blank sender details when the profile has no name or email', done => {
      configSvc.userProfile = {}
      service.shareContent(buildContent() as any, [], '').subscribe(() => {
        expect(mockHttp.post.mock.calls[0][1].sharedBy).toEqual([{ name: '', email: '' }])
        done()
      })
    })
  })

  describe('contentShareNew', () => {
    it('should post to the content-share endpoint', done => {
      service.contentShareNew({ contentId: 'c1' } as any).subscribe(() => {
        expect(mockHttp.post).toHaveBeenCalledWith(API_END_POINTS.USER_CONTENT_SHARE, { contentId: 'c1' })
        done()
      })
    })
  })
})
