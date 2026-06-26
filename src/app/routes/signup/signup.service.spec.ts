jest.mock('../../../../library/ws-widget/utils/src/lib/services/configurations.service', () => ({
  ConfigurationsService: class {
    unMappedUser = undefined
    userProfile = null
    instanceConfig = null
    userRoles = new Set()
    userGroups = new Set()
    hasAcceptedTnc = false
    profileDetailsStatus = false
    isActive = true
    nodebbUserProfile = null
    orgSelectiveCourseConfig = null
  },
}))

jest.mock('../../../../library/ws-widget/utils/src/public-api', () => ({
  LoggerService: class { log = jest.fn(); warn = jest.fn(); error = jest.fn() },
}))

jest.mock('../../services/user-data-cache.service', () => ({
  UserDataCacheService: class { getUserData = jest.fn(); setUserData = jest.fn() },
}))

jest.mock('../../constants/apiConstants', () => ({
  API_END_POINTS: {
    validateOTP: '/api/otp/validate',
    validateOrgOTP: '/api/org/otp/validate',
    sendUserOTP: '/api/otp/send',
    resendOTP: '/api/otp/resend',
    newLogin: '/api/login',
    newssowithMobileEmail: '/api/sso/mobile-email',
    newssowithMobileEmailOrgForm: '/api/sso/org-form',
    SIGNUP: '/api/signup',
    REGISTER_USERWITH_MOBILE: '/api/register/mobile',
    VERIFY_FPW_OTP: '/api/fpw/otp/verify',
    GENERATE_OTP: '/api/otp/generate',
    VALIDATE_OTP: '/api/otp/validate2',
    RESET_FPW_PASSWORD: '/api/fpw/reset',
    SET_FPW_OTP: '/api/fpw/otp/set',
  },
  S3_END_POINTS: { ORG_SELECTIVE_COURSE: '/s3/org-selective' },
}))

import { of } from 'rxjs'
import { SignupService } from './signup.service'
import { ConfigurationsService } from '../../../../library/ws-widget/utils/src/lib/services/configurations.service'
import { UserDataCacheService } from '../../services/user-data-cache.service'

describe('SignupService', () => {
  let service: SignupService
  let mockHttp: any
  let mockConfigSvc: any
  let mockUserDataCacheSvc: any
  let mockLogger: any
  let mockRouter: any

  beforeEach(() => {
    mockHttp = {
      post: jest.fn().mockReturnValue(of({ result: 'ok' })),
      get: jest.fn().mockReturnValue(of({})),
    }
    mockConfigSvc = new ConfigurationsService()
    mockUserDataCacheSvc = new UserDataCacheService()
    mockLogger = { log: jest.fn(), warn: jest.fn(), error: jest.fn() }
    mockRouter = { navigateByUrl: jest.fn() }
    service = new SignupService(mockHttp, mockConfigSvc, mockUserDataCacheSvc, mockLogger, mockRouter)
  })

  afterEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  it('should create', () => {
    expect(service).toBeTruthy()
  })

  describe('hasRole', () => {
    it('returns true when PUBLIC is in roles', () => {
      expect(service.hasRole(['PUBLIC'])).toBe(true)
    })

    it('returns false when PUBLIC is not in roles', () => {
      expect(service.hasRole(['ADMIN', 'USER'])).toBe(false)
    })

    it('returns false for empty array', () => {
      expect(service.hasRole([])).toBe(false)
    })

    it('returns true when PUBLIC is among multiple roles', () => {
      expect(service.hasRole(['ADMIN', 'PUBLIC'])).toBe(true)
    })

    it('is case-sensitive — lowercase public is not matched', () => {
      expect(service.hasRole(['public'])).toBe(false)
    })
  })

  it('keyClockLogin navigates to /public/login', () => {
    service.keyClockLogin()
    expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/public/login')
  })

  it('ssoValidateOTP calls http.post with validateOTP endpoint', (done) => {
    const data = { otp: '123456' }
    service.ssoValidateOTP(data).subscribe(() => {
      expect(mockHttp.post).toHaveBeenCalledWith('/api/otp/validate', data)
      done()
    })
  })

  it('ssoValidateOrgOTP calls http.post with validateOrgOTP endpoint', (done) => {
    const data = { otp: '654321' }
    service.ssoValidateOrgOTP(data).subscribe(() => {
      expect(mockHttp.post).toHaveBeenCalledWith('/api/org/otp/validate', data)
      done()
    })
  })

  it('sendOTP calls http.post with sendUserOTP endpoint', (done) => {
    const data = { mobile: '9999999999' }
    service.sendOTP(data).subscribe(() => {
      expect(mockHttp.post).toHaveBeenCalledWith('/api/otp/send', data)
      done()
    })
  })

  it('resendOTP calls http.post with resendOTP endpoint', (done) => {
    const data = { mobile: '9999999999' }
    service.resendOTP(data).subscribe(() => {
      expect(mockHttp.post).toHaveBeenCalledWith('/api/otp/resend', data)
      done()
    })
  })

  it('signup calls http.post with SIGNUP endpoint', (done) => {
    const data = { name: 'Test User' }
    service.signup(data).subscribe(() => {
      expect(mockHttp.post).toHaveBeenCalledWith('/api/signup', data)
      done()
    })
  })

  it('registerWithMobile calls http.post with REGISTER_USERWITH_MOBILE endpoint', (done) => {
    const data = { mobile: '8888888888' }
    service.registerWithMobile(data).subscribe(() => {
      expect(mockHttp.post).toHaveBeenCalledWith('/api/register/mobile', data)
      done()
    })
  })

  it('forgotPassword calls http.post with RESET_FPW_PASSWORD endpoint', (done) => {
    const req = { email: 'test@example.com' }
    service.forgotPassword(req).subscribe(() => {
      expect(mockHttp.post).toHaveBeenCalledWith('/api/fpw/reset', req)
      done()
    })
  })

  it('setPasswordWithOtp calls http.post with SET_FPW_OTP endpoint', (done) => {
    const req = { otp: '111222', newPassword: 'newPass' }
    service.setPasswordWithOtp(req).subscribe(() => {
      expect(mockHttp.post).toHaveBeenCalledWith('/api/fpw/otp/set', req)
      done()
    })
  })

  describe('generateOtp', () => {
    it('returns same observable on second call (caches via share)', () => {
      const data = { mobile: '1234567890' }
      const obs1 = service.generateOtp(data)
      const obs2 = service.generateOtp(data)
      expect(obs1).toBe(obs2)
    })

    it('calls http.post with GENERATE_OTP on first call', (done) => {
      const data = { mobile: '1234567890' }
      service.generateOtp(data).subscribe(() => {
        expect(mockHttp.post).toHaveBeenCalledWith('/api/otp/generate', data)
        done()
      })
    })
  })
})
