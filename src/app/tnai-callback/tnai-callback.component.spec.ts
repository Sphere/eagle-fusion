jest.mock('project/ws/app/src/lib/routes/org/org-service.service', () => ({
  OrgServiceService: class {
    setTnaiToken = jest.fn()
  },
}))

jest.mock('library/ws-widget/utils/src/lib/services/auth-keycloak.service', () => ({
  AuthKeycloakService: class {
    logout = jest.fn()
  },
}))

jest.mock('@ws-widget/utils', () => ({
  LoggerService: class {
    log = jest.fn()
  },
}))

import { of, throwError } from 'rxjs'
import { TnaiCallbackComponent } from './tnai-callback.component'

describe('TnaiCallbackComponent', () => {
  let component: TnaiCallbackComponent
  let mockOrgService: any
  let mockAuthSvc: any
  let mockLogger: any

  beforeEach(() => {
    jest.useFakeTimers()
    mockOrgService = {
      setTnaiToken: jest.fn().mockReturnValue(of({ resRedirectUrl: 'https://tnai.example.com' })),
    }
    mockAuthSvc = { logout: jest.fn() }
    mockLogger = { log: jest.fn() }
    component = new TnaiCallbackComponent(mockOrgService, mockAuthSvc, mockLogger)
    sessionStorage.clear()
  })

  afterEach(() => {
    jest.useRealTimers()
    sessionStorage.clear()
    jest.clearAllMocks()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should default isLoading to false', () => {
    expect(component.isLoading).toBe(false)
  })

  it('should not call setTnaiToken when no token in sessionStorage', () => {
    component.ngOnInit()
    jest.runAllTimers()
    expect(mockOrgService.setTnaiToken).not.toHaveBeenCalled()
  })

  it('should set isLoading true and call setTnaiToken when token present', () => {
    sessionStorage.setItem('tnai_token', 'tnai-tok')
    component.ngOnInit()
    expect(component.isLoading).toBe(true)
    jest.runAllTimers()
    expect(mockOrgService.setTnaiToken).toHaveBeenCalledWith({ token: 'tnai-tok' })
  })

  it('should set isLoading false after successful API call', async () => {
    sessionStorage.setItem('tnai_token', 'tnai-tok')
    component.ngOnInit()
    jest.runAllTimers()
    // flush microtask from `await res.resRedirectUrl` inside async subscribe callback
    await Promise.resolve()
    expect(component.isLoading).toBe(false)
  })

  it('should set isLoading false on 400 error', () => {
    sessionStorage.setItem('tnai_token', 'tnai-tok')
    mockOrgService.setTnaiToken.mockReturnValue(throwError(() => ({ status: 400 })))
    component.ngOnInit()
    jest.runAllTimers()
    expect(component.isLoading).toBe(false)
  })

  it('should set isLoading false on 419 error', () => {
    sessionStorage.setItem('tnai_token', 'tnai-tok')
    mockOrgService.setTnaiToken.mockReturnValue(throwError(() => ({ status: 419 })))
    component.ngOnInit()
    jest.runAllTimers()
    expect(component.isLoading).toBe(false)
  })

  it('should set isLoading false on 404 error', () => {
    sessionStorage.setItem('tnai_token', 'tnai-tok')
    mockOrgService.setTnaiToken.mockReturnValue(throwError(() => ({ status: 404 })))
    component.ngOnInit()
    jest.runAllTimers()
    expect(component.isLoading).toBe(false)
  })
})
