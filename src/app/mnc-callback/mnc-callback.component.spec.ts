jest.mock('project/ws/app/src/lib/routes/org/org-service.service', () => ({
  OrgServiceService: class {
    setMNCId = jest.fn()
  },
}))

jest.mock('../../../library/ws-widget/utils/src/public-api', () => ({
  LoggerService: class {
    log = jest.fn()
  },
}))

import { of, throwError } from 'rxjs'
import { MNCCallbackComponent } from './mnc-callback.component'

describe('MNCCallbackComponent', () => {
  let component: MNCCallbackComponent
  let mockOrgService: any
  let mockLogger: any

  beforeEach(() => {
    mockOrgService = { setMNCId: jest.fn().mockReturnValue(of({ message: 'success' })) }
    mockLogger = { log: jest.fn() }
    component = new MNCCallbackComponent(mockOrgService, mockLogger)
    sessionStorage.clear()
  })

  afterEach(() => {
    sessionStorage.clear()
    jest.clearAllMocks()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should default isLoading to false', () => {
    expect(component.isLoading).toBe(false)
  })

  it('should not call setMNCId when no token anywhere', () => {
    component.ngOnInit()
    expect(mockOrgService.setMNCId).not.toHaveBeenCalled()
    expect(component.isLoading).toBe(false)
  })

  it('should use sessionStorage token when URL has no token param', () => {
    sessionStorage.setItem('mnc_userToken', 'session-token')
    component.ngOnInit()
    expect(mockOrgService.setMNCId).toHaveBeenCalledWith({ userToken: 'session-token' })
  })

  it('should set isLoading true when token is present', () => {
    sessionStorage.setItem('mnc_userToken', 'tok')
    component.ngOnInit()
    expect(component.isLoading).toBe(true)
  })

  it('should redirect to org-details on success', () => {
    sessionStorage.setItem('mnc_userToken', 'tok')
    const originalLocation = window.location
    delete (window as any).location
    ;(window as any).location = { href: '' }

    component.ngOnInit()

    expect(window.location.href).toBe(
      '/app/org-details?orgId=Maharashtra%20Nursing%20Council',
    )
    ;(window as any).location = originalLocation
  })

  it('should set isLoading false and store error in sessionStorage on API error', () => {
    sessionStorage.setItem('mnc_userToken', 'tok')
    const errMsg = 'Token invalid'
    mockOrgService.setMNCId.mockReturnValue(
      throwError(() => ({ error: { message: errMsg } })),
    )
    const originalLocation = window.location
    delete (window as any).location
    ;(window as any).location = { href: '' }

    component.ngOnInit()

    expect(component.isLoading).toBe(false)
    expect(sessionStorage.getItem('mnc_error')).toBe(errMsg)
    expect(window.location.href).toBe('/public/home')
    ;(window as any).location = originalLocation
  })

  it('should use fallback error message when err.error.message is absent', () => {
    sessionStorage.setItem('mnc_userToken', 'tok')
    mockOrgService.setMNCId.mockReturnValue(throwError(() => ({ status: 500 })))
    const originalLocation = window.location
    delete (window as any).location
    ;(window as any).location = { href: '' }

    component.ngOnInit()

    expect(sessionStorage.getItem('mnc_error')).toContain('Something went wrong')
    ;(window as any).location = originalLocation
  })
})
