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
})
