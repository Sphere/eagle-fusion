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
})
