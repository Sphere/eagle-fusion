jest.mock('../../../../../project/ws/app/src/lib/routes/org/org-service.service', () => ({
  OrgServiceService: class {
    setConnectSid = jest.fn()
  },
}))

jest.mock('src/app/routes/signup/signup.service', () => ({
  SignupService: class {
    fetchStartUpDetails = jest.fn()
  },
}))

jest.mock('library/ws-widget/utils/src/lib/services/auth-keycloak.service', () => ({
  AuthKeycloakService: class {
    logout = jest.fn()
  },
}))

jest.mock('../../../../../library/ws-widget/utils/src/public-api', () => ({
  LoggerService: class {
    log = jest.fn()
  },
}))

import { of, throwError } from 'rxjs'
import { KeycloakCallbackComponent } from './keycloak-callback.component'

describe('KeycloakCallbackComponent', () => {
  let component: KeycloakCallbackComponent
  let mockOrgService: any
  let mockSnackBar: any
  let mockSignupService: any
  let mockAuthSvc: any
  let mockLogger: any

  beforeEach(() => {
    jest.useFakeTimers()
    mockOrgService = { setConnectSid: jest.fn().mockReturnValue(of({ success: true })) }
    mockSnackBar = { open: jest.fn() }
    mockSignupService = {
      fetchStartUpDetails: jest.fn().mockResolvedValue({ status: 200, language: 'en' }),
    }
    mockAuthSvc = { logout: jest.fn() }
    mockLogger = { log: jest.fn() }
    component = new KeycloakCallbackComponent(
      mockOrgService,
      mockSnackBar,
      mockSignupService,
      mockAuthSvc,
      mockLogger,
    )
    sessionStorage.clear()
    localStorage.clear()
  })

  afterEach(() => {
    jest.useRealTimers()
    sessionStorage.clear()
    localStorage.clear()
    jest.clearAllMocks()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should default isLoading to false', () => {
    expect(component.isLoading).toBe(false)
  })

  it('should fetch startup details when no login-btn and no code', () => {
    component.ngOnInit()
    expect(mockSignupService.fetchStartUpDetails).toHaveBeenCalled()
    expect(mockOrgService.setConnectSid).not.toHaveBeenCalled()
  })

  it('should set isLoading true and check callback when login-btn is clicked', () => {
    sessionStorage.setItem('login-btn', 'clicked')
    component.ngOnInit()
    expect(component.isLoading).toBe(true)
  })

  it('should set isLoading true when code is in sessionStorage', () => {
    sessionStorage.setItem('code', 'auth-code-123')
    component.ngOnInit()
    expect(component.isLoading).toBe(true)
  })

  it('should not call setConnectSid when code is null in checkKeycloakCallback', () => {
    component.checkKeycloakCallback()
    expect(mockOrgService.setConnectSid).not.toHaveBeenCalled()
  })

  it('should call setConnectSid with code from sessionStorage', () => {
    sessionStorage.setItem('code', 'my-code')
    component.checkKeycloakCallback()
    expect(mockOrgService.setConnectSid).toHaveBeenCalledWith('my-code')
  })

  it('should remove code from sessionStorage on successful setConnectSid', () => {
    sessionStorage.setItem('code', 'my-code')
    component.checkKeycloakCallback()
    expect(sessionStorage.getItem('code')).toBeNull()
  })

  it('should call authSvc.logout on 400 error from setConnectSid', () => {
    sessionStorage.setItem('code', 'my-code')
    mockOrgService.setConnectSid.mockReturnValue(throwError(() => ({ status: 400 })))
    component.checkKeycloakCallback()
    expect(mockAuthSvc.logout).toHaveBeenCalled()
  })

  it('should call authSvc.logout on 419 from fetchStartUpDetails', async () => {
    sessionStorage.setItem('code', 'my-code')
    mockSignupService.fetchStartUpDetails.mockResolvedValue({
      status: 419,
      params: { errmsg: 'Session expired' },
    })
    component.checkKeycloakCallback()
    jest.runAllTimers()
    await Promise.resolve()
    expect(mockAuthSvc.logout).toHaveBeenCalled()
  })

  it('should not remove code when setConnectSid emits a falsy response', () => {
    sessionStorage.setItem('code', 'my-code')
    mockOrgService.setConnectSid.mockReturnValue(of(null))
    component.checkKeycloakCallback()
    expect(sessionStorage.getItem('code')).toBe('my-code')
  })

  it('should log but not logout on non-400 error from setConnectSid', () => {
    sessionStorage.setItem('code', 'my-code')
    mockOrgService.setConnectSid.mockReturnValue(throwError(() => ({ status: 500 })))
    component.checkKeycloakCallback()
    expect(mockLogger.log).toHaveBeenCalled()
    expect(mockAuthSvc.logout).not.toHaveBeenCalled()
  })

  it('should log and logout when setConnectSid throws synchronously', () => {
    sessionStorage.setItem('code', 'my-code')
    mockOrgService.setConnectSid.mockImplementation(() => { throw new Error('boom') })
    component.checkKeycloakCallback()
    expect(mockLogger.log).toHaveBeenCalledWith(expect.any(Error))
    expect(mockAuthSvc.logout).toHaveBeenCalled()
  })

  describe('checkKeycloakCallback success redirect flows', () => {
    let originalLocation: any

    beforeEach(() => {
      originalLocation = window.location
      delete (window as any).location
      ;(window as any).location = { href: '' }
    })

    afterEach(() => {
      ;(window as any).location = originalLocation
    })

    const runCallbackAndFlush = async () => {
      component.checkKeycloakCallback()
      jest.runAllTimers()
      await Promise.resolve()
    }

    it('should store lang1 and redirect to url_before_login when language is present', async () => {
      sessionStorage.setItem('code', 'my-code')
      localStorage.setItem('url_before_login', '/app/toc/do_1/overview')
      mockSignupService.fetchStartUpDetails.mockResolvedValue({ status: 200, language: 'hi' })
      await runCallbackAndFlush()
      expect(JSON.parse(sessionStorage.getItem('lang1') || '{}').lang).toBe('hi')
      expect((window as any).location.href).toBe('/app/toc/do_1/overview')
      expect(component.isLoading).toBe(false)
    })

    it('should redirect to /page/home when language is present and no url_before_login', async () => {
      sessionStorage.setItem('code', 'my-code')
      mockSignupService.fetchStartUpDetails.mockResolvedValue({ status: 200, language: 'en' })
      await runCallbackAndFlush()
      expect((window as any).location.href).toBe('/page/home')
    })

    it('should store lang2 from preferedLanguage when response has no language', async () => {
      sessionStorage.setItem('code', 'my-code')
      localStorage.setItem('preferedLanguage', JSON.stringify({ id: 'hi' }))
      mockSignupService.fetchStartUpDetails.mockResolvedValue({ status: 200 })
      await runCallbackAndFlush()
      expect(JSON.parse(sessionStorage.getItem('lang2') || '{}').lang).toBe('hi')
      expect((window as any).location.href).toBe('/page/home')
    })

    it('should redirect to url_before_login when no language and no preferedLanguage', async () => {
      sessionStorage.setItem('code', 'my-code')
      localStorage.setItem('url_before_login', '/app/profile')
      mockSignupService.fetchStartUpDetails.mockResolvedValue({ status: 200 })
      await runCallbackAndFlush()
      expect((window as any).location.href).toBe('/app/profile')
    })

    it('should redirect to /page/home when no language, preferedLanguage or url_before_login', async () => {
      sessionStorage.setItem('code', 'my-code')
      mockSignupService.fetchStartUpDetails.mockResolvedValue({ status: 200 })
      await runCallbackAndFlush()
      expect((window as any).location.href).toBe('/page/home')
    })
  })
})
