import { ExploreResolverService } from './explore-resolver.service'
import { InvalidRegistrationComponent } from './invalid-registration/invalid-registration.component'
import { UnresolvedComponent } from './unresolved/unresolved.component'

describe('ExploreResolverService', () => {
  let service: ExploreResolverService
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
    new ExploreResolverService(safeResourceUrlSvc, global, scoped)

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
    expect(ExploreResolverService.getWidgetKey({ widgetType: 'a', widgetSubType: 'b' })).toBe('widget:a::b')
  })

  describe('initialize', () => {
    it('should mark the service initialized', () => {
      service.initialize()
      expect(service.isInitialized).toBe(true)
    })

    it('should tolerate non-array configs', () => {
      service = build(null, undefined)
      expect(() => service.initialize()).not.toThrow()
    })
  })

  describe('exploreResolveWidget', () => {
    it('should render the unresolved component before initialize', () => {
      service.exploreResolveWidget(renderConfig() as any, containerRef)
      expect(containerRef.createComponent).toHaveBeenCalledWith(UnresolvedComponent)
    })

    it('should lazily register the allow-listed widgets on the first lookup', () => {
      service.initialize()
      service.exploreResolveWidget(renderConfig() as any, containerRef)
      expect(containerRef.createComponent).toHaveBeenCalledWith(DummyComponent)
    })

    it('should serve an allow-listed widget once the registry is warm', () => {
      service.initialize()
      service.exploreResolveWidget(renderConfig() as any, containerRef)
      containerRef.createComponent.mockClear()

      service.exploreResolveWidget(renderConfig({ widgetType: 'card', widgetSubType: 'cardContent' }) as any, containerRef)
      expect(containerRef.createComponent).toHaveBeenCalledWith(DummyComponent)
    })

    it('should render the unresolved component for a widget outside the allow list', () => {
      service.initialize()
      service.exploreResolveWidget(
        renderConfig({ widgetType: 'unrelated', widgetSubType: 'notAllowListed' }) as any, containerRef,
      )
      expect(containerRef.createComponent).toHaveBeenCalledWith(UnresolvedComponent)
    })

    it('should render the invalid-registration component when the entry has no component', () => {
      service = build([{ widgetType: 'layout', widgetSubType: 'gridLayout' } as any])
      service.initialize()
      service.exploreResolveWidget(renderConfig() as any, containerRef)
      expect(containerRef.createComponent).toHaveBeenCalledWith(InvalidRegistrationComponent)
    })

    it('should render the unresolved component when the global config is missing', () => {
      service = build(null)
      service.initialize()
      service.exploreResolveWidget(renderConfig() as any, containerRef)
      expect(containerRef.createComponent).toHaveBeenCalledWith(UnresolvedComponent)
    })
  })

  describe('base component wiring', () => {
    beforeEach(() => {
      service.initialize()
    })

    it('should pass a trusted style through when host styles are given', () => {
      service.exploreResolveWidget(renderConfig({
        widgetInstanceId: 'w1',
        widgetHostClass: 'cls',
        widgetHostStyle: { color: 'blue', padding: '2px' },
      }) as any, containerRef)

      expect(safeResourceUrlSvc.trustStyle).toHaveBeenCalledWith('color:blue;padding:2px;')
      expect(instance.updateBaseComponent).toHaveBeenCalledWith(
        'layout', 'gridLayout', 'w1', 'cls', 'safe:color:blue;padding:2px;',
      )
    })

    it('should pass undefined for the style when no host styles are given', () => {
      service.exploreResolveWidget(renderConfig() as any, containerRef)
      expect(instance.updateBaseComponent).toHaveBeenCalledWith(
        'layout', 'gridLayout', undefined, undefined, undefined,
      )
    })

    it('should skip the base wiring when the component does not implement it', () => {
      instance.updateBaseComponent = undefined
      expect(() => service.exploreResolveWidget(renderConfig() as any, containerRef)).not.toThrow()
    })
  })
})
