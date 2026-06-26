jest.mock('src/app/services/language.service', () => ({ LanguageService: class { } }))
jest.mock('src/app/services/user-data-cache.service', () => ({ UserDataCacheService: class { } }))
jest.mock('../../services/playlist.service', () => ({
  PlaylistService: class {
    getPlaylistConfig = jest.fn().mockResolvedValue([])
    orgDetails = jest.fn().mockReturnValue({})
    footerConfig = jest.fn().mockReturnValue({})
  },
}))

import { TestBed, ComponentFixture } from '@angular/core/testing'
import { NO_ERRORS_SCHEMA } from '@angular/core'
import { RouterTestingModule } from '@angular/router/testing'
import { Router } from '@angular/router'
import { MatDialog } from '@angular/material/dialog'
import { EventEmitter } from '@angular/core'
import { of } from 'rxjs'
import { WebDashboardComponent } from './web-dashboard.component'
import { ScrollService } from '../../services/scroll.service'
import { ConfigurationsService } from '../../../../library/ws-widget/utils/src/lib/services/configurations.service'
import { UserProfileService } from 'project/ws/app/src/lib/routes/user-profile/services/user-profile.service'
import { LanguageService } from 'src/app/services/language.service'
import { PlaylistService } from '../../services/playlist.service'
import { LoggerService } from '../../../../library/ws-widget/utils/src/public-api'
import { ThemeService } from '../../services/theme.service'

describe('WebDashboardComponent', () => {
  let component: WebDashboardComponent
  let fixture: ComponentFixture<WebDashboardComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WebDashboardComponent],
      imports: [RouterTestingModule],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        {
          provide: MatDialog,
          useValue: { open: jest.fn() },
        },
        {
          provide: ScrollService,
          useValue: { scrollToDivEvent: new EventEmitter<string>() },
        },
        {
          provide: ConfigurationsService,
          useValue: { unMappedUser: { id: 'user123' }, userProfile: null },
        },
        {
          provide: UserProfileService,
          useValue: { getUserdetailsFromRegistry: jest.fn().mockReturnValue(of({})) },
        },
        {
          provide: LanguageService,
          useValue: { getCurrentLanguage: jest.fn().mockReturnValue('en') },
        },
        {
          provide: PlaylistService,
          useValue: {
            getPlaylistConfig: jest.fn().mockResolvedValue([]),
            orgDetails: jest.fn().mockReturnValue({}),
            footerConfig: jest.fn().mockReturnValue({}),
            setEarnedBadges: jest.fn(),
          },
        },
        {
          provide: LoggerService,
          useValue: { log: jest.fn(), warn: jest.fn(), error: jest.fn() },
        },
        {
          provide: ThemeService,
          useValue: { isDark: jest.fn().mockReturnValue(false) },
        },
      ],
    })
    TestBed.overrideComponent(WebDashboardComponent, { set: { template: '' } })
    fixture = TestBed.createComponent(WebDashboardComponent)
    component = fixture.componentInstance
    component.dataCarousel = [{}, {}]
  })

  afterEach(() => {
    TestBed.resetTestingModule()
  })

  it('should create the component', () => {
    expect(component).toBeTruthy()
  })

  it('should start carousel', () => {
    const setIntervalSpy = jest.spyOn(window, 'setInterval').mockReturnValue(99 as any)
    component.startCarousel()
    expect(setIntervalSpy).toHaveBeenCalled()
    setIntervalSpy.mockRestore()
  })

  it('should clear interval', () => {
    const clearIntervalSpy = jest.spyOn(window, 'clearInterval').mockImplementation(() => { })
    component.intervalId = 42 as any
    component.clearInterval()
    expect(clearIntervalSpy).toHaveBeenCalledWith(42)
    clearIntervalSpy.mockRestore()
  })

  it('should navigate to next slide', () => {
    component.currentSlideIndex = 0
    component.nextSlide()
    expect(component.currentSlideIndex).toBe(1)
    component.currentSlideIndex = 1
    component.nextSlide()
    expect(component.currentSlideIndex).toBe(0)
  })

  it('should navigate to previous slide', () => {
    component.currentSlideIndex = 1
    component.prevSlide()
    expect(component.currentSlideIndex).toBe(0)
    component.currentSlideIndex = 0
    component.prevSlide()
    expect(component.currentSlideIndex).toBe(1)
  })

  it('should go to specific slide', () => {
    const setIntervalSpy = jest.spyOn(window, 'setInterval').mockReturnValue(99 as any)
    component.clearInterval = jest.fn()
    component.goToSlide(1)
    expect(component.clearInterval).toHaveBeenCalled()
    expect(component.currentSlideIndex).toBe(1)
    setIntervalSpy.mockRestore()
  })

  it('shouldShowBadges should be false when showCompletedCourses is false', () => {
    component.uiConfig = { badges: { showCompletedCourses: false } }
    component.noOfBadges = 5
    expect(component.shouldShowBadges).toBe(false)
  })

  it('shouldShowBadges should be false when noOfBadges is 0', () => {
    component.uiConfig = { badges: { showCompletedCourses: true } }
    component.noOfBadges = 0
    expect(component.shouldShowBadges).toBe(false)
  })

  it('shouldShowBadges should be true when showCompletedCourses is true and noOfBadges > 0', () => {
    component.uiConfig = { badges: { showCompletedCourses: true } }
    component.noOfBadges = 3
    expect(component.shouldShowBadges).toBe(true)
  })

  it('onBannerImgLoad should set imgsLoaded[index] to true', () => {
    component.imgsLoaded = [false, false, false]
    component.onBannerImgLoad(1)
    expect(component.imgsLoaded[1]).toBe(true)
    expect(component.imgsLoaded[0]).toBe(false)
  })

  it('scrollToHowSphereWorks should emit value on scrollService', () => {
    const emitSpy = jest.spyOn(component.scrollService.scrollToDivEvent, 'emit')
    component.scrollToHowSphereWorks('howSphereWorks')
    expect(emitSpy).toHaveBeenCalledWith('howSphereWorks')
  })

  it('nextSlide should return early when dataCarousel is empty', () => {
    component.dataCarousel = []
    component.currentSlideIndex = 0
    component.nextSlide()
    expect(component.currentSlideIndex).toBe(0)
  })

  it('ngOnDestroy should call clearInterval', () => {
    const spy = jest.spyOn(component, 'clearInterval')
    component.ngOnDestroy()
    expect(spy).toHaveBeenCalled()
  })

  it('ngOnInit should start carousel and set preferedLanguage', async () => {
    jest.useFakeTimers()
    component.configData = null
    await component.ngOnInit()
    expect(component.preferedLanguage.id).toBe('en')
    jest.useRealTimers()
  })

  it('ngOnInit should read lang from unMappedUser preference when set', async () => {
    jest.useFakeTimers()
    const configSvc = TestBed.inject(ConfigurationsService) as any
    configSvc.unMappedUser = { id: 'user123', profileDetails: { preferences: { language: 'hi' } } }
    configSvc.userProfile = null
    component.configData = null
    await component.ngOnInit()
    expect(component.lang).toBe('hi')
    jest.useRealTimers()
  })

  it('startCarousel should invoke nextSlide after 3 seconds', () => {
    jest.useFakeTimers()
    const nextSlideSpy = jest.spyOn(component, 'nextSlide')
    component.startCarousel()
    jest.advanceTimersByTime(3100)
    expect(nextSlideSpy).toHaveBeenCalled()
    jest.useRealTimers()
  })

  it('ngOnInit should set bannerFirstImage when isEkshamata and hostedInfo exists', async () => {
    const configSvc = TestBed.inject(ConfigurationsService) as any
    configSvc.hostedInfo = { org: 'ekshamata' }
    component.isEkshamata = true
    component.configData = null
    await component.ngOnInit()
    expect(component.bannerFirstImage).toBe('/fusion-assets/images/ekshamata-logo.svg')
  })

  it('ngOnInit calculateBadges should count completed courses matching playlist', async () => {
    const plylsSvc = TestBed.inject(PlaylistService) as any
    plylsSvc.getPlaylistConfig = jest.fn().mockResolvedValue([
      { language: 'en', dataSource: { payload: ['course1', 'course2'] } },
    ])
    const configSvc = TestBed.inject(ConfigurationsService) as any
    configSvc.userProfile = { language: 'en' }
    component.configData = [{ badges: { showCompletedCourses: true } }]
    component.userEnrolledCourse = [
      { identifier: 'course1', completionPercentage: 100 },
      { identifier: 'course2', completionPercentage: 50 },
    ]
    await component.ngOnInit()
    expect(component.noOfBadges).toBe(1)
  })

  it('ngOnInit calculateBadges should handle getPlaylistConfig error', async () => {
    const plylsSvc = TestBed.inject(PlaylistService) as any
    plylsSvc.getPlaylistConfig = jest.fn().mockRejectedValue(new Error('Fetch failed'))
    component.configData = [{ badges: { showCompletedCourses: true } }]
    await component.ngOnInit()
    expect(component.noOfBadges).toBe(0)
  })

  it('constructor should navigate to /organisations/home when orgValue is nhsrc', () => {
    const router = TestBed.inject(Router)
    const navSpy = jest.spyOn(router, 'navigateByUrl').mockImplementation(jest.fn() as any)
    localStorage.setItem('orgValue', 'nhsrc')
    TestBed.createComponent(WebDashboardComponent)
    expect(navSpy).toHaveBeenCalledWith('/organisations/home')
    localStorage.removeItem('orgValue')
    navSpy.mockRestore()
  })
})
