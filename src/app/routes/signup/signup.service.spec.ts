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

  it('loginAPI calls http.post with newLogin endpoint', (done) => {
    const data = { username: 'user', password: 'pass' }
    service.loginAPI(data).subscribe(() => {
      expect(mockHttp.post).toHaveBeenCalledWith('/api/login', data)
      done()
    })
  })

  it('ssoWithMobileEmail calls http.post with newssowithMobileEmail endpoint', (done) => {
    const data = { mobile: '9999999999' }
    service.ssoWithMobileEmail(data).subscribe(() => {
      expect(mockHttp.post).toHaveBeenCalledWith('/api/sso/mobile-email', data)
      done()
    })
  })

  it('ssoWithMobileEmailOrgForm calls http.post with newssowithMobileEmailOrgForm endpoint', (done) => {
    const data = { form: 'data' }
    service.ssoWithMobileEmailOrgForm(data).subscribe(() => {
      expect(mockHttp.post).toHaveBeenCalledWith('/api/sso/org-form', data)
      done()
    })
  })

  it('verifyUserMobile calls http.post with VERIFY_FPW_OTP endpoint', (done) => {
    const data = { otp: '123456', mobile: '9999999999' }
    service.verifyUserMobile(data).subscribe(() => {
      expect(mockHttp.post).toHaveBeenCalledWith('/api/fpw/otp/verify', data)
      done()
    })
  })

  it('validateOtp calls http.post with VALIDATE_OTP endpoint', (done) => {
    const data = { otp: '654321' }
    service.validateOtp(data).subscribe(() => {
      expect(mockHttp.post).toHaveBeenCalledWith('/api/otp/validate2', data)
      done()
    })
  })

  describe('getUserData', () => {
    it('returns userPidProfile and sets unMappedUser when unMappedUser is undefined', async () => {
      const profile = { userId: 'u1', roles: ['PUBLIC'] }
      mockUserDataCacheSvc.getUserData = jest.fn().mockReturnValue(of(profile))
      mockConfigSvc.unMappedUser = undefined
      const result = await service.getUserData()
      expect(result).toEqual(profile)
      expect(mockConfigSvc.unMappedUser).toEqual(profile)
    })

    it('returns error object on exception', async () => {
      mockUserDataCacheSvc.getUserData = jest.fn().mockReturnValue({
        toPromise: () => Promise.reject(new Error('network error')),
      })
      const result = await service.getUserData()
      expect(result).toBeInstanceOf(Error)
      expect(mockConfigSvc.userProfile).toBeNull()
    })
  })

  describe('plumb5SendEvent', () => {
    it('calls http.post with plumb5 EventDetails URL and returns response via map', (done) => {
      const data = { event: 'pageview' }
      mockHttp.post.mockReturnValue(of({ status: 'ok' }))
      service.plumb5SendEvent(data).subscribe((result: any) => {
        expect(result).toEqual({ status: 'ok' })
        expect(mockHttp.post).toHaveBeenCalledWith(
          expect.stringContaining('plumb5'),
          data,
        )
        done()
      })
    })
  })

  describe('plumb5SendForm', () => {
    it('calls http.post with plumb5 FormInfoDetails URL and returns response via map', (done) => {
      const data = { form: 'signup' }
      mockHttp.post.mockReturnValue(of({ status: 'form-saved' }))
      service.plumb5SendForm(data).subscribe((result: any) => {
        expect(result).toEqual({ status: 'form-saved' })
        expect(mockHttp.post).toHaveBeenCalledWith(
          expect.stringContaining('plumb5'),
          data,
        )
        done()
      })
    })
  })

  describe('fetchStartUpDetails', () => {
    it('returns default result when instanceConfig is null', async () => {
      mockConfigSvc.instanceConfig = null
      const result = await service.fetchStartUpDetails()
      expect(result.tncStatus).toBe(true)
      expect(result.isActive).toBe(true)
    })

    it('sets configSvc.userProfile when instanceConfig is set and role includes PUBLIC', async () => {
      const profile = {
        userId: 'u1',
        firstName: 'Test',
        lastName: 'User',
        userName: 'testuser',
        email: 'test@test.com',
        roles: ['PUBLIC'],
        rootOrgId: 'org1',
        channel: 'org1',
        thumbnail: null,
        isDeleted: false,
        profileDetails: { preferences: { language: 'en' }, mandatoryFieldsExists: true },
      }
      mockConfigSvc.instanceConfig = { someKey: true }
      mockUserDataCacheSvc.getUserData = jest.fn().mockReturnValue(of(profile))
      mockHttp.get = jest.fn().mockReturnValue(of(null))
      const result = await service.fetchStartUpDetails()
      expect(result.userId).toBe('u1')
      expect(mockConfigSvc.userProfile).not.toBeNull()
    })

    it('handles exception and sets userProfile null', async () => {
      mockConfigSvc.instanceConfig = { someKey: true }
      mockUserDataCacheSvc.getUserData = jest.fn().mockReturnValue({
        toPromise: () => Promise.reject(new Error('fail')),
      })
      const result = await service.fetchStartUpDetails()
      expect(mockConfigSvc.userProfile).toBeNull()
    })

    it('fetchOrgSelectiveConfig find callback matches rootOrgId', async () => {
      const profile = {
        userId: 'u1', firstName: 'Test', lastName: 'User', userName: 'testuser',
        email: 'test@test.com', roles: ['PUBLIC'], rootOrgId: 'org-match',
        channel: 'org1', thumbnail: null, isDeleted: false,
        profileDetails: { preferences: { language: 'en' }, mandatoryFieldsExists: true },
      }
      const orgData = {
        states: [{
          organisations: [
            { orgId: 'org-match', orgName: 'Apollo', redirectUrl: '/app/org' },
            { orgId: 'other-org', orgName: 'Other' },
          ],
        }],
      }
      mockConfigSvc.instanceConfig = { someKey: true }
      mockUserDataCacheSvc.getUserData = jest.fn().mockReturnValue(of(profile))
      mockHttp.get = jest.fn().mockReturnValue(of(orgData))
      await service.fetchStartUpDetails()
      expect(mockConfigSvc.orgSelectiveCourseConfig).toEqual({ orgId: 'org-match', orgName: 'Apollo', redirectUrl: '/app/org' })
    })

    it('fetchOrgSelectiveConfig find callback matches org URL param', async () => {
      const profile = {
        userId: 'u1', firstName: 'Test', lastName: 'User', userName: 'testuser',
        email: 'test@test.com', roles: ['PUBLIC'], rootOrgId: 'different-org',
        channel: 'org1', thumbnail: null, isDeleted: false,
        profileDetails: { preferences: { language: 'en' }, mandatoryFieldsExists: true },
      }
      const orgData = {
        states: [{
          organisations: [{ orgId: 'org-url', orgName: 'Apollo Hospital' }],
        }],
      }
      Object.defineProperty(window, 'location', {
        writable: true,
        value: { search: '?org=apollo+hospital', assign: jest.fn(), href: '', origin: 'http://localhost' },
      })
      mockConfigSvc.instanceConfig = { someKey: true }
      mockUserDataCacheSvc.getUserData = jest.fn().mockReturnValue(of(profile))
      mockHttp.get = jest.fn().mockReturnValue(of(orgData))
      await service.fetchStartUpDetails()
      expect(mockConfigSvc.orgSelectiveCourseConfig).toEqual({ orgId: 'org-url', orgName: 'Apollo Hospital' })
      Object.defineProperty(window, 'location', { writable: true, value: { search: '', href: '' } })
    })

    it('fetchOrgSelectiveConfig covers flatMap and map when no match found', async () => {
      const profile = {
        userId: 'u1', firstName: 'Test', lastName: 'User', userName: 'testuser',
        email: 'test@test.com', roles: ['PUBLIC'], rootOrgId: 'no-match-org',
        channel: 'org1', thumbnail: null, isDeleted: false,
        profileDetails: { preferences: { language: 'en' }, mandatoryFieldsExists: true },
      }
      const orgData = {
        states: [{
          organisations: [{ orgId: 'other-org', orgName: 'Other Org' }],
        }],
      }
      Object.defineProperty(window, 'location', { writable: true, value: { search: '', href: '' } })
      mockConfigSvc.instanceConfig = { someKey: true }
      mockUserDataCacheSvc.getUserData = jest.fn().mockReturnValue(of(profile))
      mockHttp.get = jest.fn().mockReturnValue(of(orgData))
      await service.fetchStartUpDetails()
      expect(mockLogger.warn).toHaveBeenCalledWith('No matching org found in org-selective-course.json')
    })
  })
})
