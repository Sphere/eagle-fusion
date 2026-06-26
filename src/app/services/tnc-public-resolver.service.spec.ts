jest.mock('@ws-widget/utils', () => ({
  ConfigurationsService: class { unMappedUser = null },
}))

jest.mock('../models/tnc.model', () => ({}))

jest.mock('../constants/apiConstants', () => ({
  API_END_POINTS: {
    ASSIGN_ADMIN_TO_CREATED_DEPARTMENT: '/apis/assign-admin',
    USER_SIGNUP_NEW: '/apis/signup',
    REGISTERUSERWITHMOBILE: '/apis/register-mobile',
    VERIFY_OTP: '/apis/verify-otp',
  },
}))

jest.mock('./language.service', () => ({
  LanguageService: class { getCurrentLanguage = jest.fn().mockReturnValue('en') },
}))

import { of, throwError } from 'rxjs'
import { TncPublicResolverService } from './tnc-public-resolver.service'
import { ConfigurationsService } from '@ws-widget/utils'
import { LanguageService } from './language.service'

describe('TncPublicResolverService', () => {
  let service: TncPublicResolverService
  let mockHttp: any
  let mockConfigSvc: any
  let mockLangSvc: any

  beforeEach(() => {
    mockHttp = {
      get: jest.fn().mockReturnValue(of({ version: '1.0', terms: [] })),
      post: jest.fn().mockReturnValue(of({ success: true })),
    }
    mockConfigSvc = new ConfigurationsService()
    mockLangSvc = new LanguageService()
    service = new TncPublicResolverService(mockHttp, mockConfigSvc, mockLangSvc as any)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should create', () => {
    expect(service).toBeTruthy()
  })

  it('getPublicTnc uses English TNC URL by default', () => {
    service.getPublicTnc().subscribe()
    expect(mockHttp.get).toHaveBeenCalledWith('/fusion-assets/files/tnc.config.json')
  })

  it('getPublicTnc uses Hindi TNC URL when language is hi', () => {
    mockLangSvc.getCurrentLanguage.mockReturnValue('hi')
    service.getPublicTnc().subscribe()
    expect(mockHttp.get).toHaveBeenCalledWith('/fusion-assets/files/tnc.config.hi.json')
  })

  it('getPublicTnc uses Hindi URL from user preferences', () => {
    mockConfigSvc.unMappedUser = { profileDetails: { preferences: { language: 'hi' } } }
    service.getPublicTnc().subscribe()
    expect(mockHttp.get).toHaveBeenCalledWith('/fusion-assets/files/tnc.config.hi.json')
  })

  it('resolve returns wrapped data on success', (done) => {
    service.resolve().subscribe(res => {
      expect((res as any).data).toBeDefined()
      expect((res as any).error).toBeNull()
      done()
    })
  })

  it('resolve wraps error on failure', (done) => {
    mockHttp.get.mockReturnValue(throwError(() => new Error('fail')))
    service.resolve().subscribe(res => {
      expect((res as any).data).toBeNull()
      done()
    })
  })

  it('signup calls http.post with USER_SIGNUP_NEW endpoint', (done) => {
    service.signup({ email: 'test@test.com' }).subscribe(() => {
      expect(mockHttp.post).toHaveBeenCalledWith('/apis/signup', expect.any(Object))
      done()
    })
  })

  it('registerWithMobile calls http.post', (done) => {
    service.registerWithMobile({ mobile: '9999999999' }).subscribe(() => {
      expect(mockHttp.post).toHaveBeenCalledWith('/apis/register-mobile', expect.any(Object))
      done()
    })
  })

  it('assignAdminToDepartment calls http.post with ASSIGN_ADMIN endpoint', (done) => {
    service.assignAdminToDepartment({ admin: 'u-1' }).subscribe(() => {
      expect(mockHttp.post).toHaveBeenCalledWith('/apis/assign-admin', expect.any(Object))
      done()
    })
  })

  it('verifyUserMobile calls http.post with VERIFY_OTP endpoint and passes through response', (done) => {
    service.verifyUserMobile({ otp: '1234' }).subscribe(res => {
      expect(mockHttp.post).toHaveBeenCalledWith('/apis/verify-otp', expect.any(Object))
      expect(res).toEqual({ success: true })
      done()
    })
  })
})
