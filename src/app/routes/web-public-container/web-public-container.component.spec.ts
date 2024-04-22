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
import { of } from 'rxjs'

@Pipe({ name: 'pipeDurationTransform' })
class MockPipeDurationTransform implements PipeTransform {
  transform(value: any): any {
    return value
  }
}


const mockScrollServiceService: Partial<ScrollService> = {
  scrollToElement: jest.fn()
}
const mockOrgService: Partial<OrgServiceService> = { getLiveSearchResults: jest.fn().mockReturnValue(of({ result: { content: [] } })) }
const mockRouterService: Partial<Router> = { navigate: jest.fn(), navigateByUrl: jest.fn() }
const mockHttpService: Partial<HttpClient> = {}

const mockDialogBar: Partial<MatDialog> = {
  open: jest.fn()
}

describe('WebPublicComponent', () => {
  let component: WebPublicComponent
  beforeAll(() => {
    component = new WebPublicComponent(
      mockRouterService as Router,
      mockHttpService as HttpClient,
      mockDialogBar as MatDialog,
      mockOrgService as OrgServiceService,
      mockScrollServiceService as ScrollService,

    )
  })
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MockPipeDurationTransform, BtnContentShareComponent, WebPublicComponent, HorizontalScrollerComponent, WebCourseCardComponent, WebCourseViewComponent, WebFeaturedCourseComponent],
      imports: [RouterTestingModule, HttpClientTestingModule, MatIconModule, // Add MatIconModule
        MatProgressSpinnerModule, MdePopoverModule, MatCardModule],
      providers: [
        { provide: HttpClient, useValue: mockHttpService },
        { provide: MatDialog, useValue: mockDialogBar },
        { provide: Router, useValue: mockRouterService },
        { provide: ScrollService, useValue: mockScrollServiceService },
        { provide: OrgServiceService, useValue: mockOrgService },
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
})
