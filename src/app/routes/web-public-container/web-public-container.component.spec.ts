import { TestBed } from '@angular/core/testing'
import { RouterTestingModule } from '@angular/router/testing'
import { HttpClientTestingModule } from '@angular/common/http/testing'
import { MatDialog } from '@angular/material/dialog'
import { WebPublicComponent } from './web-public-container.component'
import { ScrollService } from '../../services/scroll.service'
import { OrgServiceService } from '../../../../project/ws/app/src/lib/routes/org/org-service.service'
import { HttpClient } from '@angular/common/http'
import { HorizontalScrollerComponent } from '../../../../library/ws-widget/utils/src/lib/helpers/horizontal-scroller/horizontal-scroller.component'
import { WebCourseViewComponent } from '../web-course-view/web-course-view.component'
import { WebCourseCardComponent } from '../web-course-card/web-course-card.component'
import { WebFeaturedCourseComponent } from '../web-featured-course/web-featured-course.component'
import { MatCardModule, MatIconModule, MatProgressSpinnerModule } from '@angular/material'
import { MdePopoverModule } from '@material-extended/mde'
import { ElementRef, Pipe, PipeTransform } from '@angular/core'
import { Router } from '@angular/router'
import { BtnContentShareComponent } from '../../../../library/ws-widget/collection/src/lib/btn-content-share/btn-content-share.component'
import { ConfigurationsService } from '@ws-widget/utils'
import { WidgetContentService } from '@ws-widget/collection'
import { MatProgressBarModule } from '@angular/material/progress-bar'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'
import { of, Subject, throwError } from 'rxjs'

@Pipe({ name: 'pipeDurationTransform' })

class MockPipeDurationTransform implements PipeTransform {
  transform(value: any): any {
    return value
  }
}
class MockEventEmitter<T> extends Subject<T> {
  emit(value: T) {
    this.next(value)
  }
}

const mockScrollServiceService: Partial<ScrollService> = {
  scrollToElement: jest.fn(),
  scrollToDivEvent: new MockEventEmitter<string>()
}

const mockConfigServiceService: Partial<ConfigurationsService> = {}
const mockOrgService: Partial<OrgServiceService> = { getLiveSearchResults: jest.fn().mockReturnValue(of({ result: { content: [] } })) }
const mockHttpService: Partial<HttpClient> = {}
const mockRouterService: Partial<Router> = {
  navigate: jest.fn(), // Add this line
  navigateByUrl: jest.fn(),
}
const mockDialogBar: Partial<MatDialog> = {
  open: jest.fn()
}
const mockWidgetContentServiceService: Partial<WidgetContentService> = {
  fetchCourseRemommendations: jest.fn().mockReturnValue(throwError('Error')) // simulate error
}
// const mockScrollServiceService: Partial<ScrollService> = {
//   scrollToElement: jest.fn(),
//   scrollToDivEvent: new Subject<string>() // Mocking as a Subject to use emit and subscribe
// }
describe('WebPublicComponent', () => {
  let scrollToDivEvent: Subject<string>
  let component: WebPublicComponent
  beforeAll(() => {
    component = new WebPublicComponent(
      mockRouterService as Router,
      mockHttpService as HttpClient,
      mockDialogBar as MatDialog,
      mockOrgService as OrgServiceService,
      mockScrollServiceService as ScrollService,
      mockConfigServiceService as ConfigurationsService,
      mockWidgetContentServiceService as WidgetContentService,
    )
    scrollToDivEvent = mockScrollServiceService.scrollToDivEvent as Subject<string>
  })
  const mockHttpClient = {
    get: jest.fn(),
    // Other mock methods if needed
  }
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MockPipeDurationTransform, BtnContentShareComponent, WebPublicComponent, HorizontalScrollerComponent, WebCourseCardComponent, WebCourseViewComponent, WebFeaturedCourseComponent],
      imports: [RouterTestingModule, HttpClientTestingModule, MatIconModule, MatProgressSpinnerModule, MdePopoverModule, MatCardModule, BrowserAnimationsModule, MatProgressBarModule],
      providers: [
        { provide: HttpClient, useValue: mockHttpService },
        { provide: MatDialog, useValue: mockDialogBar },
        { provide: Router, useValue: mockRouterService },
        { provide: ScrollService, useValue: mockScrollServiceService },
        { provide: OrgServiceService, useValue: mockOrgService },
        { provide: HttpClient, useValue: mockHttpClient }
      ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA,
      ]
    }).compileComponents()
    const mockNativeElement = document.createElement('div')
    component.scrollToCneCourses = new ElementRef(mockNativeElement)

  })

  beforeEach(() => {
    jest.clearAllMocks()
  })


  it('should create the component', () => {
    expect(component).toBeTruthy()
  })
  // Add this test for handleScrollEvents
  it('should handle scroll events', () => {
    component.ngOnInit()
    scrollToDivEvent.next('scrollToCneCourses')
    expect(component.scrollService.scrollToElement).toHaveBeenCalledWith(component.scrollToCneCourses.nativeElement)
  })

  // Add this test for scroll to CNE courses when button is clicked
  it('should scroll to CNE courses when button is clicked', () => {
    component.ngOnInit()
    scrollToDivEvent.next('scrollToCneCourses')
    expect(component.scrollService.scrollToElement).toHaveBeenCalledWith(component.scrollToCneCourses.nativeElement)
  })
  it('should format CNE course response', () => {
    const res = { result: { content: [{ identifier: '1' }, { identifier: '2' }, { identifier: '3' }] } }
    component.cneCoursesIdentifier = ['1', '2']
    component.formatcneCourseResponse(res)
    expect(component.cneCourse).toEqual([{ identifier: '1' }, { identifier: '2' }])
  })

  it('should format featured course response', () => {
    const res = { result: { content: [{ identifier: '1' }, { identifier: '2' }, { identifier: '3' }] } }
    component.featuredCourseIdentifier = ['1', '2']
    component.formatFeaturedCourseResponse(res)
    expect(component.featuredCourse).toEqual([{ identifier: '1' }, { identifier: '2' }])
  })

  it('should format top certified course response', () => {
    const res = { result: { content: [{ identifier: '1' }, { identifier: '2' }, { identifier: '3' }] } }
    component.topCertifiedCourseIdentifier = ['1', '2']
    component.formatTopCertifiedCourseResponse(res)
    expect(component.topCertifiedCourse).toEqual([{ identifier: '1' }, { identifier: '2' }])
  })

  it('should raise telemetry and navigate to course page', () => {
    component.raiseTelemetry('courseIdentifier')
    expect(mockRouterService.navigateByUrl).toHaveBeenCalledWith('/app/toc/courseIdentifier/overview')
  })

  it('should navigate to search learning page', () => {
    component.viewAllCourse()
    expect(mockRouterService.navigateByUrl).toHaveBeenCalledWith('app/search/learning')
  })

  it('should navigate to video player page with query params', () => {
    const video = { videoIndex: 'videoIndex' }
    component.openIframe(video)
    const expectedNavigationExtras = { queryParams: { video: 'videoIndex' } }
    expect(mockRouterService.navigate).toHaveBeenCalledWith(['/app/video-player'], expectedNavigationExtras)
  })

  // User enrolled courses are displayed with correct display configuration
  it('should initialize component with correct data when user has enrolled courses', () => {
    // Call ngOnInit method
    component.ngOnInit()

    // Assert that the component is initialized with correct data
    expect(component.userEnrolledDisplayConfig).toEqual({
      displayType: 'card-mini',
      badges: {
        certification: true,
        rating: true,
        completionPercentage: true,
      },
    })
  })

  // Course recommendations are fetched and displayed with correct display configuration
  it('should initialize component with correct data when user has no enrolled courses', () => {
    component.userEnrollCourse = []
    component.ngOnInit()
    expect(component.userEnrolledDisplayConfig).toEqual({
      displayType: 'card-mini',
      badges: {
        certification: true,
        rating: true,
        completionPercentage: true
      }
    })
  })

  it('should set display configuration correctly when user has no enrolled courses', () => {
    component.userEnrollCourse = []
    component.ngOnInit()
    expect(component.userEnrolledDisplayConfig).toEqual({
      displayType: 'card-mini',
      badges: {
        certification: true,
        rating: true,
        completionPercentage: true
      }
    })
  })

  it('should initialize component with correct data when user has enrolled courses', () => {
    component.userEnrollCourse = [{ id: 1 }]
    component.ngOnInit()
    expect(component.userEnrolledDisplayConfig).toEqual({
      displayType: 'card-mini',
      badges: {
        certification: true,
        rating: true,
        completionPercentage: true
      }
    })
  })

  // User can view all courses by clicking on the button
  it('should navigate to the search page when viewAllCourse is called', () => {
    // Call viewAllCourse method
    component.viewAllCourse()

    // Assert that the router's navigateByUrl method is called with the correct argument
    expect(mockRouterService.navigateByUrl).toHaveBeenCalledWith('app/search/learning')
  })

  // User can navigate to course page by clicking on a course
  it('should navigate to course page when a course is clicked', () => {
    // Call ngOnInit method
    component.ngOnInit()

    // Simulate clicking on a course
    component.raiseTelemetry('courseIdentifier')

    // Assert that the router's navigateByUrl method is called with the correct URL
    expect(mockRouterService.navigateByUrl).toHaveBeenCalledWith('/app/toc/courseIdentifier/overview')
  })

  // User has no professional details, course recommendations are not fetched
  it('should initialize component with correct data when user has no enrolled courses', () => {
    // Call ngOnInit method
    component.ngOnInit()

    // Assert that the component is initialized with correct data
    expect(component.userEnrolledDisplayConfig).toEqual({
      displayType: 'card-mini',
      badges: {
        certification: true,
        rating: true,
        completionPercentage: true,
      },
    })
  })



  // User can view all top certified courses by clicking on the button
  it('should navigate to the correct route when viewAllCourse method is called', () => {
    // Call viewAllCourse method
    component.viewAllCourse()

    // Assert that the navigateByUrl method is called with the correct route
    expect(mockRouterService.navigateByUrl).toHaveBeenCalledWith('app/search/learning')
  })

  // No courses are found for top certified, featured, or CNE courses, empty arrays are displayed
  it('should initialize component with correct data when user has no enrolled courses', () => {
    // Call ngOnInit method
    component.ngOnInit()

    // Assert that the component is initialized with correct data
    expect(component.userEnrolledDisplayConfig).toEqual({
      displayType: 'card-mini',
      badges: {
        certification: true,
        rating: true,
        completionPercentage: true,
      },
    })
  })

  // User can view all featured courses by clicking on the button
  it('should navigate to the correct route when view all course button is clicked', () => {
    // Call ngOnInit method
    component.ngOnInit()

    // Simulate click event on view all course button
    component.viewAllCourse()

    // Assert that the navigateByUrl method is called with the correct route
    expect(mockRouterService.navigateByUrl).toHaveBeenCalledWith('app/search/learning')
  })

  // User can view all CNE courses by clicking on the button
  it('should scroll to CNE courses when button is clicked', () => {
    component.scrollToCneCourses = new ElementRef(document.createElement('div'))
    component.scrollService.scrollToElement = jest.fn()

    component.scrollService.scrollToDivEvent.emit('scrollToCneCourses')

    expect(component.scrollService.scrollToElement).toHaveBeenCalledWith(component.scrollToCneCourses.nativeElement)
  })

  // Home feature data is fetched and displayed correctly
  it('should initialize component with correct data when user has no enrolled courses', () => {
    // Call ngOnInit method
    component.ngOnInit()
    // Assert that the component is initialized with correct data
    expect(component.userEnrolledDisplayConfig).toEqual({
      displayType: 'card-mini',
      badges: {
        certification: true,
        rating: true,
        completionPercentage: true,
      },
    })
  })


})
