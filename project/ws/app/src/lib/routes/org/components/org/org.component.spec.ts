import { ActivatedRoute } from '@angular/router'
import { OrgComponent } from './org.component'
import { MatIconModule } from '@angular/material/icon'
import { MatCardModule } from '@angular/material/card'
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing'
import { HttpClientTestingModule } from '@angular/common/http/testing'
import { RouterTestingModule } from '@angular/router/testing'
import { BehaviorSubject, of, Subject } from 'rxjs'
import { OrgServiceService } from './../../org-service.service'
import { ConfigurationsService, ValueService, LoggerService } from '@ws-widget/utils'
import { WidgetUserService } from '@ws-widget/collection'
import { SeoService } from 'src/app/services/seo.service'
import { UserAgentResolverService } from 'src/app/services/user-agent.service'
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core'
import { TranslateModule } from '@ngx-translate/core'

const mockValueSvc = {
  isLtMedium$: of(false),
  isXSmall$: of(false),
}
const mockConfigSvc = { userProfile: null, unMappedUser: null }
const mockLogger = { log: jest.fn(), warn: jest.fn(), error: jest.fn() }
const mockSeoSvc = { setMetaData: jest.fn() }
const mockUserAgentSvc = { requestGeolocation: jest.fn() }
const mockUserSvc = {}
const mockOrgService = {
  getEnroledUserForCourses: jest.fn().mockReturnValue(of([])),
  getCompetencyForCourses: jest.fn().mockReturnValue(of([])),
  fetchStartUpDetails: jest.fn().mockReturnValue(of({})),
  hideHeaderFooter: new BehaviorSubject<boolean>(false),
}

describe('OrgComponent', () => {
  let fixture: ComponentFixture<OrgComponent>
  const orgDataSubject = new BehaviorSubject({ orgData: { data: { sources: [] } } })
  let orgService: OrgServiceService

  beforeEach(fakeAsync(() => {
    TestBed.configureTestingModule({
      declarations: [OrgComponent],
      imports: [MatIconModule, MatCardModule, HttpClientTestingModule, RouterTestingModule, TranslateModule.forRoot()],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            data: orgDataSubject.asObservable(),
            queryParams: of({ orgId: 'Indian Nursing Council' }),
            snapshot: { queryParams: { orgId: 'Indian Nursing Council' } },
          },
        },
        { provide: OrgServiceService, useValue: mockOrgService },
        { provide: ConfigurationsService, useValue: mockConfigSvc },
        { provide: ValueService, useValue: mockValueSvc },
        { provide: LoggerService, useValue: mockLogger },
        { provide: SeoService, useValue: mockSeoSvc },
        { provide: UserAgentResolverService, useValue: mockUserAgentSvc },
        { provide: WidgetUserService, useValue: mockUserSvc },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    })
      .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(OrgComponent)
    orgService = TestBed.inject(OrgServiceService) as any
    fixture.detectChanges()
  })

  it('should create', fakeAsync(() => {
    tick()
    fixture.detectChanges()
    expect(fixture.componentInstance).toBeTruthy()
  }))

  it('should get enrolled user data and competency data for an organisation', done => {
    const orgName = 'Indian Nursing Council'

    jest.spyOn(orgService, 'getEnroledUserForCourses').mockReturnValue(of([
      { enrolled_users: '4866', competency_offered: '0' },
    ]) as any)

    orgService.getEnroledUserForCourses(orgName).subscribe((userEnrolled: any[]) => {
      expect(userEnrolled[0].enrolled_users).toEqual('4866')
      expect(userEnrolled[0].competency_offered).toEqual('0')
      done()
    })
  })
})
