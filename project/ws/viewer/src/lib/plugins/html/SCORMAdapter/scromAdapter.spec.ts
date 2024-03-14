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

  // it('should initialize Initialized status properly', () => {
  //   service.LMSInitialize()
  //   expect(service['_isInitialized']()).toBe(true)
  // })

  // it('should finish and clear data properly', () => {
  //   service.LMSInitialize()
  //   service.LMSFinish()
  //   expect(service['_isInitialized']()).toBe(false)
  // })

  // it('should get value properly', () => {
  //   service.LMSInitialize()
  //   service.LMSSetValue('key', 'value')
  //   expect(service.LMSGetValue('key')).toEqual('value')
  // })

  // it('should set value properly', () => {
  //   service.LMSInitialize()
  //   service.LMSSetValue('key', 'value')
  //   expect(service.LMSGetValue('key')).toEqual('value')
  // })

  // it('should commit data properly', () => {
  //   service.LMSInitialize()
  //   service.LMSSetValue('key', 'value')
  //   expect(service.LMSCommit()).toBe(true)
  // })

  // it('should get last error properly', () => {
  //   service
  //   expect(service.LMSGetLastError()).toEqual(404)
  // })

  it('should get error string properly', () => {
    expect(service.LMSGetErrorString(404)).toEqual('')
  })

  it('should get diagnostic properly', () => {
    expect(service.LMSGetDiagnostic(404)).toEqual('')
  })

  // it('should handle error when not initialized', () => {
  //   expect(service.LMSGetValue('key')).toEqual(false)
  // })

  // it('should handle error when setting value and not initialized', () => {
  //   expect(service.LMSSetValue('key', 'value')).toEqual(false)
  // })

  // it('should handle error when committing and not initialized', () => {
  //   expect(service.LMSCommit()).toEqual(false)
  // })

  // it('should handle error when finishing and not initialized', () => {
  //   expect(service.LMSFinish()).toEqual(false)
  // })

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
