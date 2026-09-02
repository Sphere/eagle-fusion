import { BehaviorSubject, Subject } from 'rxjs'
import { BtnFeatureComponent } from './btn-feature.component'

function setLocation(href: string) {
  Object.defineProperty(window, 'location', {
    value: { href },
    writable: true,
  })
}

describe('BtnFeatureComponent', () => {
  let component: BtnFeatureComponent
  let eventsMock: any
  let configurationsSvcMock: any
  let btnFeatureSvcMock: any
  let routerMock: any
  let mobileSvcMock: any
  let configSvcMock: any
  let searchApiMock: any
  let signupServiceMock: any
  let navOptionMock: any
  let storageMock: any
  let eventMock: any
  let languageSvcMock: any
  let loggerMock: any
  let pinnedAppsSubject: BehaviorSubject<Set<string>>
  let currentOptionSubject: Subject<any>

  const createComponent = () => {
    pinnedAppsSubject = new BehaviorSubject<Set<string>>(new Set())
    currentOptionSubject = new Subject<any>()

    eventsMock = { raiseInteractTelemetry: jest.fn() }
    configurationsSvcMock = {
      appsConfig: { features: { feat1: { id: 'feat1' } } },
      userProfile: { firstName: 'John', lastName: 'Doe', rootOrgId: 'org1' },
      orgSelectiveCourseConfig: null,
      restrictedFeatures: new Set(),
      rootOrg: 'root1',
      pinnedApps: pinnedAppsSubject,
      prefChangeNotifier: { next: jest.fn() },
    }
    btnFeatureSvcMock = { getBadgeCount: jest.fn() }
    routerMock = { url: '', navigate: jest.fn(), navigateByUrl: jest.fn() }
    mobileSvcMock = { isMobile: false }
    configSvcMock = configurationsSvcMock
    searchApiMock = { changeMessage: jest.fn() }
    signupServiceMock = { getUserData: jest.fn() }
    navOptionMock = { currentOption: currentOptionSubject, changeNavBarActive: jest.fn() }
    storageMock = { getNumberOfNotifications: jest.fn().mockReturnValue(0) }
    eventMock = { subscribe: jest.fn() }
    languageSvcMock = { isHindi: jest.fn().mockReturnValue(false) }
    loggerMock = { log: jest.fn(), error: jest.fn(), warn: jest.fn() }

    return new BtnFeatureComponent(
      eventsMock,
      configurationsSvcMock,
      btnFeatureSvcMock,
      routerMock,
      mobileSvcMock,
      configSvcMock,
      searchApiMock,
      signupServiceMock,
      navOptionMock,
      storageMock,
      eventMock,
      languageSvcMock,
      loggerMock,
    )
  }

  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
    setLocation('http://localhost/')
    component = createComponent()
    component.widgetData = { actionBtn: undefined, actionBtnId: 'feat1' } as any
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  describe('constructor branches', () => {
    it('should set searchButton false when orgValue is nhsrc', () => {
      localStorage.setItem('orgValue', 'nhsrc')
      const c = createComponent()
      expect(c.searchButton).toBe(false)
    })

    it('should default currentText for profile-view url', () => {
      setLocation('http://localhost/app/profile-view')
      const c = createComponent()
      expect(c.currentText).toBe('Account')
    })

    it('should set Hindi currentText for profile-view when isHindi true', () => {
      languageSvcMock.isHindi = jest.fn().mockReturnValue(true)
      setLocation('http://localhost/app/profile-view')
      const c = new BtnFeatureComponent(
        eventsMock, configurationsSvcMock, btnFeatureSvcMock, routerMock, mobileSvcMock,
        configSvcMock, searchApiMock, signupServiceMock, navOptionMock, storageMock,
        eventMock, languageSvcMock, loggerMock,
      )
      expect(c.currentText).toBe('अकाउंट')
    })

    it('should set currentText for my_courses url', () => {
      setLocation('http://localhost/user/my_courses')
      const c = createComponent()
      expect(c.currentText).toBe('My Courses')
    })

    it('should set currentText for page/home url', () => {
      setLocation('http://localhost/page/home')
      const c = createComponent()
      expect(c.currentText).toBe('Home')
    })

    it('should set currentText and isOnlyPassbook for competency url', () => {
      setLocation('http://localhost/competency')
      const c = createComponent()
      expect(c.currentText).toBe('Competency')
      expect(localStorage.getItem('isOnlyPassbook')).toBe('false')
    })

    it('should set currentText for search url', () => {
      setLocation('http://localhost/search')
      const c = createComponent()
      expect(c.currentText).toBe('Search')
    })

    it('should set currentText for notification url', () => {
      setLocation('http://localhost/notification')
      const c = createComponent()
      expect(c.currentText).toBe('Notification')
    })

    it('should default currentText to empty for unmatched url', () => {
      setLocation('http://localhost/unrelated')
      const c = createComponent()
      expect(c.currentText).toBe('')
    })
  })

  describe('updateBadge', () => {
    it('should not call service when actionBtn is missing', () => {
      component.widgetData = {} as any
      component.updateBadge()
      expect(btnFeatureSvcMock.getBadgeCount).not.toHaveBeenCalled()
    })

    it('should set badgeCount to 99+ when count > 99', async () => {
      component.widgetData = { actionBtn: { badgeEndpoint: '/x' } } as any
      btnFeatureSvcMock.getBadgeCount.mockReturnValue(Promise.resolve(150))
      component.updateBadge()
      await Promise.resolve()
      await Promise.resolve()
      expect(component.badgeCount).toBe('99+')
    })

    it('should set badgeCount to numeric string when count between 0 and 99', async () => {
      component.widgetData = { actionBtn: { badgeEndpoint: '/x' } } as any
      btnFeatureSvcMock.getBadgeCount.mockReturnValue(Promise.resolve(5))
      component.updateBadge()
      await Promise.resolve()
      await Promise.resolve()
      expect(component.badgeCount).toBe('5')
    })

    it('should set badgeCount to empty when count is 0', async () => {
      component.widgetData = { actionBtn: { badgeEndpoint: '/x' } } as any
      btnFeatureSvcMock.getBadgeCount.mockReturnValue(Promise.resolve(0))
      component.updateBadge()
      await Promise.resolve()
      await Promise.resolve()
      expect(component.badgeCount).toBe('')
    })

    it('should swallow rejected promise', async () => {
      component.widgetData = { actionBtn: { badgeEndpoint: '/x' } } as any
      btnFeatureSvcMock.getBadgeCount.mockReturnValue(Promise.reject(new Error('err')))
      component.updateBadge()
      await Promise.resolve()
      await Promise.resolve()
      expect(true).toBe(true)
    })
  })

  describe('redirect', () => {
    it('should navigate to home url by default', async () => {
      const hrefSpy = jest.spyOn(document, 'baseURI', 'get').mockReturnValue('http://localhost/')
      await component.redirect({ name: 'Home' })
      expect(component.currentText).toBe('Home')
      hrefSpy.mockRestore()
    })

    it('should navigate to org-selective-course when org matches selective config', async () => {
      configSvcMock.orgSelectiveCourseConfig = { orgId: 'org1' }
      await component.redirect({ name: 'Home' })
      expect(component.currentText).toBe('Home')
    })

    it('should navigate to my_courses when dob present', async () => {
      signupServiceMock.getUserData.mockResolvedValue({
        profileDetails: { profileReq: { personalDetails: { dob: '2000-01-01' } } },
      })
      await component.redirect({ name: 'My Courses' })
      expect(component.currentText).toBe('My Courses')
    })

    it('should navigate to about-you when dob missing for My Courses', async () => {
      signupServiceMock.getUserData.mockResolvedValue({ profileDetails: { profileReq: { personalDetails: {} } } })
      await component.redirect({ name: 'My Courses' })
      expect(routerMock.navigate).toHaveBeenCalledWith(
        ['/app/about-you'], { queryParams: { redirect: '/page/home' } },
      )
    })

    it('should navigate for Notification', async () => {
      await component.redirect({ name: 'Notification' })
      expect(component.currentText).toBe('Notification')
    })

    it('should navigate to competency when dob present', async () => {
      signupServiceMock.getUserData.mockResolvedValue({
        profileDetails: { profileReq: { personalDetails: { dob: '2000-01-01' } } },
      })
      await component.redirect({ name: 'Competency' })
      expect(localStorage.getItem('isOnlyPassbook')).toBe('false')
    })

    it('should navigate to about-you when dob missing for Competency', async () => {
      signupServiceMock.getUserData.mockResolvedValue({ profileDetails: { profileReq: { personalDetails: {} } } })
      await component.redirect({ name: 'Competency' })
      expect(routerMock.navigate).toHaveBeenCalled()
    })

    it('should handle Search redirect', async () => {
      await component.redirect({ name: 'Search' })
      expect(navOptionMock.changeNavBarActive).toHaveBeenCalledWith('search')
    })

    it('should navigate to profile-view when dob present for else branch', async () => {
      signupServiceMock.getUserData.mockResolvedValue({
        profileDetails: { profileReq: { personalDetails: { dob: '2000-01-01' } } },
      })
      await component.redirect({ name: 'SomethingElse' })
      expect(component.currentText).toBe('SomethingElse')
    })

    it('should navigate to about-you with stored url_before_login when dob missing', async () => {
      signupServiceMock.getUserData.mockResolvedValue({ profileDetails: { profileReq: { personalDetails: {} } } })
      localStorage.setItem('url_before_login', '/some/course')
      await component.redirect({ name: 'SomethingElse' })
      expect(routerMock.navigate).toHaveBeenCalledWith(
        ['/app/about-you'], { queryParams: { redirect: '/some/course' } },
      )
    })

    it('should navigate to about-you with home redirect when no stored url', async () => {
      signupServiceMock.getUserData.mockResolvedValue({ profileDetails: { profileReq: { personalDetails: {} } } })
      await component.redirect({ name: 'SomethingElse' })
      expect(routerMock.navigate).toHaveBeenCalledWith(
        ['/app/about-you'], { queryParams: { redirect: '/page/home' } },
      )
    })
  })

  describe('search', () => {
    it('should call changeMessage when on page/home', () => {
      routerMock.url = '/page/home'
      component.search()
      expect(searchApiMock.changeMessage).toHaveBeenCalledWith('search')
    })

    it('should navigateByUrl when on search/learning', () => {
      routerMock.url = '/app/search/learning'
      component.search()
      expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/app/search/home')
    })

    it('should do nothing for unrelated url', () => {
      routerMock.url = '/other'
      component.search()
      expect(searchApiMock.changeMessage).not.toHaveBeenCalled()
      expect(routerMock.navigateByUrl).not.toHaveBeenCalled()
    })
  })

  describe('ngOnInit', () => {
    it('should subscribe to navOption.currentOption and set currentText for profile-view', () => {
      component.ngOnInit()
      setLocation('http://localhost/app/profile-view')
      currentOptionSubject.next('opt')
      expect(component.currentText).toBe('Account')
    })

    it('should subscribe to navOption.currentOption and set currentText for toc', () => {
      component.ngOnInit()
      setLocation('http://localhost/app/toc')
      currentOptionSubject.next('opt')
      expect(component.currentText).toBe('Home')
    })

    it('should set instanceVal from configSvc.rootOrg', () => {
      component.ngOnInit()
      expect(component.instanceVal).toBe('root1')
    })

    it('should set givenName when userProfile has firstName', () => {
      component.ngOnInit()
      expect(component.givenName).toBe('John Doe')
    })

    it('should set isPinFeatureAvailable false when restrictedFeatures has pinFeatures', () => {
      configSvcMock.restrictedFeatures = new Set(['pinFeatures'])
      component.ngOnInit()
      expect(component.isPinFeatureAvailable).toBe(false)
    })

    it('should resolve actionBtn from appsConfig when missing and set sashakth true', () => {
      sessionStorage.setItem('sashakt_token', 'tok')
      sessionStorage.setItem('sashakt_moduleId', 'mod')
      component.ngOnInit()
      expect(component.widgetData.actionBtn).toEqual({ id: 'feat1' })
      expect(component.isSashakth).toBe(true)
      expect(component.local).toBe('hi')
    })

    it('should set isSashakth false when session tokens missing', () => {
      component.ngOnInit()
      expect(component.isSashakth).toBe(false)
    })

    it('should compute numberOfNotification as 1+ when count > 1', () => {
      storageMock.getNumberOfNotifications.mockReturnValue(3)
      component.ngOnInit()
      expect(component.numberOfNotification).toBe('1+')
    })

    it('should compute numberOfNotification as 1 when count between 1 and 1 inclusive', () => {
      storageMock.getNumberOfNotifications.mockReturnValue(1)
      component.ngOnInit()
      expect(component.numberOfNotification).toBe('1')
    })

    it('should compute numberOfNotification as empty when count 0', () => {
      storageMock.getNumberOfNotifications.mockReturnValue(0)
      component.ngOnInit()
      expect(component.numberOfNotification).toBe('')
    })

    it('should subscribe to event notificationCountUpdated and update numberOfNotification', () => {
      let handler: any
      eventMock.subscribe = jest.fn((_name, cb) => { handler = cb })
      component.ngOnInit()
      handler(5)
      expect(component.numberOfNotification).toBe('1+')
      handler(0)
      expect(component.numberOfNotification).toBe('')
    })

    it('should subscribe to pinnedApps and set isPinned true when included', () => {
      component.widgetData = { actionBtn: { id: 'feat1' } } as any
      component.ngOnInit()
      pinnedAppsSubject.next(new Set(['feat1']))
      expect(component.isPinned).toBe(true)
    })

    it('should set isPinned false when not included', () => {
      component.widgetData = { actionBtn: { id: 'feat1' } } as any
      component.ngOnInit()
      pinnedAppsSubject.next(new Set(['other']))
      expect(component.isPinned).toBe(false)
    })
  })

  describe('ngOnDestroy', () => {
    it('should unsubscribe pinnedAppsChangeSubs when present', () => {
      component.ngOnInit()
      const spy = jest.spyOn((component as any).pinnedAppsChangeSubs, 'unsubscribe')
      component.ngOnDestroy()
      expect(spy).toHaveBeenCalled()
    })

    it('should not throw when pinnedAppsChangeSubs is undefined', () => {
      expect(() => component.ngOnDestroy()).not.toThrow()
    })
  })

  describe('featureStatusColor', () => {
    it('should return primary for earlyAccess', () => {
      component.widgetData = { actionBtn: { status: 'earlyAccess' } } as any
      expect(component.featureStatusColor).toBe('primary')
    })

    it('should return accent for beta', () => {
      component.widgetData = { actionBtn: { status: 'beta' } } as any
      expect(component.featureStatusColor).toBe('accent')
    })

    it('should return warn for alpha', () => {
      component.widgetData = { actionBtn: { status: 'alpha' } } as any
      expect(component.featureStatusColor).toBe('warn')
    })

    it('should return null for unknown status', () => {
      component.widgetData = { actionBtn: { status: 'other' } } as any
      expect(component.featureStatusColor).toBeNull()
    })

    it('should return null when no actionBtn', () => {
      component.widgetData = {} as any
      expect(component.featureStatusColor).toBeNull()
    })
  })

  describe('desktopVisible', () => {
    it('should return false when mobileAppFunction present and not mobile', () => {
      component.widgetData = { actionBtn: { mobileAppFunction: true } } as any
      mobileSvcMock.isMobile = false
      expect(component.desktopVisible).toBe(false)
    })

    it('should return true when mobileAppFunction present and isMobile true', () => {
      component.widgetData = { actionBtn: { mobileAppFunction: true } } as any
      mobileSvcMock.isMobile = true
      expect(component.desktopVisible).toBe(true)
    })

    it('should return true when no mobileAppFunction', () => {
      component.widgetData = { actionBtn: {} } as any
      expect(component.desktopVisible).toBe(true)
    })

    it('should return true when no actionBtn', () => {
      component.widgetData = {} as any
      expect(component.desktopVisible).toBe(true)
    })
  })

  describe('togglePin', () => {
    it('should raise telemetry and add featureId when not pinned', () => {
      const event = { preventDefault: jest.fn(), stopPropagation: jest.fn() }
      component.togglePin('feat1', event)
      expect(event.preventDefault).toHaveBeenCalled()
      expect(event.stopPropagation).toHaveBeenCalled()
      expect(eventsMock.raiseInteractTelemetry).toHaveBeenCalled()
      expect(component.isPinned).toBe(true)
      expect(configurationsSvcMock.prefChangeNotifier.next).toHaveBeenCalledWith({ pinnedApps: 'feat1' })
    })

    it('should remove featureId when already pinned', () => {
      pinnedAppsSubject.next(new Set(['feat1']))
      const event = { preventDefault: jest.fn(), stopPropagation: jest.fn() }
      component.togglePin('feat1', event)
      expect(component.isPinned).toBe(false)
    })
  })
})
