import { ActivatedRoute } from '@angular/router'
import { OrgComponent } from './org.component'
import { MatIconModule } from '@angular/material/icon'
import { MatCardModule } from '@angular/material/card'
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing'
import { HttpClientTestingModule } from '@angular/common/http/testing'
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
  getCompetencyForCourses: jest.fn().mockReturnValue(of([])),
  fetchStartUpDetails: jest.fn().mockReturnValue(of({})),
  hideHeaderFooter: new BehaviorSubject<boolean>(false),
}

describe('OrgComponent', () => {
  let fixture: ComponentFixture<OrgComponent>
  const orgDataSubject = new BehaviorSubject({ orgData: { data: { sources: [] } } })

  beforeEach(fakeAsync(() => {
    TestBed.configureTestingModule({
      declarations: [OrgComponent],
      imports: [MatIconModule, MatCardModule, HttpClientTestingModule, TranslateModule.forRoot()],
      providers: [
        { provide: Router, useValue: { navigate: jest.fn(), navigateByUrl: jest.fn(), url: '/' } },
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
    fixture.detectChanges()
  })

  it('should create', fakeAsync(() => {
    tick()
    fixture.detectChanges()
    expect(fixture.componentInstance).toBeTruthy()
  }))

})
