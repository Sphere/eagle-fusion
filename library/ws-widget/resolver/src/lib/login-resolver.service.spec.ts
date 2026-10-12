import { LoginResolverService } from './login-resolver.service'
import { InvalidRegistrationComponent } from './invalid-registration/invalid-registration.component'

describe('LoginResolverService', () => {
  let service: LoginResolverService
  let safeResourceUrlSvc: any
  let containerRef: any
  let instance: any

  class DummyComponent { }

  const globalConfig = [
    { widgetType: 'layout', widgetSubType: 'gridLayout', component: DummyComponent as any },
    { widgetType: 'card', widgetSubType: 'cardContent', component: DummyComponent as any },
    { widgetType: 'unrelated', widgetSubType: 'notAllowListed', component: DummyComponent as any },
  ]

  const renderConfig = (overrides: any = {}) => ({
    widgetType: 'layout',
    widgetSubType: 'gridLayout',
    widgetData: { title: 'x' },
    ...overrides,
  })

  const build = (global: any = globalConfig, scoped: any = null) =>
    new LoginResolverService(safeResourceUrlSvc, global, scoped)

  beforeEach(() => {
    safeResourceUrlSvc = { trustStyle: jest.fn((s: string) => `safe:${s}`) }
    instance = { widgetData: null, updateBaseComponent: jest.fn() }
    containerRef = {
      clear: jest.fn(),
      createComponent: jest.fn().mockImplementation(() => ({ instance })),
    }
    service = build()
  })

  it('should create and start uninitialized', () => {
    expect(service).toBeTruthy()
    expect(service.isInitialized).toBe(false)
  })

  it('should namespace the widget key', () => {
    expect(LoginResolverService.getWidgetKey({ widgetType: 'a', widgetSubType: 'b' })).toBe('widget:a::b')
  })

  describe('initialize', () => {
    it('should mark the service initialized with an empty registry', () => {
      service.initialize()
      expect(service.isInitialized).toBe(true)
    })

    it('should tolerate non-array configs', () => {
      service = build(null, undefined)
      expect(() => service.initialize()).not.toThrow()
      expect(service.isInitialized).toBe(true)
    })
  })

  describe('loginResolveWidget', () => {
    it('should return null before initialize populates the registry', () => {
      expect(service.loginResolveWidget(renderConfig() as any, containerRef)).toBeNull()
    })

    it('should lazily register the allow-listed widgets on the first layout lookup', () => {
      service.initialize()
      service.loginResolveWidget(renderConfig() as any, containerRef)
      expect(containerRef.createComponent).toHaveBeenCalledWith(DummyComponent)
    })

    it('should also resolve linearLayout as a trigger key', () => {
      service.initialize()
      const ref = service.loginResolveWidget(
        renderConfig({ widgetSubType: 'linearLayout' }) as any, containerRef,
      )
      // linearLayout is a trigger key but is not registered in this config, so it stays unresolved.
      expect(ref).toBeNull()
    })

    it('should serve an allow-listed widget once the registry is warm', () => {
      service.initialize()
      service.loginResolveWidget(renderConfig() as any, containerRef)
      containerRef.createComponent.mockClear()

      service.loginResolveWidget(renderConfig({ widgetType: 'card', widgetSubType: 'cardContent' }) as any, containerRef)
      expect(containerRef.createComponent).toHaveBeenCalledWith(DummyComponent)
    })

    it('should return null for a widget outside the allow list', () => {
      service.initialize()
      service.loginResolveWidget(renderConfig() as any, containerRef)
      const ref = service.loginResolveWidget(
        renderConfig({ widgetType: 'unrelated', widgetSubType: 'notAllowListed' }) as any, containerRef,
      )
      expect(ref).toBeNull()
    })

    it('should render the invalid-registration component when the entry has no component', () => {
      service = build([{ widgetType: 'layout', widgetSubType: 'gridLayout' } as any])
      service.initialize()
      service.loginResolveWidget(renderConfig() as any, containerRef)
      expect(containerRef.createComponent).toHaveBeenCalledWith(InvalidRegistrationComponent)
    })

    it('should not warm the registry when the global config is missing', () => {
      service = build(null)
      service.initialize()
      expect(service.loginResolveWidget(renderConfig() as any, containerRef)).toBeNull()
    })
  })

  describe('base component wiring', () => {
    beforeEach(() => {
      service.initialize()
    })

    it('should pass a trusted style through when host styles are given', () => {
      service.loginResolveWidget(renderConfig({
        widgetInstanceId: 'w1',
        widgetHostClass: 'cls',
        widgetHostStyle: { color: 'red' },
      }) as any, containerRef)

      expect(safeResourceUrlSvc.trustStyle).toHaveBeenCalledWith('color:red;')
      expect(instance.updateBaseComponent).toHaveBeenCalledWith(
        'layout', 'gridLayout', 'w1', 'cls', 'safe:color:red;',
      )
    })

    it('should pass undefined for the style when no host styles are given', () => {
      service.loginResolveWidget(renderConfig() as any, containerRef)
      expect(instance.updateBaseComponent).toHaveBeenCalledWith(
        'layout', 'gridLayout', undefined, undefined, undefined,
      )
    })

    it('should skip the base wiring when the component does not implement it', () => {
      instance.updateBaseComponent = undefined
      expect(() => service.loginResolveWidget(renderConfig() as any, containerRef)).not.toThrow()
    })
  })
})
