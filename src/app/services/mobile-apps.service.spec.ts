jest.mock('./navigation-external.service', () => ({
  NavigationExternalService: class { init = jest.fn() },
}))

jest.mock('../../../library/ws-widget/collection/src/lib/_services/widget-content.model', () => ({}))

import { MobileAppsService } from './mobile-apps.service'
import { NavigationExternalService } from './navigation-external.service'

describe('MobileAppsService', () => {
  let service: MobileAppsService
  let mockNavigateSvc: any

  beforeEach(() => {
    mockNavigateSvc = new NavigationExternalService()
    service = new MobileAppsService(mockNavigateSvc)
    // clean up global window properties
    delete (window as any).appRef
    delete (window as any).webkit
    delete (window as any).dispatchEventFlag
  })

  afterEach(() => {
    delete (window as any).appRef
    delete (window as any).webkit
    delete (window as any).dispatchEventFlag
    delete (window as any).navigateTo
    jest.clearAllMocks()
  })

  it('should create', () => {
    expect(service).toBeTruthy()
  })

  it('init calls navigateSvc.init', () => {
    service.init()
    expect(mockNavigateSvc.init).toHaveBeenCalled()
  })

  it('init sets up window.navigateTo global method', () => {
    service.init()
    expect(typeof (window as any).navigateTo).toBe('function')
  })

  it('simulateMobile sets window.appRef and window.webkit', () => {
    service.simulateMobile()
    expect((window as any).appRef).toBeDefined()
    expect((window as any).webkit).toBeDefined()
  })

  it('isMobile returns false when no appRef or webkit', () => {
    expect(service.isMobile).toBe(false)
  })

  it('isAndroidApp returns false when window.appRef is undefined', () => {
    expect(service.isAndroidApp).toBe(false)
  })

  it('isAndroidApp returns true when window.appRef is set', () => {
    ;(window as any).appRef = {}
    expect(service.isAndroidApp).toBe(true)
  })

  it('iOsAppRef returns null when webkit is not set', () => {
    expect(service.iOsAppRef).toBeNull()
  })

  it('iOsAppRef returns messageHandlers.appRef when webkit is set', () => {
    const ref = { postMessage: jest.fn() }
    ;(window as any).webkit = { messageHandlers: { appRef: ref } }
    expect(service.iOsAppRef).toBe(ref)
  })

  it('canShowSettings returns false when no appRef or webkit', () => {
    expect(service.canShowSettings).toBe(false)
  })

  it('sendDataAppToClient dispatches custom event when dispatchEventFlag is set', () => {
    ;(window as any).dispatchEventFlag = true
    const dispatchSpy = jest.spyOn(document, 'dispatchEvent').mockImplementation(jest.fn())
    service.sendDataAppToClient('TEST_EVENT', { data: 1 })
    expect(dispatchSpy).toHaveBeenCalled()
    dispatchSpy.mockRestore()
  })

  it('isFunctionAvailableInAndroid returns false when no appRef', () => {
    expect(service.isFunctionAvailableInAndroid('someMethod')).toBe(false)
  })

  it('isFunctionAvailableInAndroid returns true when appRef has the function', () => {
    ;(window as any).appRef = { someMethod: jest.fn() }
    expect(service.isFunctionAvailableInAndroid('someMethod')).toBe(true)
  })

  it('canShowSettings returns true when webkit + iOsAppRef is set', () => {
    const ref = { postMessage: jest.fn() }
    ;(window as any).webkit = { messageHandlers: { appRef: ref } }
    expect(service.canShowSettings).toBe(true)
  })

  it('isMobile returns true when appRef is set', () => {
    ;(window as any).appRef = {}
    expect(service.isMobile).toBe(true)
  })

  it('isMobile returns true when webkit appRef is set', () => {
    const ref = { postMessage: jest.fn() }
    ;(window as any).webkit = { messageHandlers: { appRef: ref } }
    expect(service.isMobile).toBe(true)
  })

  it('sendDataAppToClient calls appRef method with JSON when appRef has event', () => {
    const mockMethod = jest.fn()
    ;(window as any).appRef = { TEST_EVT: mockMethod }
    service.sendDataAppToClient('TEST_EVT', { x: 1 })
    expect(mockMethod).toHaveBeenCalledWith(JSON.stringify({ x: 1 }))
  })

  it('sendDataAppToClient calls iOsAppRef.postMessage when no appRef but webkit is set', () => {
    const ref = { postMessage: jest.fn() }
    ;(window as any).webkit = { messageHandlers: { appRef: ref } }
    service.sendDataAppToClient('MY_EVENT', { y: 2 })
    expect(ref.postMessage).toHaveBeenCalledWith(JSON.stringify({ eventName: 'MY_EVENT', data: { y: 2 } }))
  })

  it('sendDataAppToClient does not throw when nothing is set', () => {
    expect(() => service.sendDataAppToClient('UNKNOWN', {})).not.toThrow()
  })

  it('goOffline calls sendDataAppToClient', () => {
    const spy = jest.spyOn(service, 'sendDataAppToClient').mockImplementation(() => {})
    service.goOffline()
    expect(spy).toHaveBeenCalled()
  })

  it('viewSettings calls sendDataAppToClient', () => {
    const spy = jest.spyOn(service, 'sendDataAppToClient').mockImplementation(() => {})
    service.viewSettings()
    expect(spy).toHaveBeenCalled()
  })

  it('sendViewerData calls sendDataAppToClient with content data', () => {
    const spy = jest.spyOn(service, 'sendDataAppToClient').mockImplementation(() => {})
    service.sendViewerData({ identifier: 'c1' } as any)
    expect(spy).toHaveBeenCalledWith(expect.any(String), { identifier: 'c1' })
  })

  it('downloadResource calls sendDataAppToClient with resource id', () => {
    const spy = jest.spyOn(service, 'sendDataAppToClient').mockImplementation(() => {})
    service.downloadResource('res-1')
    expect(spy).toHaveBeenCalledWith(expect.any(String), 'res-1')
  })

  it('appChatbotVisibility calls sendDataAppToClient with visibility flag', () => {
    const spy = jest.spyOn(service, 'sendDataAppToClient').mockImplementation(() => {})
    service.appChatbotVisibility('yes')
    expect(spy).toHaveBeenCalledWith(expect.any(String), 'yes')
  })

  it('iosOpenInBrowserRequest calls sendDataAppToClient with url object', () => {
    const spy = jest.spyOn(service, 'sendDataAppToClient').mockImplementation(() => {})
    service.iosOpenInBrowserRequest('https://example.com')
    expect(spy).toHaveBeenCalledWith(expect.any(String), { url: 'https://example.com' })
  })
})
