import { TestBed } from '@angular/core/testing'
import { RouterTestingModule } from '@angular/router/testing'
import { MatDialog } from '@angular/material/dialog'
import { WebDashboardComponent } from './web-dashboard.component'
import { ScrollService } from '../../services/scroll.service'
import { ConfigurationsService } from '../../../../library/ws-widget/utils/src/public-api'
import { UserProfileService } from 'project/ws/app/src/lib/routes/user-profile/services/user-profile.service'
import { MatSnackBar } from '@angular/material/snack-bar'
import { Router } from '@angular/router'
import { EventEmitter } from '@angular/core'
import { of } from 'rxjs'


const mockSignupService: Partial<UserProfileService> = {
  getUserdetailsFromRegistry: jest.fn().mockReturnValue(of('')),
}
const mockConfigService: Partial<ConfigurationsService> = {
  unMappedUser: { id: 'user123' } as any,
  userProfile: { userId: 'user123' } as any,
}
const mockScrollService: Partial<ScrollService> = {
  scrollToDivEvent: new EventEmitter<string>(),
}
const router: Partial<Router> = {}
const mockMatDialog: Partial<MatDialog> = { open: jest.fn() }
const mockLanguageSvc = {}
const mockPlaylistSvc = { orgDetails: jest.fn(), footerConfig: jest.fn() }
const mockLogger = { log: jest.fn() }
const mockCdr = { detectChanges: jest.fn(), markForCheck: jest.fn() }
const mockThemeSvc = { isDark: jest.fn().mockReturnValue(false) }


describe('WebDashboardComponent', () => {
  let component: WebDashboardComponent

  beforeAll(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        { provide: ScrollService, useValue: mockScrollService },
        { provide: ConfigurationsService, useValue: mockConfigService },
        { provide: UserProfileService, useValue: mockSignupService },
        { provide: Router, useValue: router },
        { provide: MatSnackBar, useValue: {} },
      ],
    }).compileComponents()

    component = TestBed.runInInjectionContext(() => new WebDashboardComponent(
      router as Router,
      mockMatDialog as MatDialog,
      mockScrollService as ScrollService,
      mockConfigService as ConfigurationsService,
      mockSignupService as UserProfileService,
      mockLanguageSvc as any,
      mockPlaylistSvc as any,
      mockLogger as any,
      mockCdr as any,
      mockThemeSvc as any,
    ))
    component.dataCarousel = [{}, {}] as any[]
  })

  beforeEach(() => {
    jest.clearAllMocks()
    jest.useRealTimers()
    component.currentSlideIndex = 0
  })

  it('should create the component', () => {
    expect(component).toBeTruthy()
  })

  it('should start carousel', () => {
    jest.useFakeTimers()
    const spy = jest.spyOn(global, 'setInterval')
    component.startCarousel()
    expect(spy).toHaveBeenCalled()
    jest.runOnlyPendingTimers()
    expect(component.currentSlideIndex).toBe(1)
  })

  it('should clear interval', () => {
    jest.useFakeTimers()
    const spy = jest.spyOn(global, 'clearInterval')
    component.intervalId = setInterval(() => { }, 3000)
    component.clearInterval()
    expect(spy).toHaveBeenCalledWith(component.intervalId)
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
    component.clearInterval = jest.fn()
    component.startCarousel = jest.fn()
    component.goToSlide(1)
    expect(component.clearInterval).toHaveBeenCalled()
    expect(component.currentSlideIndex).toBe(1)
  })
})
