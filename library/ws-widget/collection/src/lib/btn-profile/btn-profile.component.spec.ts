import { of } from 'rxjs'
import { BtnProfileComponent } from './btn-profile.component'

const mockDialog: any = { open: jest.fn() }
const mockAccessService: any = { hasRole: jest.fn().mockReturnValue(true) }
const mockValueSvc: any = { isXSmall$: of(false) }
const mockRouter: any = { navigate: jest.fn() }
const mockLocation: any = { path: jest.fn().mockReturnValue('/home') }
const mockUserProfileSvc: any = { getUserdetailsFromRegistry: jest.fn() }
const mockLogger: any = { log: jest.fn() }

function baseConfigSvc(overrides: any = {}): any {
  return {
    userProfile: {
      firstName: 'John',
      lastName: 'Doe',
      profileImage: null,
      userId: 'user-1',
    },
    userProfileV2: undefined,
    appsConfig: {
      groups: [
        { hasRole: [], featureIds: ['feature-1', 'feature-2'], id: 'portal_admin' },
        { hasRole: ['ADMIN'], featureIds: [], id: 'grp2' },
      ],
      features: {
        'feature-1': { permission: [] },
        'feature-2': { permission: ['SOME_ROLE'] },
      },
    },
    unMappedUser: undefined,
    pinnedApps: of(new Set(['feature-1'])),
    ...overrides,
  }
}

function createComponent(configSvc: any = baseConfigSvc()): BtnProfileComponent {
  return new BtnProfileComponent(
    configSvc,
    mockDialog,
    mockAccessService,
    mockValueSvc,
    mockRouter,
    mockLocation,
    mockUserProfileSvc,
    mockLogger,
  )
}

describe('BtnProfileComponent', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockAccessService.hasRole.mockReturnValue(true)
    localStorage.clear()
  })

  it('should create and set givenName and profileImage from userProfile', () => {
    const component = createComponent()
    expect(component).toBeTruthy()
    expect(component.givenName).toBe('John Doe')
    expect(component.route).toBe('/home')
  })

  it('should fall back to userProfileV2 profileImage', () => {
    const configSvc = baseConfigSvc({
      userProfile: { firstName: 'A', lastName: 'B', profileImage: null, userId: 'user-2' },
      userProfileV2: { profileImage: 'v2-image.png' },
    })
    const component = createComponent(configSvc)
    expect(component.profileImage).toBe('v2-image.png')
  })

  it('should read profileImage from localStorage when not otherwise set', () => {
    localStorage.setItem('user-3', 'local-image.png')
    const configSvc = baseConfigSvc({
      userProfile: { firstName: 'A', lastName: 'B', profileImage: null, userId: 'user-3' },
    })
    const component = createComponent(configSvc)
    expect(component.profileImage).toBe('local-image.png')
  })

  it('should not set user fields when no userProfile', () => {
    const configSvc = baseConfigSvc({ userProfile: undefined })
    const component = createComponent(configSvc)
    expect(component.givenName).toBe('Guest')
  })

  it('should not set featuresConfig when no appsConfig', () => {
    const configSvc = baseConfigSvc({ appsConfig: undefined })
    const component = createComponent(configSvc)
    const getPortalSpy = jest.spyOn(component, 'getPortalLinks')
    component.ngOnInit()
    expect(getPortalSpy).not.toHaveBeenCalled()
  })

  it('should exclude groups when hasRole returns false', () => {
    mockAccessService.hasRole.mockReturnValue(false)
    const configSvc = baseConfigSvc({
      appsConfig: {
        groups: [
          { hasRole: ['ADMIN'], featureIds: ['feature-1'], id: 'portal_admin' },
        ],
        features: { 'feature-1': { permission: [] } },
      },
    })
    const component = createComponent(configSvc)
    component.ngOnInit()
    expect(component.portalLinks.length).toBe(0)
  })

  it('should set widgetData.actionBtnId as id on init', () => {
    const component = createComponent()
    component.widgetData = { actionBtnId: 'custom-id' }
    component.ngOnInit()
    expect(component.id).toBe('custom-id')
  })

  it('should call getPortalLinks and populate portalLinks for portal_admin group', () => {
    const component = createComponent()
    component.ngOnInit()
    expect(component.portalLinks.length).toBeGreaterThan(0)
  })

  it('should unsubscribe pinnedAppsSubs on destroy', () => {
    const component = createComponent()
    component.setPinnedApps()
    const unsubSpy = jest.spyOn((component as any).pinnedAppsSubs, 'unsubscribe')
    component.ngOnDestroy()
    expect(unsubSpy).toHaveBeenCalled()
  })

  it('should not throw on destroy when no subscription', () => {
    const component = createComponent()
    expect(() => component.ngOnDestroy()).not.toThrow()
  })

  it('should open logout dialog', () => {
    const component = createComponent()
    component.logout()
    expect(mockDialog.open).toHaveBeenCalled()
  })

  it('should navigate to profile-view when redirect has dob', async () => {
    const configSvc = baseConfigSvc({ unMappedUser: { id: 'u1' } })
    mockUserProfileSvc.getUserdetailsFromRegistry.mockReturnValue(of({
      profileDetails: { profileReq: { personalDetails: { dob: '2000-01-01' } } },
    }))
    const component = createComponent(configSvc)
    component.redirect()
    await Promise.resolve()
    await Promise.resolve()
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/profile-view'])
  })

  it('should navigate to about-you when redirect has no dob', async () => {
    const configSvc = baseConfigSvc({ unMappedUser: { id: 'u1' } })
    mockUserProfileSvc.getUserdetailsFromRegistry.mockReturnValue(of({
      profileDetails: { profileReq: { personalDetails: { dob: undefined } } },
    }))
    const component = createComponent(configSvc)
    component.redirect()
    await Promise.resolve()
    await Promise.resolve()
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/about-you'], { queryParams: { redirect: '/page/home' } })
  })

  it('should not call getUserdetailsFromRegistry when no unMappedUser', () => {
    const component = createComponent()
    component.redirect()
    expect(mockUserProfileSvc.getUserdetailsFromRegistry).not.toHaveBeenCalled()
  })

  it('should set pinnedApps filtered by appsConfig.features', () => {
    const component = createComponent()
    component.setPinnedApps()
    expect(component.pinnedApps.length).toBe(1)
  })

  it('should return early in setPinnedApps when appsConfig missing', () => {
    const configSvc = baseConfigSvc({ appsConfig: undefined })
    const component = createComponent(configSvc)
    component.pinnedApps = []
    component.setPinnedApps()
    expect(component.pinnedApps.length).toBe(0)
  })
})
