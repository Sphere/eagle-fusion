import { BtnLinkedinShareComponent } from './btn-linkedin-share.component'

describe('BtnLinkedinShareComponent', () => {
  let component: BtnLinkedinShareComponent
  let configSvc: any
  const SDK_URL = 'https://platform.linkedin.com/in.js'

  const removeSdkScript = () => {
    document.querySelectorAll(`script[src='${SDK_URL}']`).forEach(s => s.remove())
  }

  beforeEach(() => {
    removeSdkScript()
    delete (window as any).IN
    configSvc = { restrictedFeatures: null }
    component = new BtnLinkedinShareComponent(configSvc)
  })

  afterEach(() => {
    removeSdkScript()
    delete (window as any).IN
  })

  describe('construction', () => {
    it('should inject the LinkedIn sdk script once', () => {
      expect(document.querySelectorAll(`script[src='${SDK_URL}']`)).toHaveLength(1)
    })

    it('should not inject the sdk a second time', () => {
      const second = new BtnLinkedinShareComponent(configSvc)
      expect(second).toBeTruthy()
      expect(document.querySelectorAll(`script[src='${SDK_URL}']`)).toHaveLength(1)
    })

    it('should default the share url to the current location', () => {
      expect(component.url).toBe(location.href)
      expect(component.isSocialMediaLinkedinShareEnabled).toBe(false)
    })
  })

  describe('ngOnInit', () => {
    it('should enable sharing when the feature is not restricted', () => {
      configSvc.restrictedFeatures = new Set<string>()
      component.ngOnInit()
      expect(component.isSocialMediaLinkedinShareEnabled).toBe(true)
    })

    it('should disable sharing when the feature is restricted', () => {
      configSvc.restrictedFeatures = new Set(['socialMediaLinkedinShare'])
      component.ngOnInit()
      expect(component.isSocialMediaLinkedinShareEnabled).toBe(false)
    })

    it('should leave sharing disabled when no restrictions are resolved', () => {
      component.ngOnInit()
      expect(component.isSocialMediaLinkedinShareEnabled).toBe(false)
    })
  })

  describe('ngAfterViewInit', () => {
    let host: HTMLElement

    beforeEach(() => {
      host = document.createElement('div')
      component.element = { nativeElement: host } as any
      component.url = 'https://sphere.example.com/course/1'
    })

    it('should render the share tag and ask the sdk to parse it', () => {
      const parse = jest.fn()
      ;(window as any).IN = { parse }
      component.isSocialMediaLinkedinShareEnabled = true

      component.ngAfterViewInit()

      expect(host.innerHTML).toContain('IN/Share')
      expect(host.innerHTML).toContain('https://sphere.example.com/course/1')
      expect(parse).toHaveBeenCalled()
    })

    it('should render the share tag even when the sdk has not loaded', () => {
      component.isSocialMediaLinkedinShareEnabled = true
      expect(() => component.ngAfterViewInit()).not.toThrow()
      expect(host.innerHTML).toContain('IN/Share')
    })

    it('should render nothing when sharing is disabled', () => {
      component.ngAfterViewInit()
      expect(host.innerHTML).toBe('')
    })

    it('should do nothing when there is no host element', () => {
      component.isSocialMediaLinkedinShareEnabled = true
      component.element = null
      expect(() => component.ngAfterViewInit()).not.toThrow()
    })
  })
})
