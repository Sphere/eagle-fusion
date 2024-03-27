import { ComponentFixture, TestBed } from '@angular/core/testing'
import { RouterTestingModule } from '@angular/router/testing'
import { Title } from '@angular/platform-browser'
import { HttpClientTestingModule } from '@angular/common/http/testing'
import { MobileCourseViewComponent } from './mobile-course-view.component'
import { ConfigurationsService } from '../../../../library/ws-widget/utils/src/lib/services/configurations.service'
import { UserProfileService } from '../../../../project/ws/app/src/lib/routes/user-profile/services/user-profile.service'
import { SignupService } from '../signup/signup.service'

describe('MobileCourseViewComponent', () => {
  let component: MobileCourseViewComponent
  let fixture: ComponentFixture<MobileCourseViewComponent>
  let configService: ConfigurationsService

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MobileCourseViewComponent],
      imports: [RouterTestingModule, HttpClientTestingModule],
      providers: [Title, ConfigurationsService, UserProfileService, SignupService],
    }).compileComponents()
  })

  beforeEach(() => {
    fixture = TestBed.createComponent(MobileCourseViewComponent)
    component = fixture.componentInstance
    configService = TestBed.get(ConfigurationsService)
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should set isLoggedIn to true if userProfile is available', () => {
    spyOn(configService, 'userProfile').and.returnValue({})
    component.ngOnInit()
    expect(component.isLoggedIn).toBeTruthy()
  })

  // it('should set isLoggedIn to false if userProfile is not available', () => {
  //   spyOn(configService, 'userProfile').and.returnValue(null)
  //   component.ngOnInit()
  //   expect(component.isLoggedIn).toBeFalsy()
  // })


  it('should populate competencyData array from courseData', () => {
    component.courseData = {
      competencies_v1: '{"competency1": {"competencyName": "Competency 1", "level": 1}}',
    }
    component.ngOnInit()
    expect(component.cometencyData.length).toBe(1)
    expect(component.cometencyData[0].name).toBe('Competency 1')
    expect(component.cometencyData[0].levels).toBe(' Level 1')
  })

  it('should navigate to toc if user is logged in', () => {
    spyOn(component, 'navigateToToc')
    spyOn(component, 'isLoggedIn').and.returnValue(true)
    const course = { identifier: 'course_identifier' }
    component.redirectPage(course)
    expect(component.navigateToToc).toHaveBeenCalledWith('course_identifier')
  })

  it('should set title and navigate to toc on login', () => {
    spyOn(component.titleService, 'setTitle')
    spyOn(component.router, 'navigate')
    component.login({ name: 'Course Name', identifier: 'course_identifier' })
    expect(component.titleService.setTitle).toHaveBeenCalledWith('Course Name - Aastrika')
    expect(component.router.navigate).toHaveBeenCalledWith(['/public/toc/overview'], {
      state: { tocData: { name: 'Course Name', identifier: 'course_identifier' } },
      queryParams: { courseId: 'course_identifier' }
    })
  })

  // it('should navigate to toc page', () => {
  //   spyOn(component.router, 'navigateByUrl')
  //   component.navigateToToc('course_identifier')
  //   expect(component.router.navigateByUrl).toHaveBeenCalledWith('app/toc/course_identifier/overview')
  // })

})
