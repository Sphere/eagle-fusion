jest.mock('@angular/core', () => {
  const actual = jest.requireActual('@angular/core')
  return { ...actual, effect: jest.fn() }
})
jest.mock('../../services/playlist.service', () => ({
  PlaylistService: class {
    orgDetails = jest.fn().mockReturnValue({ appLogo: 'org-logo-url' })
    footerConfig = jest.fn().mockReturnValue({})
  },
}))

import { AppFooterComponent } from './app-footer.component'
import { PlaylistService } from '../../services/playlist.service'
import { of } from 'rxjs'

describe('AppFooterComponent', () => {
  let component: AppFooterComponent
  let mockConfigSvc: any
  let mockValueSvc: any
  let mockRouter: any
  let mockPlaylistSvc: any
  let mockLogger: any
  let mockThemeSvc: any

  beforeEach(() => {
    mockConfigSvc = {
      restrictedFeatures: new Set(),
      instanceConfig: {
        logos: {
          app: 'app-logo-url',
        },
      },
      userProfile: { userId: 'user123' },
      unMappedUser: {
        profileDetails: {
          preferences: {
            language: 'en',
          },
        },
      },
    }
    mockValueSvc = {
      isXSmall$: of(false),
      isLtMedium$: of(false),
    }
    mockRouter = {
      url: '/page/home',
      navigateByUrl: jest.fn(),
    }
    mockPlaylistSvc = {
      orgDetails: jest.fn().mockReturnValue({ appLogo: null }),
      footerConfig: jest.fn().mockReturnValue({}),
    }
    mockLogger = { log: jest.fn(), warn: jest.fn(), error: jest.fn() }
    mockThemeSvc = { isDark: jest.fn().mockReturnValue(false) }

    component = new AppFooterComponent(
      mockConfigSvc,
      mockValueSvc,
      mockRouter,
      mockPlaylistSvc as PlaylistService,
      mockLogger,
      mockThemeSvc
    )
  })

  it('should initialize component with default values', () => {
    expect(component.isXSmall).toBe(false)
    expect(component.termsOfUser).toBe(true)
    expect(component.isMedium).toBe(false)
    expect(component.currentYear).toBe(new Date().getFullYear())
    expect(component.isLoggedIn).toBe(true)
  })

  it('should set termsOfUser to false if restricted', () => {
    mockConfigSvc.restrictedFeatures.add('termsOfUser')
    component = new AppFooterComponent(
      mockConfigSvc,
      mockValueSvc,
      mockRouter,
      mockPlaylistSvc as PlaylistService,
      mockLogger,
      mockThemeSvc
    )
    expect(component.termsOfUser).toBe(false)
  })

  it('should update isXSmall and isMedium based on valueSvc observables', () => {
    mockValueSvc.isXSmall$ = of(true)
    mockValueSvc.isLtMedium$ = of(true)
    component = new AppFooterComponent(
      mockConfigSvc,
      mockValueSvc,
      mockRouter,
      mockPlaylistSvc as PlaylistService,
      mockLogger,
      mockThemeSvc
    )
    component.ngOnInit()
    expect(component.isXSmall).toBe(true)
    expect(component.isMedium).toBe(true)
  })

  it('should set appIcon from orgDetails via playlistSvc', () => {
    mockPlaylistSvc.orgDetails.mockReturnValue({ appLogo: 'safe-url' })
    component = new AppFooterComponent(
      mockConfigSvc,
      mockValueSvc,
      mockRouter,
      mockPlaylistSvc as PlaylistService,
      mockLogger,
      mockThemeSvc
    )
    expect(mockPlaylistSvc.orgDetails).toHaveBeenCalled()
    expect(component.appIcon).toBe('safe-url')
  })

  it('should set isLoggedIn based on userProfile', () => {
    expect(component.isLoggedIn).toBe(true)
  })

  it('should set appIcon to null when orgDetails returns no appLogo', () => {
    mockPlaylistSvc.orgDetails.mockReturnValue({})
    component = new AppFooterComponent(
      mockConfigSvc,
      mockValueSvc,
      mockRouter,
      mockPlaylistSvc as PlaylistService,
      mockLogger,
      mockThemeSvc
    )
    expect(component.appIcon).toBeUndefined()
  })

  it('should redirect to the correct route based on text', async () => {
    await component.redirect('home')
    expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/page/home')

    await component.redirect('mycourses')
    expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/app/user/my_courses')

    await component.redirect('competency')
    expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/app/user/competency')
    expect(localStorage.getItem('isOnlyPassbook')).toBe('false')

    await component.redirect('unknown')
    expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/app/profile-view')
  })

  it('should create account and navigate to create account page', () => {
    component.createAcct()
    expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/app/create-account')
  })
})
