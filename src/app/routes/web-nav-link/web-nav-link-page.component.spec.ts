jest.mock('@ws-widget/utils', () => ({
  ConfigurationsService: class {
    userProfile = { userId: 'user-1', rootOrgId: 'org-1' }
    unMappedUser = null
    orgSelectiveCourseConfig = null
  },
  LoggerService: class { log = jest.fn(); error = jest.fn() },
  LogoutComponent: class {},
}))

jest.mock('../signup/signup.service', () => ({
  SignupService: class {
    getUserData = jest.fn().mockResolvedValue(null)
  },
}))

jest.mock('../notification/notification.component', () => ({
  NotificationsComponent: class {},
}))

jest.mock('../../component/app-nav-bar/app-nav-bar.service', () => ({
  appNavBarService: class {
    currentOption = { subscribe: jest.fn((cb: any) => cb('')) }
  },
}))

jest.mock('../../services/local-storage.service', () => ({
  LocalStorageService: class {
    getNumberOfNotifications = jest.fn().mockReturnValue(0)
  },
}))

jest.mock('../notification/events', () => ({
  Events: class {
    subscribe = jest.fn()
    publish = jest.fn()
  },
}))

jest.mock('../../services/playlist.service', () => ({
  PlaylistService: class {
    getSelectedTab = jest.fn().mockReturnValue('')
    setSelectedTab = jest.fn()
  },
}))

jest.mock('../../services/theme.service', () => ({
  ThemeService: class {
    isDarkMode = jest.fn().mockReturnValue(false)
    isDark = jest.fn().mockReturnValue(false)
    setTheme = jest.fn()
  },
}))

import { Subject } from 'rxjs'
import { WebNavLinkPageComponent } from './web-nav-link-page.component'

describe('WebNavLinkPageComponent', () => {
  let component: WebNavLinkPageComponent
  let mockDialog: any
  let mockConfigSvc: any
  let mockRouter: any
  let mockSignupService: any
  let mockLocation: any
  let mockNavOption: any
  let mockStorage: any
  let mockEvents: any
  let mockPlaylistSvc: any
  let mockCd: any
  let mockLogger: any
  let mockThemeService: any
  let routerEvents$: Subject<any>

  beforeEach(() => {
    routerEvents$ = new Subject()
    mockDialog = {
      open: jest.fn().mockReturnValue({ afterClosed: jest.fn().mockReturnValue({ subscribe: jest.fn() }) }),
    }
    mockConfigSvc = {
      userProfile: { userId: 'user-1', rootOrgId: 'org-1' },
      unMappedUser: null,
      orgSelectiveCourseConfig: null,
    }
    mockRouter = { events: routerEvents$, navigate: jest.fn() }
    mockSignupService = { getUserData: jest.fn().mockResolvedValue(null) }
    mockLocation = { path: jest.fn().mockReturnValue('/page/home') }
    mockNavOption = { currentOption: { subscribe: jest.fn((cb: any) => cb('')) } }
    mockStorage = { getNumberOfNotifications: jest.fn().mockReturnValue(0) }
    mockEvents = { subscribe: jest.fn(), publish: jest.fn() }
    mockPlaylistSvc = { getSelectedTab: jest.fn().mockReturnValue(''), setSelectedTab: jest.fn() }
    mockCd = { detectChanges: jest.fn() }
    mockLogger = { log: jest.fn(), error: jest.fn() }
    mockThemeService = {
      isDarkMode: jest.fn().mockReturnValue(false),
      isDark: jest.fn().mockReturnValue(false),
      setTheme: jest.fn(),
    }

    component = new WebNavLinkPageComponent(
      mockDialog,
      mockConfigSvc,
      mockRouter,
      mockSignupService,
      mockLocation,
      mockNavOption,
      mockStorage,
      mockEvents,
      mockPlaylistSvc,
      mockCd,
      mockLogger,
      mockThemeService,
    )
    component.menuItems = [
      { id: 'home', title: 'Home', show: false, active: false, redirect: '/page/home' },
      { id: 'account', title: 'Account', show: false, active: false, redirect: '/app/profile-view' },
      { id: 'search', title: 'Search', show: false, active: false, redirect: '/app/search' },
    ]
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should default numberOfNotification to empty string', () => {
    expect(component.numberOfNotification).toBe('')
  })

  it('should default isDark to false', () => {
    expect(component.isDark).toBe(false)
  })

  describe('updatedMenuItems', () => {
    it('should set active=true on the item matching the label', () => {
      component.updatedMenuItems('Home')
      const homeItem = component.menuItems.find(i => i.title === 'Home')
      expect(homeItem?.active).toBe(true)
      expect(homeItem?.show).toBe(true)
    })

    it('should set active=false on non-matching items', () => {
      component.updatedMenuItems('Home')
      const accountItem = component.menuItems.find(i => i.title === 'Account')
      expect(accountItem?.active).toBe(false)
    })

    it('should default to first item when label has no match', () => {
      component.updatedMenuItems('UnknownTab')
      expect(component.menuItems[0].active).toBe(true)
    })
  })

  describe('handleKeyDown', () => {
    it('should call redirect for Enter key', () => {
      jest.spyOn(component, 'redirect')
      const event = { key: 'Enter', preventDefault: jest.fn() } as any
      component.handleKeyDown(event)
      expect(component.redirect).toHaveBeenCalledWith({ title: 'Notification' })
      expect(event.preventDefault).toHaveBeenCalled()
    })

    it('should call redirect for Space key', () => {
      jest.spyOn(component, 'redirect')
      const event = { key: ' ', preventDefault: jest.fn() } as any
      component.handleKeyDown(event)
      expect(component.redirect).toHaveBeenCalled()
    })

    it('should not call redirect for other keys', () => {
      jest.spyOn(component, 'redirect')
      const event = { key: 'Tab', preventDefault: jest.fn() } as any
      component.handleKeyDown(event)
      expect(component.redirect).not.toHaveBeenCalled()
    })
  })

  describe('logout', () => {
    it('should open dialog on logout()', () => {
      component.logout()
      expect(mockDialog.open).toHaveBeenCalled()
    })
  })

  describe('toggleTheme', () => {
    it('should call setTheme with toggled value', () => {
      mockThemeService.isDark.mockReturnValue(false)
      component.toggleTheme()
      expect(mockThemeService.setTheme).toHaveBeenCalledWith(true)
    })
  })

  describe('ngOnInit', () => {
    it('should set isDark from themeService', async () => {
      mockThemeService.isDark.mockReturnValue(true)
      await component.ngOnInit()
      expect(component.isDark).toBe(true)
    })

    it('should subscribe to notificationCountUpdated event', async () => {
      await component.ngOnInit()
      expect(mockEvents.subscribe).toHaveBeenCalledWith('notificationCountUpdated', expect.any(Function))
    })

    it('should update numberOfNotification when event fires with count > 1', async () => {
      mockEvents.subscribe = jest.fn((event: string, cb: Function) => cb(3))
      await component.ngOnInit()
      expect(component.numberOfNotification).toBe('1+')
    })

    it('should call getUserData and set userData', async () => {
      mockSignupService.getUserData.mockResolvedValue({ profileDetails: { profileReq: { personalDetails: { dob: '1990-01-01' } } } })
      await component.ngOnInit()
      expect(component.userData).toEqual({ profileDetails: { profileReq: { personalDetails: { dob: '1990-01-01' } } } })
    })
  })

  describe('ngOnChanges', () => {
    it('should call syncMenuWithUrl when menuItems changes and has length', () => {
      const spy = jest.spyOn(component as any, 'syncMenuWithUrl')
      component.ngOnChanges({ menuItems: { currentValue: component.menuItems, previousValue: [], firstChange: true, isFirstChange: () => true } })
      expect(spy).toHaveBeenCalled()
    })

    it('should not call syncMenuWithUrl when menuItems changes to empty array', () => {
      const spy = jest.spyOn(component as any, 'syncMenuWithUrl')
      component.menuItems = []
      component.ngOnChanges({ menuItems: { currentValue: [], previousValue: component.menuItems, firstChange: false, isFirstChange: () => false } })
      expect(spy).not.toHaveBeenCalled()
    })

    it('should not react when other input properties change', () => {
      const spy = jest.spyOn(component as any, 'syncMenuWithUrl')
      component.ngOnChanges({ orgData: { currentValue: {}, previousValue: null, firstChange: true, isFirstChange: () => true } })
      expect(spy).not.toHaveBeenCalled()
    })
  })

  describe('redirect', () => {
    it('should navigate to /app/search/home for search tab', async () => {
      const item = { id: 'search', title: 'Search', redirect: '/app/search', active: false, show: false }
      await component.redirect(item)
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/search/home'])
    })

    it('should navigate to route for mycourses when dob is set', async () => {
      component.userData = { profileDetails: { profileReq: { personalDetails: { dob: '1990-01-01' } } } }
      const item = { id: 'account', title: 'My Courses', redirect: '/app/user/my_courses', active: false, show: false }
      await component.redirect(item)
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/user/my_courses'])
    })

    it('should navigate to about-you for mycourses when dob is not set', async () => {
      component.userData = null
      const item = { id: 'account', title: 'My Courses', redirect: '/app/user/my_courses', active: false, show: false }
      await component.redirect(item)
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/about-you'], expect.any(Object))
    })

    it('should call openNotificationDialog for notification tab', async () => {
      const spy = jest.spyOn(component, 'openNotificationDialog').mockImplementation(() => {})
      const item = { id: 'notification', title: 'Notification', redirect: '', active: false, show: false }
      await component.redirect(item)
      expect(spy).toHaveBeenCalled()
    })

    it('should navigate to route for home without org config', async () => {
      mockConfigSvc.orgSelectiveCourseConfig = null
      const item = { id: 'home', title: 'Home', redirect: '/page/home', active: false, show: false }
      await component.redirect(item)
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/page/home'])
    })

    it('should set menu active state on redirect', async () => {
      const item = component.menuItems[2] // search
      await component.redirect(item)
      expect(item.active).toBe(true)
    })
  })

  describe('openNotificationDialog', () => {
    it('should open dialog when notificationDialogRef is null', () => {
      component.notificationDialogRef = null
      component.openNotificationDialog()
      expect(mockDialog.open).toHaveBeenCalled()
    })

    it('should not open dialog if notificationDialogRef already exists', () => {
      component.notificationDialogRef = { afterClosed: jest.fn().mockReturnValue({ subscribe: jest.fn() }) } as any
      component.openNotificationDialog()
      expect(mockDialog.open).not.toHaveBeenCalled()
    })

    it('should set notificationDialogRef to null on afterClosed', () => {
      const afterClosedCb = jest.fn()
      mockDialog.open = jest.fn().mockReturnValue({
        afterClosed: jest.fn().mockReturnValue({ subscribe: jest.fn((cb: any) => cb()) }),
      })
      component.openNotificationDialog()
      expect(component.notificationDialogRef).toBeNull()
    })
  })

  describe('syncMenuWithUrl', () => {
    it('should set Account active for profile-view path', () => {
      mockLocation.path.mockReturnValue('/app/profile-view')
      ;(component as any).syncMenuWithUrl()
      const accountItem = component.menuItems.find(i => i.title === 'Account')
      expect(accountItem?.active).toBe(true)
    })

    it('should set Home active for page/home path', () => {
      mockLocation.path.mockReturnValue('/page/home')
      ;(component as any).syncMenuWithUrl()
      const homeItem = component.menuItems.find(i => i.title === 'Home')
      expect(homeItem?.active).toBe(true)
    })

    it('should set Search active for search path', () => {
      component.menuItems.push({ id: 'search', title: 'Search', show: false, active: false, redirect: '/app/search' })
      mockLocation.path.mockReturnValue('/app/search/home')
      ;(component as any).syncMenuWithUrl()
      const searchItem = component.menuItems.find(i => i.title === 'Search')
      expect(searchItem?.active).toBe(true)
    })
  })
})
