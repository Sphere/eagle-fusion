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
})
