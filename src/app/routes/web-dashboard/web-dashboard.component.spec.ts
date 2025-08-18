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



const mockSignupService: Partial<UserProfileService> = {}
const mockConfigService: Partial<ConfigurationsService> = {}
const mockScrollService: Partial<ScrollService> = {
  scrollToDivEvent: new EventEmitter<string>() // Creating a mock EventEmitter<string>
}
const router: Partial<Router> = {}

const mockMatDialog: Partial<MatDialog> = {
  open: jest.fn()
}


describe('WebDashboardComponent', () => {
  let component: WebDashboardComponent
  // let scrollService: ScrollService
  beforeAll(() => {
    component = new WebDashboardComponent(
      router as Router,
      mockMatDialog as MatDialog,
      mockScrollService as ScrollService,
      mockConfigService as ConfigurationsService,
      mockSignupService as UserProfileService,

    )
  })
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WebDashboardComponent],
      imports: [RouterTestingModule],
      providers: [
        { provide: ScrollService, useValue: mockScrollService },
        { provide: ConfigurationsService, useValue: mockConfigService },
        { provide: UserProfileService, useValue: mockSignupService },
        { provide: Router, useValue: router },

        { provide: MatSnackBar, useValue: jest.fn() }
      ],
    })
      .compileComponents()
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should create the component', () => {
    expect(component).toBeTruthy()
  })

  it('should start carousel', () => {
    jest.useFakeTimers()
    component.startCarousel()
    expect(setInterval).toHaveBeenCalled()
    jest.runOnlyPendingTimers()
    expect(component.currentSlideIndex).toBe(1)
    jest.useRealTimers()
  })

  it('should clear interval', () => {
    jest.useFakeTimers()
    component.intervalId = setInterval(() => { }, 3000)
    component.clearInterval()
    expect(clearInterval).toHaveBeenCalledWith(component.intervalId)
    jest.useRealTimers()
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
    component.goToSlide(1)
    expect(component.currentIndex).toBe(1)
    expect(component.clearInterval).toHaveBeenCalled()
    expect(component.currentSlideIndex).toBe(1)
  })

  // it('should emit scroll event', () => {
  //   const value = 'testValue'
  //   component.scrollToHowSphereWorks(value)
  //   expect(scrollService.scrollToDivEvent.emit).toHaveBeenCalledWith(value)
  // })

})
