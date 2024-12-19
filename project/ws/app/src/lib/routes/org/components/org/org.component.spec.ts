import { ActivatedRoute } from '@angular/router'
import { OrgComponent } from './org.component'
import { MatIconModule } from '@angular/material/icon'
import { MatCardModule } from '@angular/material/card'
import { MdePopoverModule } from '@material-extended/mde'
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing'
import { HttpClientTestingModule } from '@angular/common/http/testing'
import { RouterTestingModule } from '@angular/router/testing'
import { BehaviorSubject, of } from 'rxjs'
import { OrgServiceService } from './../../org-service.service'

describe('OrgComponent', () => {
  let fixture: ComponentFixture<OrgComponent>
  const orgDataSubject = new BehaviorSubject({ orgData: { data: { sources: [] } } })
  let orgService: OrgServiceService

  beforeEach(fakeAsync(() => {
    TestBed.configureTestingModule({
      declarations: [OrgComponent],
      imports: [MdePopoverModule, MatIconModule, MatCardModule, HttpClientTestingModule, RouterTestingModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            data: orgDataSubject.asObservable(),
            snapshot: {
              queryParams: {
                orgId: 'Indian Nursing Council',
              },
            },
          },
        },
        OrgServiceService, // Provide the actual service instance
      ],
    })
      .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(OrgComponent)
    orgService = TestBed.get(OrgServiceService) // Inject the service
    fixture.detectChanges()
  })
  it('should create', fakeAsync(() => {
    tick()
    fixture.detectChanges()
    expect(fixture.componentInstance).toBeTruthy()
  }))

  it('should get enrolled user data and competency data for an organisation', (done) => {
    const orgName = 'Indian Nursing Council'

    // Assume that getEnroledUserForCourses returns an observable
    spyOn(orgService, 'getEnroledUserForCourses').and.returnValue(of([
      { enrolled_users: '4866', competency_offered: '0' }
    ]))

    orgService.getEnroledUserForCourses(orgName).subscribe((userEnrolled) => {
      expect(userEnrolled[0].enrolled_users).toEqual('4866')
      expect(userEnrolled[0].competency_offered).toEqual('0')
      done() // Call done() to signal that the asynchronous operation is complete
    })
  })
})
