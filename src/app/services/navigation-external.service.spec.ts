jest.mock('../models/mobile-events.model', () => ({
  NAVIGATION_DATA_INCOMING: 'NAVIGATION_DATA_INCOMING',
}))

import { NavigationExternalService } from './navigation-external.service'

describe('NavigationExternalService', () => {
  let service: NavigationExternalService
  let mockRouter: any

  beforeEach(() => {
    mockRouter = { navigate: jest.fn(), url: '/app/home' }
    service = new NavigationExternalService(mockRouter)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should create', () => {
    expect(service).toBeTruthy()
  })

  it('dummy starts at 1', () => {
    expect(service.dummy).toBe(1)
  })

  it('init increments dummy', () => {
    service.init()
    expect(service.dummy).toBe(2)
  })

  it('triggers navigateTo when NAVIGATION_DATA_INCOMING event is dispatched on document', () => {
    // fromEvent subscriptions persist across beforeEach calls, so pass null params
    // to avoid cross-instance mutation of shared params object
    const navigateSpy = jest.spyOn(service, 'navigateTo')
    const event = new CustomEvent('NAVIGATION_DATA_INCOMING', {
      detail: { url: '/app/home', params: null },
    })
    document.dispatchEvent(event)
    expect(navigateSpy).toHaveBeenCalledWith('/app/home', null)
  })

  describe('navigateTo', () => {
    it('calls router.navigate with provided url', () => {
      service.navigateTo('/app/search')
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/search'], expect.objectContaining({
        queryParams: expect.any(Object),
      }))
    })

    it('includes ref in queryParams', () => {
      service.navigateTo('/app/home', { someParam: 'value' })
      expect(mockRouter.navigate).toHaveBeenCalledWith(
        ['/app/home'],
        expect.objectContaining({ queryParams: expect.objectContaining({ ref: expect.any(String) }) })
      )
    })

    it('uses existing params when provided', () => {
      service.navigateTo('/app/toc', { contentId: '123' })
      const call = mockRouter.navigate.mock.calls[0]
      expect(call[1].queryParams.contentId).toBe('123')
    })
  })
})
