import { WidgetResolverService } from './widget-resolver.service'
import { RestrictedComponent } from './restricted/restricted.component'
import { InvalidRegistrationComponent } from './invalid-registration/invalid-registration.component'
import { InvalidPermissionComponent } from './invalid-permission/invalid-permission.component'
import { UnresolvedComponent } from './unresolved/unresolved.component'

describe('WidgetResolverService', () => {
  let service: WidgetResolverService
  let safeResourceUrlSvc: any
  let containerRef: any
  let instance: any

  class DummyComponent { }

  const globalConfig = [
    { widgetType: 'card', widgetSubType: 'cardContent', component: DummyComponent as any },
    { widgetType: 'layout', widgetSubType: 'gridLayout', component: DummyComponent as any },
  ]
  const scopedConfig = [
    { widgetType: 'slider', widgetSubType: 'sliderBanners', component: DummyComponent as any },
  ]

  const renderConfig = (overrides: any = {}) => ({
    widgetType: 'card',
    widgetSubType: 'cardContent',
    widgetData: { title: 'x' },
    ...overrides,
  })

  const build = (global: any = globalConfig, scoped: any = scopedConfig) =>
    new WidgetResolverService(safeResourceUrlSvc, global, scoped)

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

  describe('getWidgetKey', () => {
    it('should namespace the type and sub type', () => {
      expect(WidgetResolverService.getWidgetKey({ widgetType: 'a', widgetSubType: 'b' }))
        .toBe('widget:a::b')
    })
  })

  describe('initialize', () => {
    it('should register the global and scoped widgets', () => {
      service.initialize(null, null, null, null)
      expect(service.isInitialized).toBe(true)
      service.resolveWidget(renderConfig({ widgetType: 'slider', widgetSubType: 'sliderBanners' }) as any, containerRef)
      expect(containerRef.createComponent).toHaveBeenCalledWith(DummyComponent)
    })

    it('should skip widgets listed as restricted', () => {
      service.initialize(new Set(['widget:card::cardContent']), null, null, null)
      service.resolveWidget(renderConfig() as any, containerRef)
      expect(containerRef.createComponent).toHaveBeenCalledWith(RestrictedComponent)
    })

    it('should tolerate non-array configs', () => {
      service = build(null, undefined)
      service.initialize(null, null, null, null)
      service.resolveWidget(renderConfig() as any, containerRef)
      expect(containerRef.createComponent).toHaveBeenCalledWith(UnresolvedComponent)
    })
  })

  describe('resolveWidget', () => {
    beforeEach(() => {
      service.initialize(null, new Set(['admin']), new Set(['g1']), new Set(['blocked']))
    })

    it('should render the registered component', () => {
      const ref = service.resolveWidget(renderConfig() as any, containerRef)
      expect(containerRef.clear).toHaveBeenCalled()
      expect(containerRef.createComponent).toHaveBeenCalledWith(DummyComponent)
      expect(ref!.instance.widgetData).toEqual({ title: 'x' })
    })

    it('should render the unresolved component for an unknown widget', () => {
      service.resolveWidget(renderConfig({ widgetSubType: 'nope' }) as any, containerRef)
      expect(containerRef.createComponent).toHaveBeenCalledWith(UnresolvedComponent)
    })

    it('should render the invalid-permission component when permissions fail', () => {
      const config = renderConfig({
        widgetPermission: { enabled: true, available: true, roles: { all: ['superadmin'] } },
      })
      service.resolveWidget(config as any, containerRef)
      expect(containerRef.createComponent).toHaveBeenCalledWith(InvalidPermissionComponent)
    })

    it('should render the widget when permissions pass', () => {
      const config = renderConfig({
        widgetPermission: { enabled: true, available: true, roles: { all: ['admin'] }, groups: { all: ['g1'] } },
      })
      service.resolveWidget(config as any, containerRef)
      expect(containerRef.createComponent).toHaveBeenCalledWith(DummyComponent)
    })

    it('should render the invalid-registration component when the entry has no component', () => {
      service = build([{ widgetType: 'card', widgetSubType: 'cardContent' } as any], null)
      service.initialize(null, null, null, null)
      service.resolveWidget(renderConfig() as any, containerRef)
      expect(containerRef.createComponent).toHaveBeenCalledWith(InvalidRegistrationComponent)
    })
  })

  describe('base component wiring', () => {
    beforeEach(() => {
      service.initialize(null, null, null, null)
    })

    it('should pass a trusted style through when host styles are given', () => {
      const config = renderConfig({
        widgetInstanceId: 'w1',
        widgetHostClass: 'my-class',
        widgetHostStyle: { color: 'red', margin: '4px' },
      })
      service.resolveWidget(config as any, containerRef)

      expect(safeResourceUrlSvc.trustStyle).toHaveBeenCalledWith('color:red;margin:4px;')
      expect(instance.updateBaseComponent).toHaveBeenCalledWith(
        'card', 'cardContent', 'w1', 'my-class', 'safe:color:red;margin:4px;',
      )
    })

    it('should pass undefined for the style when no host styles are given', () => {
      service.resolveWidget(renderConfig() as any, containerRef)
      expect(safeResourceUrlSvc.trustStyle).not.toHaveBeenCalled()
      expect(instance.updateBaseComponent).toHaveBeenCalledWith(
        'card', 'cardContent', undefined, undefined, undefined,
      )
    })

    it('should skip the base wiring when the component does not implement it', () => {
      instance.updateBaseComponent = undefined
      expect(() => service.resolveWidget(renderConfig() as any, containerRef)).not.toThrow()
    })
  })
})
