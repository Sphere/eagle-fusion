jest.mock('project/ws/app/src/lib/routes/org/org-service.service', () => ({
  OrgServiceService: class {
    setSashaktId = jest.fn()
  },
}))

jest.mock('library/ws-widget/utils/src/lib/services/auth-keycloak.service', () => ({
  AuthKeycloakService: class {
    logout = jest.fn()
  },
}))

jest.mock('../../../library/ws-widget/utils/src/public-api', () => ({
  LoggerService: class {
    log = jest.fn()
  },
}))

import { of, throwError } from 'rxjs'
import { SashaktCallbackComponent } from './sashakt-callback.component'

describe('SashaktCallbackComponent', () => {
  let component: SashaktCallbackComponent
  let mockOrgService: any
  let mockAuthSvc: any
  let mockLogger: any

  beforeEach(() => {
    jest.useFakeTimers()
    mockOrgService = {
      setSashaktId: jest.fn().mockReturnValue(of({ resRedirectUrl: 'https://sashakt.example.com' })),
    }
    mockAuthSvc = { logout: jest.fn() }
    mockLogger = { log: jest.fn() }
    component = new SashaktCallbackComponent(mockOrgService, mockAuthSvc, mockLogger)
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

  it('should not call setSashaktId when both tokens are absent', () => {
    component.ngOnInit()
    jest.runAllTimers()
    expect(mockOrgService.setSashaktId).not.toHaveBeenCalled()
  })

  it('should not start callback when only sashakt_token is present', () => {
    sessionStorage.setItem('sashakt_token', 'tok')
    component.ngOnInit()
    expect(component.isLoading).toBe(false)
    expect(mockOrgService.setSashaktId).not.toHaveBeenCalled()
  })

  it('should set isLoading true and call setSashaktId with both tokens', () => {
    sessionStorage.setItem('sashakt_token', 'tok1')
    sessionStorage.setItem('sashakt_moduleId', 'mod1')
    component.ngOnInit()
    expect(component.isLoading).toBe(true)
    jest.runAllTimers()
    expect(mockOrgService.setSashaktId).toHaveBeenCalledWith('tok1', 'mod1')
  })

  it('should redirect window.location to resRedirectUrl on success', () => {
    const originalLocation = window.location
    delete (window as any).location
    ;(window as any).location = null

    sessionStorage.setItem('sashakt_token', 'tok1')
    sessionStorage.setItem('sashakt_moduleId', 'mod1')
    component.ngOnInit()
    jest.runAllTimers()

    expect(window.location).toBe('https://sashakt.example.com')
    ;(window as any).location = originalLocation
  })

  it('should call authSvc.logout on 400 error', () => {
    sessionStorage.setItem('sashakt_token', 'tok1')
    sessionStorage.setItem('sashakt_moduleId', 'mod1')
    mockOrgService.setSashaktId.mockReturnValue(throwError(() => ({ status: 400 })))
    component.ngOnInit()
    jest.runAllTimers()
    expect(mockAuthSvc.logout).toHaveBeenCalled()
  })

  it('should call authSvc.logout on 419 error', () => {
    sessionStorage.setItem('sashakt_token', 'tok1')
    sessionStorage.setItem('sashakt_moduleId', 'mod1')
    mockOrgService.setSashaktId.mockReturnValue(throwError(() => ({ status: 419 })))
    component.ngOnInit()
    jest.runAllTimers()
    expect(mockAuthSvc.logout).toHaveBeenCalled()
  })
})
