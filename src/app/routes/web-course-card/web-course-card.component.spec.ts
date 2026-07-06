jest.mock('rxjs/operators', () => ({
  ...jest.requireActual('rxjs/operators'),
  delay: () => (source: any) => source,
}))

jest.mock('src/app/services/user-data-cache.service', () => ({
  UserDataCacheService: class {},
}))

import { ComponentFixture, TestBed } from '@angular/core/testing'
import { Router } from '@angular/router'
import { of } from 'rxjs'
import { ConfigurationsService } from '../../../../library/ws-widget/utils/src/lib/services/configurations.service'
import { UserProfileService } from '../../../../project/ws/app/src/lib/routes/user-profile/services/user-profile.service'
import { SignupService } from '../signup/signup.service'
import { WebCourseCardComponent } from './web-course-card.component'
import { Title } from '@angular/platform-browser'
import { MatProgressBarModule } from '@angular/material/progress-bar'
import { LoggerService, TelemetryService } from '../../../../library/ws-widget/utils/src/public-api'

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
      url: '',
    }
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      },
      writable: true,
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

    TestBed.configureTestingModule({
      declarations: [WebCourseCardComponent],
      imports: [MatProgressBarModule /* other modules */],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: ConfigurationsService, useValue: configSvcSpy },
        { provide: UserProfileService, useValue: userProfileSvcSpy },
        { provide: SignupService, useValue: signUpSvcSpy },
        { provide: Title, useValue: titleServiceSpy },
        { provide: TelemetryService, useValue: { log: jest.fn(), audit: jest.fn(), interact: jest.fn() } },
        { provide: LoggerService, useValue: { log: jest.fn(), warn: jest.fn(), error: jest.fn() } },
      ],
    })
    TestBed.overrideComponent(WebCourseCardComponent, { set: { template: '' } })
    await TestBed.compileComponents()
    fixture = TestBed.createComponent(WebCourseCardComponent)
    component = fixture.componentInstance
    router = TestBed.inject(Router)
    configSvc = TestBed.inject(ConfigurationsService)
    userProfileSvc = TestBed.inject(UserProfileService)
    titleService = TestBed.inject(Title)
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
    expect(router.navigate).toHaveBeenCalledWith(['/public/toc/overview', 'course123', 'test-course'], {
      state: { tocData: data },
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
    jest.spyOn(component, 'login').mockImplementation(() => {})
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
        cneName: true,
      },
    })
  })

  it('slugify should convert text to lowercase hyphenated slug', () => {
    expect(component.slugify('Hello World')).toBe('hello-world')
    expect(component.slugify('Nursing & Care')).toBe('nursing-and-care')
    expect(component.slugify('--Test Course--')).toBe('test-course')
  })

  it('showPopup should set displayStyle to block', () => {
    component.showPopup()
    expect(component.displayStyle).toBe('block')
  })

  it('closePopup should set displayStyle to none', () => {
    component.displayStyle = 'block'
    component.closePopup()
    expect(component.displayStyle).toBe('none')
  })

  it('orgLogin should navigate to public/login', () => {
    component.orgLogin()
    expect(router.navigateByUrl).toHaveBeenCalledWith('public/login')
  })

  it('clickToRedirect should store url and navigate when userProfile is null', () => {
    configSvc.userProfile = null
    const data = { identifier: 'do_123' }
    component.clickToRedirect(data)
    expect(localStorage.setItem).toHaveBeenCalledWith('url_before_login', '/app/toc/do_123/overview')
    expect(router.navigateByUrl).toHaveBeenCalledWith('/app/toc/do_123/overview')
  })

  it('clickToRedirect should call raiseTelemetry when user is logged in', () => {
    configSvc.userProfile = { userId: 'u1' } as any
    configSvc.unMappedUser = { id: 'unmapped-1' } as any
    const spy = jest.spyOn(component, 'raiseTelemetry').mockImplementation(() => {})
    const data = { identifier: 'do_123' }
    component.clickToRedirect(data)
    expect(spy).toHaveBeenCalledWith(data)
  })

  it('redirectPage should call showPopup when on org-selective-course route and not logged in', () => {
    component.isLoggedIn = false
    ;(router as any).url = '/org-selective-course/test'
    const spy = jest.spyOn(component, 'showPopup').mockImplementation(() => {})
    component.redirectPage({ identifier: 'do_123' })
    expect(spy).toHaveBeenCalled()
  })

  it('orgCreateAccount should navigate to create-account path when orgSelectiveCourseConfig is set', () => {
    ;(configSvc as any).orgSelectiveCourseConfig = { stateCode: 'TN', orgName: 'TestOrg', signupRole: 'Student' }
    component.orgCreateAccount()
    expect(router.navigateByUrl).toHaveBeenCalledWith(expect.stringContaining('/app/create-account/TN/TestOrg/Student'))
  })

  it('orgCreateAccount should navigate to /app/create-account when no org config', () => {
    ;(configSvc as any).orgSelectiveCourseConfig = null
    component.orgCreateAccount()
    expect(router.navigateByUrl).toHaveBeenCalledWith('/app/create-account')
  })

  it('navigateToToc should call keyClockLogin when userProfile is null', () => {
    configSvc.userProfile = null
    component.navigateToToc('do_123')
    expect(router.navigateByUrl).toHaveBeenCalledWith('app/login')
  })
})
