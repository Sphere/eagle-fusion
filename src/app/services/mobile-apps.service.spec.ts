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
})
