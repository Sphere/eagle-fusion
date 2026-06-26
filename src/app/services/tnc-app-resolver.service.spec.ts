jest.mock('@ws-widget/utils', () => ({
  ConfigurationsService: class { userPreference = null },
}))

jest.mock('../models/tnc.model', () => ({}))

jest.mock('../constants/apiConstants', () => ({
  API_END_POINTS: { USER_TNC: '/apis/user/tnc' },
}))

import { of, throwError } from 'rxjs'
import { TncAppResolverService } from './tnc-app-resolver.service'
import { ConfigurationsService } from '@ws-widget/utils'

describe('TncAppResolverService', () => {
  let service: TncAppResolverService
  let mockHttp: any
  let mockConfigSvc: any

  beforeEach(() => {
    mockHttp = { get: jest.fn().mockReturnValue(of({ version: '1.0', terms: [] })) }
    mockConfigSvc = new ConfigurationsService()
    service = new TncAppResolverService(mockHttp, mockConfigSvc)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should create', () => {
    expect(service).toBeTruthy()
  })

  it('getTnc calls http.get with USER_TNC endpoint', () => {
    service.getTnc().subscribe()
    expect(mockHttp.get).toHaveBeenCalledWith('/apis/user/tnc')
  })

  it('getTnc appends locale query param when provided', () => {
    service.getTnc('hi').subscribe()
    expect(mockHttp.get).toHaveBeenCalledWith('/apis/user/tnc?locale=hi')
  })

  it('getTnc does not append locale when not provided', () => {
    service.getTnc().subscribe()
    expect(mockHttp.get).not.toHaveBeenCalledWith(expect.stringContaining('?locale'))
  })

  it('resolve returns wrapped data on success', (done) => {
    service.resolve().subscribe(res => {
      expect((res as any).data).toEqual({ version: '1.0', terms: [] })
      expect((res as any).error).toBeNull()
      done()
    })
  })

  it('resolve wraps error on HTTP failure', (done) => {
    mockHttp.get.mockReturnValue(throwError(() => new Error('Network error')))
    service.resolve().subscribe(res => {
      expect((res as any).data).toBeNull()
      expect((res as any).error).toBeDefined()
      done()
    })
  })

  it('resolve uses locale from userPreference when available', () => {
    mockConfigSvc.userPreference = { selectedLocale: 'hi' }
    service.resolve().subscribe()
    expect(mockHttp.get).toHaveBeenCalledWith('/apis/user/tnc?locale=hi')
  })
})
