import { BtnPageBackComponent } from './btn-page-back.component'

describe('BtnPageBackComponent', () => {
  let component: BtnPageBackComponent
  let mockBtnBackSvc: any
  let mockRouter: any

  beforeEach(() => {
    mockBtnBackSvc = {
      getLastUrl: jest.fn().mockReturnValue({ route: '/prev', fragment: 'frag', queryParams: { a: '1' } }),
      checkUrl: jest.fn(),
    }
    mockRouter = { url: '/current' }
    component = new BtnPageBackComponent(mockBtnBackSvc, mockRouter)
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  describe('ngOnInit', () => {
    it('should set presentUrl from router.url', () => {
      component.ngOnInit()
      expect(component.presentUrl).toBe('/current')
    })

    it('should set showBackIcon true when widgetData.url contains overview', () => {
      component.widgetData = { url: '/course/overview' }
      component.ngOnInit()
      expect(component.showBackIcon).toBe(true)
    })

    it('should not set showBackIcon when widgetData.url does not contain overview', () => {
      component.widgetData = { url: '/course/detail' }
      component.ngOnInit()
      expect(component.showBackIcon).toBe(false)
    })

    it('should not throw when widgetData is falsy-ish', () => {
      component.widgetData = { url: undefined }
      expect(() => component.ngOnInit()).not.toThrow()
    })
  })

  describe('backUrl', () => {
    it('should return home route when presentUrl is /page/explore', () => {
      mockRouter.url = '/page/explore'
      component.ngOnInit()
      const result = component.backUrl
      expect(result).toEqual({ queryParams: undefined, routeUrl: '/page/home' })
    })

    it('should return home route when widgetData.url is home', () => {
      component.widgetData = { url: 'home' }
      component.ngOnInit()
      const result = component.backUrl
      expect(result).toEqual({ queryParams: undefined, routeUrl: '/page/home' })
    })

    it('should use getLastUrl(2) when widgetData.url is doubleBack', () => {
      component.widgetData = { url: 'doubleBack' }
      component.ngOnInit()
      const result = component.backUrl
      expect(mockBtnBackSvc.getLastUrl).toHaveBeenCalledWith(2)
      expect(result).toEqual({ fragment: 'frag', queryParams: { a: '1' }, routeUrl: '/prev' })
    })

    it('should use getLastUrl() when widgetData.url is back', () => {
      component.widgetData = { url: 'back' }
      component.ngOnInit()
      const result = component.backUrl
      expect(mockBtnBackSvc.getLastUrl).toHaveBeenCalledWith()
      expect(result).toEqual({ fragment: 'frag', queryParams: { a: '1' }, routeUrl: '/prev' })
    })

    it('should call checkUrl and return the widgetData.url as routeUrl for a custom url', () => {
      component.widgetData = { url: '/custom/path' }
      component.ngOnInit()
      const result = component.backUrl
      expect(mockBtnBackSvc.checkUrl).toHaveBeenCalledWith('/custom/path')
      expect(result).toEqual({ queryParams: undefined, routeUrl: '/custom/path' })
    })

    it('should default routeUrl to /app/home when widgetData.url is falsy', () => {
      component.widgetData = { url: undefined }
      component.ngOnInit()
      const result = component.backUrl
      expect(result).toEqual({ queryParams: undefined, routeUrl: '/app/home' })
    })
  })
})
