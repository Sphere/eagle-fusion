jest.mock('@ws-widget/utils', () => ({
  ConfigurationsService: class {},
  LoggerService: class {},
  ValueService: class {},
}))
jest.mock('@ws-widget/collection', () => ({
  WidgetContentService: class {},
  WidgetUserService: class {},
}))
jest.mock('src/app/services/user-data-cache.service', () => ({
  UserDataCacheService: class {},
}))
jest.mock('src/app/services/user-agent.service', () => ({
  UserAgentResolverService: class {
    requestGeolocation = jest.fn()
  },
}))
jest.mock('src/app/services/seo.service', () => ({
  SeoService: class {
    update = jest.fn()
  },
}))

import { ActivatedRoute } from '@angular/router'
import { OrgComponent } from './org.component'
import { MatIconModule } from '@angular/material/icon'
import { MatCardModule } from '@angular/material/card'
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing'
import { HttpClientTestingModule } from '@angular/common/http/testing'
import { RouterTestingModule } from '@angular/router/testing'
import { BehaviorSubject, of } from 'rxjs'
import { OrgServiceService } from './../../org-service.service'
import { ConfigurationsService, LoggerService, ValueService } from '@ws-widget/utils'
import { WidgetUserService } from '@ws-widget/collection'
import { SeoService } from 'src/app/services/seo.service'
import { UserAgentResolverService } from 'src/app/services/user-agent.service'

describe('OrgComponent', () => {
  let fixture: ComponentFixture<OrgComponent>
  const orgDataSubject = new BehaviorSubject({ orgData: { data: { sources: [] } } })
  let orgService: OrgServiceService

  beforeEach(fakeAsync(() => {
    TestBed.configureTestingModule({
      declarations: [OrgComponent],
      imports: [MatIconModule, MatCardModule, HttpClientTestingModule, RouterTestingModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            data: orgDataSubject.asObservable(),
            queryParams: of({ orgId: 'Indian Nursing Council' }),
            snapshot: {
              queryParams: {
                orgId: 'Indian Nursing Council',
              },
            },
          },
        },
        OrgServiceService,
        { provide: ConfigurationsService, useValue: { userProfile: { userId: 'u1' }, unMappedUser: null } },
        { provide: WidgetUserService, useValue: { fetchUserBatchList: jest.fn().mockReturnValue(of([])) } },
        { provide: ValueService, useValue: { isLtMedium$: of(false) } },
        { provide: LoggerService, useValue: { log: jest.fn(), warn: jest.fn(), error: jest.fn() } },
        { provide: SeoService, useValue: { update: jest.fn() } },
        { provide: UserAgentResolverService, useValue: { requestGeolocation: jest.fn() } },
      ],
    })
      .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(OrgComponent)
    orgService = TestBed.inject(OrgServiceService)
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

    orgService.getEnroledUserForCourses(orgName).subscribe((userEnrolled: any) => {
      expect(userEnrolled[0].enrolled_users).toEqual('4866')
      expect(userEnrolled[0].competency_offered).toEqual('0')
      done()
    })
  })
})
