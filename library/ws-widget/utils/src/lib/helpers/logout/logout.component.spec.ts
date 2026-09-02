import { LogoutComponent } from './logout.component'

describe('LogoutComponent', () => {
  let component: LogoutComponent
  let dialogRef: any
  let authSvc: any
  let configSvc: any
  let utilitySvc: any

  const build = () => new LogoutComponent(dialogRef, authSvc, configSvc, utilitySvc)

  beforeEach(() => {
    dialogRef = { close: jest.fn() }
    authSvc = { logout: jest.fn() }
    configSvc = { restrictedFeatures: null, instanceConfig: null }
    utilitySvc = { iOsAppRef: null, isAndroidApp: false }
    component = build()
  })

  afterEach(() => jest.clearAllMocks())

  it('should create enabled with downloads off', () => {
    expect(component).toBeTruthy()
    expect(component.disabled).toBe(false)
    expect(component.isDownloadableIos).toBe(false)
    expect(component.isDownloadableAndroid).toBe(false)
  })

  describe('ngOnInit', () => {
    it('should enable both download links when neither is restricted', () => {
      configSvc.restrictedFeatures = new Set<string>()
      component.ngOnInit()
      expect(component.isDownloadableIos).toBe(true)
      expect(component.isDownloadableAndroid).toBe(true)
    })

    it('should disable the iOS download when restricted', () => {
      configSvc.restrictedFeatures = new Set(['iosDownload'])
      component.ngOnInit()
      expect(component.isDownloadableIos).toBe(false)
      expect(component.isDownloadableAndroid).toBe(true)
    })

    it('should disable the Android download when restricted', () => {
      configSvc.restrictedFeatures = new Set(['androidDownload'])
      component.ngOnInit()
      expect(component.isDownloadableIos).toBe(true)
      expect(component.isDownloadableAndroid).toBe(false)
    })

    it('should leave both off when no restrictions are resolved', () => {
      component.ngOnInit()
      expect(component.isDownloadableIos).toBe(false)
      expect(component.isDownloadableAndroid).toBe(false)
    })
  })

  describe('confirmed', () => {
    it('should disable the button and log the user out', () => {
      component.confirmed()
      expect(component.disabled).toBe(true)
      expect(authSvc.logout).toHaveBeenCalled()
    })
  })

  describe('isDownloadable', () => {
    it('should be false when downloads are not available on the instance', () => {
      expect(component.isDownloadable).toBe(false)
    })

    it('should be false on the web even when downloads are available', () => {
      configSvc.instanceConfig = { isContentDownloadAvailable: true }
      expect(component.isDownloadable).toBe(false)
    })

    it('should be true inside the iOS app', () => {
      configSvc.instanceConfig = { isContentDownloadAvailable: true }
      utilitySvc.iOsAppRef = { postMessage: jest.fn() }
      expect(component.isDownloadable).toBe(true)
    })

    it('should be true inside the Android app', () => {
      configSvc.instanceConfig = { isContentDownloadAvailable: true }
      utilitySvc.isAndroidApp = true
      expect(component.isDownloadable).toBe(true)
    })

    it('should be false in a native app when downloads are unavailable', () => {
      configSvc.instanceConfig = { isContentDownloadAvailable: false }
      utilitySvc.isAndroidApp = true
      expect(component.isDownloadable).toBe(false)
    })
  })
})
