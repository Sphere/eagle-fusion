import { of } from 'rxjs'
import { ProfileComponent } from './profile.component'

describe('ProfileComponent', () => {
  let component: ProfileComponent
  let mockDialog: any
  let mockValueSvc: any
  let mockConfigSvc: any
  let mockActivatedRoute: any
  let mockRouter: any
  let enabledTabs: any

  const createComponent = () => new ProfileComponent(
    mockDialog, mockValueSvc, mockConfigSvc, mockActivatedRoute, mockRouter,
  )

  beforeEach(() => {
    mockDialog = { open: jest.fn() }
    mockValueSvc = { isLtMedium$: of(false) }
    mockConfigSvc = { pageNavBar: {} }
    enabledTabs = {
      dashboard: { displayName: 'Dashboard' },
      learning: { displayName: 'Learning' },
      achievements: { displayName: 'Achievements' },
      interests: { displayName: 'Interests' },
      plans: { displayName: 'Plans' },
      collaborators: { displayName: 'Collaborators' },
      featureUsage: { displayName: 'Feature Usage' },
      settings: { displayName: 'Settings' },
    }
    mockActivatedRoute = { snapshot: { data: { pageData: { data: { enabledTabs } } } } }
    mockRouter = { navigate: jest.fn(), url: '/app/profile/dashboard' }
    component = createComponent()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  describe('ngOnInit', () => {
    it('navigates to profile-view', () => {
      component.ngOnInit()
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/profile-view'])
    })

    it.each([
      ['dashboard', 'Dashboard'],
      ['learning', 'Learning'],
      ['competency', 'Achievements'],
      ['interest', 'Interests'],
      ['plans', 'Plans'],
      ['collaborators', 'Collaborators'],
      ['feature-usage', 'Feature Usage'],
      ['settings', 'Settings'],
    ])('sets tabName for url segment %s', (segment: string, expected: string) => {
      mockRouter.url = `/app/profile/${segment}/x`
      component.ngOnInit()
      expect(component.tabName).toBe(expected)
    })

    it('leaves tabName unchanged for an unrecognized segment', () => {
      mockRouter.url = '/app/profile/unknown/x'
      component.ngOnInit()
      expect(component.tabName).toBe('')
    })

    it('subscribes to isLtMedium$ and updates screenSizeIsLtMedium', () => {
      mockValueSvc.isLtMedium$ = of(true)
      component = createComponent()
      component.ngOnInit()
      expect(component.screenSizeIsLtMedium).toBe(true)
    })
  })

  describe('tabUpdate', () => {
    it('sets tabName and toggles showText when not in ltMedium mode', () => {
      component.screenSizeIsLtMedium = false
      component.showText = true
      component.tabUpdate('learning')
      expect(component.tabName).toBe('learning')
      expect(component.showText).toBe(false)
    })

    it('does not toggle showText when in ltMedium mode', () => {
      component.screenSizeIsLtMedium = true
      component.showText = true
      component.tabUpdate('learning')
      expect(component.showText).toBe(true)
    })
  })

  describe('ngOnDestroy', () => {
    it('unsubscribes the subscription when present', () => {
      component.ngOnInit()
      const unsubSpy = jest.spyOn((component as any).defaultSideNavBarOpenedSubscription, 'unsubscribe')
      component.ngOnDestroy()
      expect(unsubSpy).toHaveBeenCalled()
    })

    it('does nothing when subscription is null', () => {
      expect(() => component.ngOnDestroy()).not.toThrow()
    })
  })

  describe('logout', () => {
    it('opens the logout dialog', () => {
      component.logout()
      expect(mockDialog.open).toHaveBeenCalled()
    })
  })
})
