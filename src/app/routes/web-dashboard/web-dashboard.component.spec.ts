jest.mock('src/app/services/language.service', () => ({ LanguageService: class {} }))
jest.mock('src/app/services/user-data-cache.service', () => ({ UserDataCacheService: class {} }))
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
          useValue: {},
        },
        {
          provide: PlaylistService,
          useValue: {
            getPlaylistConfig: jest.fn().mockResolvedValue([]),
            orgDetails: jest.fn().mockReturnValue({}),
            footerConfig: jest.fn().mockReturnValue({}),
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
    const clearIntervalSpy = jest.spyOn(window, 'clearInterval').mockImplementation(() => {})
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
    expect(component.currentIndex).toBe(1)
    expect(component.clearInterval).toHaveBeenCalled()
    expect(component.currentSlideIndex).toBe(1)
    setIntervalSpy.mockRestore()
  })
})
