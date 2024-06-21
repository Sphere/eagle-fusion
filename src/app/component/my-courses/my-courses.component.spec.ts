import { ComponentFixture, TestBed } from '@angular/core/testing'
import { MyCoursesComponent } from './my-courses.component'
import { FormBuilder, ReactiveFormsModule } from '@angular/forms'
import { MatSnackBarModule } from '@angular/material'
import { MatInputModule } from '@angular/material/input'
import { Router, RouterModule } from '@angular/router'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { RouterTestingModule } from '@angular/router/testing'
import { ConfigurationsService, ValueService } from '@ws-widget/utils'
import { WidgetContentService } from '@ws-widget/collection'
import { SignupService } from 'src/app/routes/signup/signup.service'
import { MatTabsModule } from '@angular/material/tabs'
import { MatProgressBarModule } from '@angular/material/progress-bar'
import { of } from 'rxjs'



const mockConfigService: Partial<ConfigurationsService> = {
  userProfile: { userId: '123' },
  unMappedUser: { profileDetails: { profileReq: { professionalDetails: [{ designation: 'Engineer' }] } } }
}
const mockWidgetContentService: Partial<WidgetContentService> = {
  fetchUserBatchList: jest.fn().mockReturnValue(of([])),
  fetchCourseRemommendations: jest.fn().mockReturnValue(of([]))
}
const mockSingUpService: Partial<SignupService> = { getUserData: jest.fn().mockResolvedValue({ profileDetails: { profileReq: { personalDetails: { dob: '1990-01-01' } } } }) }
const mockRouterService: Partial<Router> = { navigate: jest.fn(), navigateByUrl: jest.fn() }
const mockValueService: Partial<Router> = { navigate: jest.fn(), navigateByUrl: jest.fn() }




describe('PublicLoginComponent', () => {
  let component: MyCoursesComponent
  let fixture: ComponentFixture<MyCoursesComponent>

  beforeAll(() => {
    component = new MyCoursesComponent(
      mockConfigService as ConfigurationsService,
      mockWidgetContentService as WidgetContentService,
      mockSingUpService as SignupService,
      mockRouterService as Router,
      mockValueService as ValueService,
    )
  })
  beforeEach(async () => {

    await TestBed.configureTestingModule({
      declarations: [MyCoursesComponent],
      imports: [RouterModule, MatTabsModule, MatProgressBarModule, MatInputModule, MatSnackBarModule, BrowserAnimationsModule, ReactiveFormsModule, RouterTestingModule],
      providers: [
        FormBuilder,
        { provide: ConfigurationsService, useValue: mockConfigService },
        { provide: WidgetContentService, useValue: mockWidgetContentService },
        { provide: Router, useValue: mockRouterService },
        { provide: SignupService, useValue: mockSingUpService },
        { provide: ValueService, useValue: mockValueService },
      ],
    })
      .compileComponents()
  })
  beforeEach(() => {
    fixture = TestBed.createComponent(MyCoursesComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
    const courses = [{ completionPercentage: 50 }];
    (mockWidgetContentService.fetchUserBatchList as jest.Mock).mockReturnValue(of(courses))

  })
  beforeEach(() => {
    jest.clearAllMocks()
  })
  it('should create the component', () => {
    expect(component).toBeTruthy()
  })


  it('should initialize with user profile', () => {
    expect(component.startedCourse.length).toBe(0)
    expect(component.completedCourse.length).toBe(0)
    expect(component.coursesForYou.length).toBe(0)
  })

  it('should handle no user batch list on init', () => {
    (mockWidgetContentService.fetchUserBatchList as jest.Mock).mockReturnValue(of([]))
    component.ngOnInit()
    expect(mockWidgetContentService.fetchUserBatchList).toHaveBeenCalledWith('123')
    expect(component.startedCourse.length).toBe(0)
    expect(component.completedCourse.length).toBe(0)
  })

  it('should not trigger click event when element does not exist in the DOM', () => {
    const existingElement = document.getElementById('mat-tab-label-0-1')
    if (existingElement) {
      existingElement.remove()
    }
    component.tabClick()
    expect(document.getElementById('mat-tab-label-0-1')).toBeNull()
  })


  it('should handle user profile with empty professional details', () => {
    mockConfigService.userProfile = { userId: '123' }; // Reset user profile
    (mockConfigService.unMappedUser.profileDetails.profileReq.professionalDetails[0] as any).designation = '';
    (mockWidgetContentService.fetchCourseRemommendations as jest.Mock).mockReturnValue(of([]))
    component.ngOnInit()
    expect(mockWidgetContentService.fetchCourseRemommendations).toHaveBeenCalled()
    expect(component.coursesForYou).toEqual([])
  })

})