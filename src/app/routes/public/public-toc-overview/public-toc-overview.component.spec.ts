jest.mock('@ws-widget/collection', () => ({
  WidgetContentService: class {
    fetchConfig = jest.fn()
  },
}))

import { of, BehaviorSubject, throwError } from 'rxjs'
import { PublicTocOverviewComponent } from './public-toc-overview.component'

describe('PublicTocOverviewComponent', () => {
  let component: PublicTocOverviewComponent
  let mockHttp: any
  let mockRoute: any
  let mockWidgetContentSvc: any
  let mockCdr: any
  let queryParamsSubject: BehaviorSubject<any>

  const tocJson = { sections: [] }
  const licenseData = {
    licenses: [
      { licenseName: 'CC BY', url: 'https://creativecommons.org/licenses/by/4.0/' },
    ],
  }

  beforeEach(() => {
    queryParamsSubject = new BehaviorSubject({ license: 'CC BY' })
    mockHttp = {
      get: jest.fn().mockReturnValue(of(tocJson)),
    }
    mockRoute = {
      queryParams: queryParamsSubject.asObservable(),
    }
    mockWidgetContentSvc = {
      fetchConfig: jest.fn().mockReturnValue(of(licenseData)),
    }
    mockCdr = { markForCheck: jest.fn() }
    component = new PublicTocOverviewComponent(
      mockHttp,
      mockRoute,
      mockWidgetContentSvc,
      mockCdr,
      'browser',
    )
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
    component.unsubscribe.next()
    component.unsubscribe.complete()
    jest.clearAllMocks()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should default license to "CC BY"', () => {
    expect(component.license).toBe('CC BY')
  })

  it('should default content to undefined', () => {
    expect(component.content).toBeUndefined()
  })

  it('should use tocData input when provided', () => {
    component.tocData = { identifier: 'course-1', name: 'Test Course' }
    component.ngOnInit()
    expect(component.content).toEqual({ identifier: 'course-1', name: 'Test Course' })
  })

  it('should read content from localStorage tocData when running in browser', () => {
    const tocContent = { identifier: 'course-local', name: 'Local Course' }
    localStorage.setItem('tocData', JSON.stringify(tocContent))
    component.ngOnInit()
    expect(component.content).toEqual(tocContent)
  })

  it('should call fetchTocConfig on ngOnInit', () => {
    component.ngOnInit()
    expect(mockHttp.get).toHaveBeenCalledWith('fusion-assets/files/toc.json')
  })

  it('should set tocConfig from http response', () => {
    component.ngOnInit()
    expect(component.tocConfig).toEqual(tocJson)
  })

  it('should set licenseName from queryParam', () => {
    component.ngOnInit()
    expect(component.licenseName).toBe('CC BY')
  })

  it('should set currentLicenseData matching licenseName', () => {
    component.ngOnInit()
    expect(component.currentLicenseData).toHaveLength(1)
    expect(component.currentLicenseData[0].licenseName).toBe('CC BY')
  })

  it('should call markForCheck after getLicenseConfig', () => {
    component.ngOnInit()
    expect(mockCdr.markForCheck).toHaveBeenCalled()
  })

  it('should complete unsubscribe on ngOnDestroy', () => {
    const spy = jest.spyOn(component.unsubscribe, 'next')
    component.ngOnDestroy()
    expect(spy).toHaveBeenCalled()
  })

  it('getLicenseConfig error callback calls getLicenseConfig again on 404', () => {
    const { HttpErrorResponse } = require('@angular/common/http')
    mockWidgetContentSvc.fetchConfig = jest.fn()
      .mockReturnValueOnce(throwError(() => new HttpErrorResponse({ status: 404 })))
      .mockReturnValue(of(licenseData))
    component.getLicenseConfig()
    expect(mockWidgetContentSvc.fetchConfig).toHaveBeenCalledTimes(2)
    expect(mockCdr.markForCheck).toHaveBeenCalled()
  })
})
