import { ActivatedRoute, Router } from '@angular/router'
import { OrgComponent } from './org.component'
import { BehaviorSubject, of } from 'rxjs'
import { OrgServiceService } from './../../org-service.service'
import { ConfigurationsService, ValueService, LoggerService } from '@ws-widget/utils'
import { ChangeDetectorRef } from '@angular/core'
import { SeoService } from 'src/app/services/seo.service'
import { UserAgentResolverService } from 'src/app/services/user-agent.service'

jest.mock('@ws-widget/collection', () => ({
  WidgetUserService: class MockWidgetUserService {},
}))

import { WidgetUserService } from '@ws-widget/collection'

const orgDataSubject = new BehaviorSubject({ orgData: { data: { sources: [] } } })

const mockActivatedRoute = {
  data: orgDataSubject.asObservable(),
  queryParams: of({ orgId: 'Indian Nursing Council' }),
  snapshot: { queryParams: { orgId: 'Indian Nursing Council' } },
}

const mockRouter: Partial<Router> = {
  navigate: jest.fn(),
  navigateByUrl: jest.fn(),
  url: '/',
}

const mockOrgService: Partial<OrgServiceService> = {
  getCompetencyForCourses: jest.fn().mockReturnValue(of([])),
  fetchStartUpDetails: jest.fn().mockReturnValue(of({})),
  hideHeaderFooter: new BehaviorSubject<boolean>(false),
}

const mockConfigSvc: Partial<ConfigurationsService> = {
  userProfile: null,
  unMappedUser: null,
}

const mockValueSvc: Partial<ValueService> = {
  isLtMedium$: of(false) as any,
  isXSmall$: of(false) as any,
}

const mockLogger: Partial<LoggerService> = {
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}

const mockCdr: Partial<ChangeDetectorRef> = {
  detectChanges: jest.fn(),
}

const mockSeoSvc: Partial<SeoService> = {
  setMetaData: jest.fn(),
}

const mockUserAgentSvc: Partial<UserAgentResolverService> = {
  requestGeolocation: jest.fn(),
}

const mockUserSvc = new WidgetUserService()

function createComponent(): OrgComponent {
  return new OrgComponent(
    mockActivatedRoute as ActivatedRoute,
    mockOrgService as OrgServiceService,
    mockRouter as Router,
    mockConfigSvc as ConfigurationsService,
    mockUserSvc,
    mockValueSvc as ValueService,
    mockLogger as LoggerService,
    mockCdr as ChangeDetectorRef,
    mockSeoSvc as SeoService,
    mockUserAgentSvc as UserAgentResolverService,
  )
}

describe('OrgComponent', () => {
  let component: OrgComponent

  beforeEach(() => {
    jest.clearAllMocks()
    ;(mockOrgService.fetchStartUpDetails as jest.Mock).mockReturnValue(of({}))
    ;(mockOrgService.getCompetencyForCourses as jest.Mock).mockReturnValue(of([]))
    component = createComponent()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
