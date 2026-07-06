jest.mock('@ws-widget/utils', () => ({
  NsAppsConfig: {},
  ConfigurationsService: class {
    appsConfig = null
    pageNavBar = {}
    tourGuideNotifier = { next: jest.fn(), subscribe: jest.fn((cb: any) => { cb(false); return { unsubscribe: jest.fn() } }) }
    restrictedFeatures = null
  },
  NsPage: {},
  LogoutComponent: class {},
  SubapplicationRespondService: class { unsubscribeResponse = jest.fn() },
  ValueService: class { isXSmall$ = { subscribe: jest.fn((cb: any) => cb(false)) } },
}))

jest.mock('@ws-widget/resolver', () => ({
  NsWidgetResolver: {},
}))

jest.mock('@ws-widget/collection', () => ({
  ROOT_WIDGET_CONFIG: {
    actionButton: { _type: 'actionButton', feature: 'feature' },
  },
}))

jest.mock('../../../../project/ws/author/src/public-api', () => ({
  AccessControlService: class { hasRole = jest.fn().mockReturnValue(true) },
}))

import { UntypedFormControl } from '@angular/forms'
import { BehaviorSubject } from 'rxjs'
import { FeaturesComponent } from './features.component'

describe('FeaturesComponent', () => {
  let component: FeaturesComponent
  let mockDialog: any
  let mockRouter: any
  let mockRoute: any
  let mockConfigSvc: any
  let mockRespondSvc: any
  let mockValueSvc: any
  let mockAccessService: any

  beforeEach(() => {
    mockDialog = { open: jest.fn() }
    mockRouter = { navigate: jest.fn() }
    mockRoute = { snapshot: { queryParamMap: { get: jest.fn().mockReturnValue(null) } } }
    mockConfigSvc = {
      appsConfig: null,
      pageNavBar: {},
      tourGuideNotifier: { next: jest.fn(), subscribe: jest.fn().mockReturnValue({ unsubscribe: jest.fn() }) },
      restrictedFeatures: null,
    }
    mockRespondSvc = { unsubscribeResponse: jest.fn() }
    mockValueSvc = { isXSmall$: { subscribe: jest.fn((cb: any) => cb(false)) } }
    mockAccessService = { hasRole: jest.fn().mockReturnValue(true) }

    component = new FeaturesComponent(
      mockDialog,
      mockRouter,
      mockRoute,
      mockConfigSvc,
      mockRespondSvc,
      mockValueSvc,
      mockAccessService,
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should default featureGroups to null', () => {
    expect(component.featureGroups).toBeNull()
  })

  it('should default isTourGuideAvailable to false', () => {
    expect(component.isTourGuideAvailable).toBe(false)
  })

  it('should default isXSmall to false', () => {
    expect(component.isXSmall).toBe(false)
  })

  it('should set isXSmall true when valueSvc emits true', () => {
    mockValueSvc.isXSmall$ = { subscribe: jest.fn((cb: any) => cb(true)) }
    component = new FeaturesComponent(mockDialog, mockRouter, mockRoute, mockConfigSvc, mockRespondSvc, mockValueSvc, mockAccessService)
    expect(component.isXSmall).toBe(true)
  })

  it('should initialize queryControl as UntypedFormControl', () => {
    expect(component.queryControl).toBeInstanceOf(UntypedFormControl)
  })

  describe('clear', () => {
    it('should set queryControl value to empty string', () => {
      component.queryControl.setValue('some query')
      component.clear()
      expect(component.queryControl.value).toBe('')
    })
  })

  describe('ngOnDestroy', () => {
    it('should call tourGuideNotifier.next(false) on destroy', () => {
      component.ngOnInit()
      component.ngOnDestroy()
      expect(mockConfigSvc.tourGuideNotifier.next).toHaveBeenCalledWith(false)
    })
  })

  describe('logout', () => {
    it('should open dialog on logout()', () => {
      component.logout()
      expect(mockDialog.open).toHaveBeenCalled()
    })
  })

  describe('startTour', () => {
    it('should call unsubscribeResponse when responseSubscription is set', () => {
      const mockSub = { unsubscribe: jest.fn() }
      component['responseSubscription'] = mockSub as any
      component.startTour()
      expect(mockRespondSvc.unsubscribeResponse).toHaveBeenCalled()
      expect(mockSub.unsubscribe).toHaveBeenCalled()
    })

    it('should not throw when responseSubscription is null', () => {
      component['responseSubscription'] = null
      expect(() => component.startTour()).not.toThrow()
    })
  })

  describe('ngOnInit', () => {
    it('should set featureGroups after debounce', () => {
      jest.useFakeTimers()
      component.ngOnInit()
      jest.advanceTimersByTime(600)
      expect(component.featureGroups).toBeDefined()
      jest.useRealTimers()
    })

    it('should navigate with q param when query changes', () => {
      jest.useFakeTimers()
      component.ngOnInit()
      component.queryControl.setValue('angular')
      jest.advanceTimersByTime(600)
      expect(mockRouter.navigate).toHaveBeenCalledWith([], { queryParams: { q: 'angular' } })
      jest.useRealTimers()
    })

    it('should set isTourGuideAvailable when restrictedFeatures does not include tourGuide', () => {
      mockConfigSvc.restrictedFeatures = new Set(['otherFeature'])
      mockConfigSvc.tourGuideNotifier = {
        next: jest.fn(),
        subscribe: jest.fn((cb: any) => { cb(true); return { unsubscribe: jest.fn() } }),
      }
      jest.useFakeTimers()
      component.ngOnInit()
      jest.advanceTimersByTime(600)
      expect(component.isTourGuideAvailable).toBe(true)
      jest.useRealTimers()
    })

    it('should NOT set isTourGuideAvailable when restrictedFeatures has tourGuide', () => {
      mockConfigSvc.restrictedFeatures = new Set(['tourGuide'])
      mockConfigSvc.tourGuideNotifier = {
        next: jest.fn(),
        subscribe: jest.fn((cb: any) => { cb(true); return { unsubscribe: jest.fn() } }),
      }
      jest.useFakeTimers()
      component.ngOnInit()
      jest.advanceTimersByTime(600)
      expect(component.isTourGuideAvailable).toBe(false)
      jest.useRealTimers()
    })
  })

  describe('filteredFeatures', () => {
    let componentWithFeatures: FeaturesComponent

    beforeEach(() => {
      mockConfigSvc.appsConfig = {
        groups: [{ hasRole: [], featureIds: ['f1', 'f2'], name: 'Group 1' }],
        features: {
          f1: { name: 'Angular Testing', keywords: ['unit', 'test'], description: 'testing angular desc' },
          f2: { name: 'React Guide', keywords: ['jsx'], description: null },
        },
      }
      componentWithFeatures = new FeaturesComponent(
        mockDialog, mockRouter, mockRoute, mockConfigSvc, mockRespondSvc, mockValueSvc, mockAccessService,
      )
    })

    it('should return all featuresConfig when query is empty', () => {
      const result = (componentWithFeatures as any).filteredFeatures('')
      expect(result).toHaveLength(1)
      expect(result[0].featureWidgets).toHaveLength(2)
    })

    it('should filter by feature name match', () => {
      const result = (componentWithFeatures as any).filteredFeatures('angular')
      expect(result).toHaveLength(1)
      expect(result[0].featureWidgets).toHaveLength(1)
    })

    it('should filter by keyword match', () => {
      const result = (componentWithFeatures as any).filteredFeatures('unit')
      expect(result).toHaveLength(1)
      expect(result[0].featureWidgets).toHaveLength(1)
    })

    it('should filter by description match', () => {
      const result = (componentWithFeatures as any).filteredFeatures('testing angular desc')
      expect(result).toHaveLength(1)
    })

    it('should return empty array when no features match query', () => {
      const result = (componentWithFeatures as any).filteredFeatures('xyz-no-match')
      expect(result).toHaveLength(0)
    })

    it('should return empty array when featuresConfig is null', () => {
      componentWithFeatures['featuresConfig'] = null as any
      const result = (componentWithFeatures as any).filteredFeatures('query')
      expect(result).toEqual([])
    })
  })

  describe('queryMatchForFeature', () => {
    it('should return false when feature is undefined', () => {
      const result = (component as any).queryMatchForFeature(undefined, 'query')
      expect(result).toBe(false)
    })

    it('should return true when feature name includes query (case-sensitive)', () => {
      const feature = { name: 'angular testing', keywords: [], description: null }
      expect((component as any).queryMatchForFeature(feature, 'angular')).toBe(true)
    })

    it('should return true when keyword includes query', () => {
      const feature = { name: 'Test', keywords: ['angular', 'jest'], description: null }
      expect((component as any).queryMatchForFeature(feature, 'jest')).toBe(true)
    })

    it('should return true when description includes query', () => {
      const feature = { name: 'Test', keywords: [], description: 'a testing framework' }
      expect((component as any).queryMatchForFeature(feature, 'framework')).toBe(true)
    })

    it('should return false when nothing matches', () => {
      const feature = { name: 'angular', keywords: ['rxjs'], description: 'reactive' }
      expect((component as any).queryMatchForFeature(feature, 'xyz-no-match')).toBe(false)
    })
  })

  describe('constructor with appsConfig', () => {
    it('should call tourGuideNotifier.next(true) when appsConfig has tourGuide', () => {
      mockConfigSvc.appsConfig = { tourGuide: { steps: [] }, groups: [], features: {} }
      component = new FeaturesComponent(mockDialog, mockRouter, mockRoute, mockConfigSvc, mockRespondSvc, mockValueSvc, mockAccessService)
      expect(mockConfigSvc.tourGuideNotifier.next).toHaveBeenCalledWith(true)
    })

    it('should populate featuresConfig when appsConfig has groups', () => {
      mockConfigSvc.appsConfig = {
        groups: [{ hasRole: [], featureIds: ['f1'], name: 'Group 1' }],
        features: { f1: { name: 'Feature 1', keywords: ['kw1'], description: 'desc1' } },
      }
      component = new FeaturesComponent(mockDialog, mockRouter, mockRoute, mockConfigSvc, mockRespondSvc, mockValueSvc, mockAccessService)
      expect(component['featuresConfig']).toHaveLength(1)
    })

    it('should skip groups that hasRole returns false for', () => {
      mockAccessService.hasRole = jest.fn().mockReturnValue(false)
      mockConfigSvc.appsConfig = {
        groups: [{ hasRole: ['admin'], featureIds: ['f1'], name: 'Admin Group' }],
        features: { f1: { name: 'Feature 1', keywords: [], description: '' } },
      }
      component = new FeaturesComponent(mockDialog, mockRouter, mockRoute, mockConfigSvc, mockRespondSvc, mockValueSvc, mockAccessService)
      expect(component['featuresConfig']).toHaveLength(0)
    })
  })
})
