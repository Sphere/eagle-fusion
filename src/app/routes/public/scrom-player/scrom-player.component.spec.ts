jest.mock('../../../services/mobile-scrom-adapter.service', () => ({
  MobileScromAdapterService: class {
    contentId = ''
    setProperties = jest.fn()
    loadDataV2 = jest.fn()
  },
}))

jest.mock('../../../../../library/ws-widget/utils/src/public-api', () => ({
  LoggerService: class {
    log = jest.fn()
  },
}))

import { ScromPlayerComponent } from './scrom-player.component'

describe('ScromPlayerComponent', () => {
  let component: ScromPlayerComponent
  let mockRoute: any
  let mockSafeResourceUrlSvc: any
  let mockScormAdapter: any
  let mockLogger: any

  const makeRoute = (params: Record<string, string>) => ({
    snapshot: {
      queryParamMap: {
        get: (key: string) => params[key] || null,
      },
    },
  })

  beforeEach(() => {
    mockRoute = makeRoute({
      scormUrl: 'https://example.com/scorm',
      identifier: 'content-abc',
      userId: 'user-123',
      batchId: 'batch-456',
      courseId: 'course-789',
      Authorization: 'Bearer token',
      userToken: 'user-tok',
    })
    mockSafeResourceUrlSvc = {
      trust: jest.fn().mockImplementation((url: string | undefined) =>
        (url && /^https?:\/\//.test(url) ? { safe: url } : null)),
    }
    mockScormAdapter = {
      contentId: '',
      setProperties: jest.fn(),
      loadDataV2: jest.fn(),
    }
    mockLogger = { log: jest.fn() }
    component = new ScromPlayerComponent(mockRoute, mockSafeResourceUrlSvc, mockScormAdapter, mockLogger)
  })

  afterEach(() => {
    jest.clearAllMocks()
    delete (window as any).API
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should set window.API to scormAdapter on construction', () => {
    expect((window as any).API).toBe(mockScormAdapter)
  })

  it('should default isLandscapeModeEnforced to false', () => {
    expect(component.isLandscapeModeEnforced).toBe(false)
  })

  it('should sanitize scormUrl and set iframeUrl on ngOnInit', () => {
    component.ngOnInit()
    expect(mockSafeResourceUrlSvc.trust).toHaveBeenCalledWith('https://example.com/scorm')
    expect(component.iframeUrl).toEqual({ safe: 'https://example.com/scorm' })
  })

  it('should set scormAdapter.contentId from query param on ngOnInit', () => {
    component.ngOnInit()
    expect(mockScormAdapter.contentId).toBe('content-abc')
  })

  it('should call scormAdapter.setProperties with correct values', () => {
    component.ngOnInit()
    expect(mockScormAdapter.setProperties).toHaveBeenCalledWith(
      expect.objectContaining({
        contentId: 'content-abc',
        userId: 'user-123',
        batchId: 'batch-456',
        courseId: 'course-789',
      }),
    )
  })

  it('should call scormAdapter.loadDataV2 on ngOnInit', () => {
    component.ngOnInit()
    expect(mockScormAdapter.loadDataV2).toHaveBeenCalled()
  })

  it('should call createIframeUrl with sanitize', () => {
    component.createIframeUrl('https://other.com/scorm')
    expect(mockSafeResourceUrlSvc.trust).toHaveBeenCalledWith('https://other.com/scorm')
  })

  it('should block a javascript: scormUrl and not set iframeUrl', () => {
    component.createIframeUrl('javascript:alert(1)')
    expect(component.iframeUrl).toBeUndefined()
  })

  it('should block a non-string scormUrl', () => {
    component.createIframeUrl(null)
    expect(component.iframeUrl).toBeUndefined()
  })

  it('should log received messages in receiveMessage', () => {
    const msg = { data: 'test' }
    component.receiveMessage(msg)
    expect(mockLogger.log).toHaveBeenCalledWith('msg=>', msg)
  })

  it('should default to empty strings when query params are missing', () => {
    const emptyRoute = makeRoute({})
    const cmp = new ScromPlayerComponent(emptyRoute, mockSafeResourceUrlSvc, mockScormAdapter, mockLogger)
    cmp.ngOnInit()
    expect(mockScormAdapter.contentId).toBe('')
    expect(mockScormAdapter.setProperties).toHaveBeenCalledWith(
      expect.objectContaining({
        contentId: '',
        userId: '',
        batchId: '',
        courseId: '',
        authorization: null,
        userToken: null,
      }),
    )
    expect(mockScormAdapter.loadDataV2).toHaveBeenCalledWith(
      expect.objectContaining({
        request: expect.objectContaining({ userId: '', batchId: '', courseId: '' }),
      }),
      expect.objectContaining({ Authorization: null, userToken: null }),
    )
  })
})
