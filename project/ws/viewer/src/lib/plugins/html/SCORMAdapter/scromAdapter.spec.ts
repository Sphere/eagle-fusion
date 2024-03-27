import { SCORMAdapterService } from './scormAdapter'

describe('SCORMAdapterService', () => {
  let service: SCORMAdapterService

  beforeEach(() => {
    service = new SCORMAdapterService(
      {} as any, // Mock Storage
      {} as any, // Mock HttpClient
      {} as any, // Mock HttpBackend
      {} as any, // Mock ActivatedRoute
      {} as any, // Mock ConfigurationsService
      {} as any, // Mock ViewerDataService
      {} as any, // Mock Router
      {} as any, // Mock WidgetContentService
      {} as any  // Mock TelemetryService
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  it('should initialize contentId properly', () => {
    service.contentId = '123'
    expect(service.contentId).toEqual('123')
  })

  it('should initialize htmlName properly', () => {
    service.htmlName = 'Test Name'
    expect(service.htmlName).toEqual('Test Name')
  })

  it('should initialize parentName properly', () => {
    service.parentName = 'Parent Name'
    expect(service.parentName).toEqual('Parent Name')
  })



  it('should get error string properly', () => {
    expect(service.LMSGetErrorString(404)).toEqual('')
  })

  it('should get diagnostic properly', () => {
    expect(service.LMSGetDiagnostic(404)).toEqual('')
  })


  it('should unsubscribe when destroyed', () => {
    service.ngOnDestroy()
    expect(service.scromSubscription).toBeFalsy()
  })

  it('should get percentage properly', () => {
    const postData = { 'cmi.core.lesson_status': 'completed' }
    expect(service.getPercentage(postData)).toEqual(100)
  })

  it('should get percentage 0 if status is failed properly', () => {
    const postData = { 'cmi.core.lesson_status': 'failed' }
    expect(service.getPercentage(postData)).toEqual(0)
  })
  it('should get status properly', () => {
    const postData = { 'cmi.core.lesson_status': 'completed' }
    expect(service.getStatus(postData)).toEqual(2)
  })

  it('should add data properly', () => {
    expect(service.addData({} as any)).toBeTruthy()
  })

  it('should handle error when getting completion status', () => {
    expect(service.getStatus({} as any)).toEqual(1)
  })
})
