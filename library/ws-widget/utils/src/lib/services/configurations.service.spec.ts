import { ConfigurationsService } from './configurations.service'

describe('ConfigurationsService', () => {
  let service: ConfigurationsService

  beforeEach(() => {
    service = new ConfigurationsService()
  })

  it('should create', () => {
    expect(service).toBeTruthy()
  })

  it('should start with the app-setup flag on and no landing url', () => {
    expect(service.appSetup).toBe(true)
    expect(service.userUrl).toBe('')
  })

  it('should expose the default asset paths', () => {
    expect(service.baseUrl).toBe('assets/configurations')
    expect(service.sitePath).toBe('assets/configurations')
    expect(service.localSitePath).toBe('fusion-assets/files')
  })

  it('should derive a colon-free host path', () => {
    expect(service.hostPath).not.toContain(':')
    expect(typeof service.hostPath).toBe('string')
  })

  it('should start with no resolved user or org state', () => {
    expect(service.userRoles).toBeNull()
    expect(service.userGroups).toBeNull()
    expect(service.restrictedFeatures).toBeNull()
    expect(service.restrictedWidgets).toBeNull()
    expect(service.instanceConfig).toBeNull()
    expect(service.appsConfig).toBeNull()
    expect(service.rootOrg).toBeNull()
    expect(service.org).toBeNull()
    expect(service.activeOrg).toBe('')
    expect(service.userPreference).toBeNull()
    expect(service.userProfile).toBeNull()
    expect(service.userProfileV2).toBeNull()
    expect(service.nodebbUserProfile).toBeNull()
  })

  it('should start unauthenticated, active and not a new user', () => {
    expect(service.isAuthenticated).toBe(false)
    expect(service.isNewUser).toBe(false)
    expect(service.isActive).toBe(true)
    expect(service.isProduction).toBe(false)
    expect(service.hasAcceptedTnc).toBe(false)
    expect(service.profileDetailsStatus).toBe(false)
  })

  it('should start with empty org-selective and home-redirect config', () => {
    expect(service.orgSelectiveCourseConfig).toEqual({})
    expect(service.orgHomeRedirectMap).toBeInstanceOf(Map)
    expect(service.orgHomeRedirectMap.size).toBe(0)
  })

  it('should seed pinnedApps with an empty set', done => {
    service.pinnedApps.subscribe(apps => {
      expect(apps).toBeInstanceOf(Set)
      expect(apps.size).toBe(0)
      done()
    })
  })

  it('should replay the last preference change to late subscribers', () => {
    const received: any[] = []
    service.prefChangeNotifier.next({ isDarkMode: true })
    service.prefChangeNotifier.subscribe(p => received.push(p))
    expect(received).toEqual([{ isDarkMode: true }])
  })

  it('should replay the last auth change to late subscribers', () => {
    const received: boolean[] = []
    service.authChangeNotifier.next(true)
    service.authChangeNotifier.subscribe(v => received.push(v))
    expect(received).toEqual([true])
  })

  it('should relay tour-guide notifications to active subscribers', () => {
    const received: boolean[] = []
    service.tourGuideNotifier.subscribe(v => received.push(v))
    service.tourGuideNotifier.next(true)
    expect(received).toEqual([true])
  })

  it('should start with the default presentation preferences', () => {
    expect(service.activeThemeObject).toBeNull()
    expect(service.activeFontObject).toBeNull()
    expect(service.isDarkMode).toBe(false)
    expect(service.isIntranetAllowed).toBe(false)
    expect(service.isRTL).toBe(false)
    expect(service.activeLocale).toBeNull()
    expect(service.activeLocaleGroup).toBe('')
    expect(service.completedActivity).toBeNull()
    expect(service.completedTour).toBe(false)
  })

  it('should expose the default profile settings', () => {
    expect(service.profileSettings).toEqual(['profilePicture', 'learningTime', 'learningPoints'])
  })

  it('should default both nav bars to the primary colour', () => {
    expect(service.primaryNavBar).toEqual({ color: 'primary' })
    expect(service.pageNavBar).toEqual({ color: 'primary' })
    expect(service.primaryNavBarConfig).toBeNull()
    expect(service.bannerStats).toBeNull()
  })
})
