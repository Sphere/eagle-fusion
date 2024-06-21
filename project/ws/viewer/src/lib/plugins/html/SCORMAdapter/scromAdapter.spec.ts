import { SCORMAdapterService } from './scormAdapter'
import { TestBed } from '@angular/core/testing'
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing'
import { ActivatedRoute, Router } from '@angular/router'
import { ConfigurationsService, TelemetryService } from '../../../../../../../../library/ws-widget/utils/src/public-api'
import { ViewerDataService } from 'project/ws/viewer/src/lib/viewer-data.service'
import { WidgetContentService } from '@ws-widget/collection'
import { IndexedDBService } from 'src/app/online-indexed-db.service'

describe('SCORMAdapterService', () => {
  let service: SCORMAdapterService
  let httpMock: HttpTestingController

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        SCORMAdapterService,
        { provide: ActivatedRoute, useValue: {} },
        { provide: Router, useValue: {} },
        { provide: ConfigurationsService, useValue: {} },
        { provide: ViewerDataService, useValue: {} },
        { provide: WidgetContentService, useValue: {} },
        { provide: TelemetryService, useValue: {} },
        { provide: IndexedDBService, useValue: {} },
      ],
    })
    service = TestBed.get(SCORMAdapterService)
    httpMock = TestBed.get(HttpTestingController)
  })

  afterEach(() => {
    httpMock.verify()
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  it('should initialize LMS', () => {
    expect(service.LMSInitialize()).toBeTruthy()
  })



  it('should get value from LMS', () => {
    service.LMSInitialize()
    const element = 'cmi.core.exit'
    const result = service.LMSGetValue(element)
    expect(result).toBe('')
  })

  it('should set value in LMS', () => {
    service.LMSInitialize()
    const element = 'cmi.core.exit'
    const value = 'suspend'
    const result = service.LMSSetValue(element, value)
    expect(result).toBe(value)
  })

  it('should get last error from LMS', () => {
    const result = service.LMSGetLastError()
    expect(result).toBe('')
  })

  it('should get error string from LMS', () => {
    const errorCode = 101
    const result = service.LMSGetErrorString(errorCode)
    expect(result).toBe('')
  })

  it('should get diagnostic from LMS', () => {
    const errorCode = 101
    const result = service.LMSGetDiagnostic(errorCode)
    expect(result).toBe('')
  })



})
