jest.mock('@ws-widget/utils', () => ({
  ValueService: class {
    isLtMedium$ = { subscribe: jest.fn(), pipe: jest.fn() }
  },
  ConfigurationsService: class {
    pageNavBar = {}
    restrictedFeatures: Set<string> | null = null
  },
  EFeatures: { FAQ: 'faq' },
  NsPage: {},
}))

import { of, BehaviorSubject } from 'rxjs'
import { map } from 'rxjs/operators'
import { PublicFaqComponent } from './public-faq.component'

describe('PublicFaqComponent', () => {
  let component: PublicFaqComponent
  let mockRoute: any
  let mockValueSvc: any
  let mockConfigSvc: any
  let ltMediumSubject: BehaviorSubject<boolean>

  beforeEach(() => {
    ltMediumSubject = new BehaviorSubject(false)
    mockValueSvc = {
      isLtMedium$: ltMediumSubject.asObservable(),
    }
    mockConfigSvc = {
      pageNavBar: {},
      restrictedFeatures: null,
    }
    mockRoute = {
      paramMap: new BehaviorSubject({ get: (key: string) => key === 'tab' ? 'login' : null }),
    }
    component = new PublicFaqComponent(mockRoute as any, mockValueSvc, mockConfigSvc)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should default sideNavBarOpened to true', () => {
    expect(component.sideNavBarOpened).toBe(true)
  })

  it('should default isFaqFeature to true', () => {
    expect(component.isFaqFeature).toBe(true)
  })

  it('should have defined tabs array', () => {
    expect(component.tabs).toContain('login')
    expect(component.tabs).toContain('video')
    expect(component.tabs.length).toBeGreaterThan(0)
  })

  it('should set isFaqFeature false when FAQ is in restrictedFeatures', () => {
    mockConfigSvc.restrictedFeatures = new Set(['faq'])
    component.ngOnInit()
    expect(component.isFaqFeature).toBe(false)
  })

  it('should keep isFaqFeature true when FAQ is not restricted', () => {
    mockConfigSvc.restrictedFeatures = new Set(['otherFeature'])
    component.ngOnInit()
    expect(component.isFaqFeature).toBe(true)
  })

  it('should close sideNav when screen is LtMedium', () => {
    component.ngOnInit()
    ltMediumSubject.next(true)
    expect(component.sideNavBarOpened).toBe(false)
    expect(component.screenSizeIsLtMedium).toBe(true)
  })

  it('should open sideNav when screen is not LtMedium', () => {
    component.ngOnInit()
    ltMediumSubject.next(false)
    expect(component.sideNavBarOpened).toBe(true)
  })

  it('should set currentTab from route paramMap', () => {
    component.ngOnInit()
    expect(component.currentTab).toBe('login')
  })

  it('should default unknown tab to "login"', () => {
    mockRoute.paramMap = new BehaviorSubject({ get: (key: string) => key === 'tab' ? 'unknownTab' : null })
    component = new PublicFaqComponent(mockRoute as any, mockValueSvc, mockConfigSvc)
    component.ngOnInit()
    expect(component.currentTab).toBe('login')
  })

  it('should toggle sideNavBarOpened when screen is small on sideNavOnClick()', () => {
    component.screenSizeIsLtMedium = true
    component.sideNavBarOpened = false
    component.sideNavOnClick()
    expect(component.sideNavBarOpened).toBe(true)
  })

  it('should not toggle sideNavBarOpened when screen is not small', () => {
    component.screenSizeIsLtMedium = false
    component.sideNavBarOpened = false
    component.sideNavOnClick()
    expect(component.sideNavBarOpened).toBe(false)
  })

  it('should unsubscribe on ngOnDestroy', () => {
    component.ngOnInit()
    expect(() => component.ngOnDestroy()).not.toThrow()
  })

  it('mode$ emits "side" for false and "over" for true from isLtMedium$', () => {
    let result: any
    component.mode$.subscribe((v: any) => { result = v })
    expect(result).toBe('side')
    ltMediumSubject.next(true)
    expect(result).toBe('over')
  })
})
