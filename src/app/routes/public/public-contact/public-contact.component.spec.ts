jest.mock('@ws-widget/utils', () => ({
  ConfigurationsService: class {
    pageNavBar = {}
    instanceConfig: any = null
  },
  LoggerService: class {
    log = jest.fn()
    error = jest.fn()
  },
  NsPage: {},
}))

jest.mock('../../../constants/apiConstants', () => ({
  S3_END_POINTS: { CONTACT_PAGE_CONFIG: 'https://s3.example.com/contact.json' },
}))

import { of, throwError } from 'rxjs'
import { PublicContactComponent } from './public-contact.component'

describe('PublicContactComponent', () => {
  let component: PublicContactComponent
  let mockConfigSvc: any
  let mockRoute: any
  let mockHttp: any
  let mockLogger: any
  const contactPageData = { contact: { email: 'info@aastrika.org' } }

  beforeEach(() => {
    mockConfigSvc = { pageNavBar: {}, instanceConfig: null }
    mockRoute = { data: of({ pageData: { data: contactPageData } }) }
    mockHttp = { get: jest.fn().mockReturnValue(of(contactPageData)) }
    mockLogger = { log: jest.fn(), error: jest.fn() }
    component = new PublicContactComponent(mockConfigSvc, mockRoute, mockHttp, mockLogger)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should default contactUsMail to empty string', () => {
    expect(component.contactUsMail).toBe('')
  })

  it('should default panelOpenState to false', () => {
    expect(component.panelOpenState).toBe(false)
  })

  it('should load contact page from S3 on ngOnInit', () => {
    component.ngOnInit()
    expect(mockHttp.get).toHaveBeenCalledWith('https://s3.example.com/contact.json')
    expect(component.contactPage).toEqual(contactPageData)
  })

  it('should set contactUsMail from instanceConfig.mailIds.contactUs', () => {
    mockConfigSvc.instanceConfig = { mailIds: { contactUs: 'support@aastrika.org' } }
    component = new PublicContactComponent(mockConfigSvc, mockRoute, mockHttp, mockLogger)
    component.ngOnInit()
    expect(component.contactUsMail).toBe('support@aastrika.org')
  })

  it('should fallback to local assets if S3 fails', () => {
    const localData = { contact: { email: 'local@example.com' } }
    mockHttp.get
      .mockReturnValueOnce(throwError(() => new Error('S3 fail')))
      .mockReturnValueOnce(of(localData))
    component.ngOnInit()
    expect(component.contactPage).toEqual(localData)
  })

  it('should fallback to resolver data if both S3 and local assets fail', () => {
    mockHttp.get
      .mockReturnValueOnce(throwError(() => new Error('S3 fail')))
      .mockReturnValueOnce(throwError(() => new Error('local fail')))
    component.ngOnInit()
    expect(component.contactPage).toEqual(contactPageData)
  })

  it('should unsubscribe on ngOnDestroy', () => {
    expect(() => component.ngOnDestroy()).not.toThrow()
  })
})
