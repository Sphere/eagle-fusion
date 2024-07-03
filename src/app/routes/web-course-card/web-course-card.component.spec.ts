import { ComponentFixture, TestBed } from '@angular/core/testing'
import { Router } from '@angular/router'
import { of } from 'rxjs'
import { ConfigurationsService } from '../../../../library/ws-widget/utils/src/lib/services/configurations.service'
import { UserProfileService } from '../../../../project/ws/app/src/lib/routes/user-profile/services/user-profile.service'
import { SignupService } from '../signup/signup.service'
import { WebCourseCardComponent } from './web-course-card.component'
import { Title } from '@angular/platform-browser'
import { MatProgressBarModule } from '@angular/material/progress-bar'

describe('WebCourseCardComponent', () => {
  let component: WebCourseCardComponent
  let fixture: ComponentFixture<WebCourseCardComponent>
  let router: Router
  let configSvc: ConfigurationsService
  let userProfileSvc: UserProfileService
  let titleService: Title

  beforeEach(async () => {
    const routerSpy = {
      navigateByUrl: jest.fn(),
      navigate: jest.fn(),
    }
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn()
      },
      writable: true
    })
    const configSvcSpy = {
      userProfile: null,
      unMappedUser: null,
    }

    const userProfileSvcSpy = {
      getUserdetailsFromRegistry: jest.fn().mockReturnValue(of({})),
      isBackgroundDetailsFilled: jest.fn().mockReturnValue(true),
    }

    const signUpSvcSpy = {
      keyClockLogin: jest.fn(),
    }

    const titleServiceSpy = {
      setTitle: jest.fn(),
    }

    await TestBed.configureTestingModule({
      declarations: [WebCourseCardComponent],
      imports: [MatProgressBarModule, /* other modules */],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: ConfigurationsService, useValue: configSvcSpy },
        { provide: UserProfileService, useValue: userProfileSvcSpy },
        { provide: SignupService, useValue: signUpSvcSpy },
        { provide: Title, useValue: titleServiceSpy },
      ],
    }).compileComponents()

    fixture = TestBed.createComponent(WebCourseCardComponent)
    component = fixture.componentInstance
    router = TestBed.get(Router)
    configSvc = TestBed.get(ConfigurationsService)
    userProfileSvc = TestBed.get(UserProfileService)
    titleService = TestBed.get(Title)
  })

  it('should create the component', () => {
    expect(component).toBeTruthy()
  })

  it('should set isUserLoggedIn based on localStorage', () => {
    (localStorage.getItem as jest.Mock).mockReturnValue('true')
    component.ngOnInit()
    expect(component.isUserLoggedIn).toBe(true)
  })



  it('should set isLoggedIn to false if configSvc.userProfile is null', () => {
    configSvc.userProfile = null
    component.ngOnInit()
    expect(component.isLoggedIn).toBe(false)
  })

  it('should populate competencyData from courseData', () => {
    component.courseData = {
      competencies_v1: JSON.stringify([
        { competencyName: 'Competency 1', level: 1 },
        { competencyName: 'Competency 2', level: 2 },
      ]),
    }
    component.ngOnInit()
    expect(component.cometencyData).toEqual([
      { name: 'Competency 1', levels: ' Level 1' },
      { name: 'Competency 2', levels: ' Level 2' },
    ])
  })


  it('should call userProfileSvc and navigate in raiseTelemetry', () => {
    configSvc.unMappedUser = { id: 'user123' }
    const data = { identifier: 'course123' }
    component.raiseTelemetry(data)
    expect(userProfileSvc.getUserdetailsFromRegistry).toHaveBeenCalledWith('user123')
  })

  it('should set title and navigate in login', () => {
    const data = { name: 'Test Course', identifier: 'course123' }
    component.login(data)
    expect(titleService.setTitle).toHaveBeenCalledWith('Test Course - Aastrika')
    expect(router.navigate).toHaveBeenCalledWith(['/public/toc/overview'], {
      state: { tocData: data },
      queryParams: { courseId: 'course123' },
    })
  })

  it('should navigate in redirectPage if user is logged in', () => {
    component.isLoggedIn = true
    const course = { identifier: 'course123' }
    jest.spyOn(component, 'navigateToToc')
    component.redirectPage(course)
    expect(component.navigateToToc).toHaveBeenCalledWith('course123')
  })

  it('should call login in redirectPage if user is not logged in', () => {
    component.isLoggedIn = false
    const course = { identifier: 'course123' }
    jest.spyOn(component, 'login')
    component.redirectPage(course)
    expect(component.login).toHaveBeenCalledWith(course)
  })


  it('should call userProfileSvc and navigate in navigateToToc for unmapped user', () => {
    configSvc.userProfile = { userId: 'user123' }
    configSvc.unMappedUser = { id: 'unmappedUser' }
    const contentIdentifier = 'course123'
    component.navigateToToc(contentIdentifier)
    expect(userProfileSvc.getUserdetailsFromRegistry).toHaveBeenCalledWith('unmappedUser')
  })




  it('should set displayConfig default values', () => {
    expect(component.displayConfig).toEqual({
      displayType: 'card-badges',
      badges: {
        orgIcon: true,
        certification: true,
        sourceName: true,
        rating: true,
        cnePoints: true,
      },
    })
  })







})
