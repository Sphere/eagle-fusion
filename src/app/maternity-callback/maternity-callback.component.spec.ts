jest.mock('project/ws/app/src/lib/routes/org/org-service.service', () => ({
  OrgServiceService: class {
    setMaternyId = jest.fn()
  },
}))

jest.mock('../../../library/ws-widget/utils/src/public-api', () => ({
  LoggerService: class {
    log = jest.fn()
  },
}))

import { of, throwError } from 'rxjs'
import { MaternityCallbackComponent } from './maternity-callback.component'

describe('MaternityCallbackComponent', () => {
  let component: MaternityCallbackComponent
  let mockOrgService: any
  let mockLogger: any

  beforeEach(() => {
    mockOrgService = { setMaternyId: jest.fn().mockReturnValue(of({ message: 'success' })) }
    mockLogger = { log: jest.fn() }
    component = new MaternityCallbackComponent(mockOrgService, mockLogger)
    sessionStorage.clear()
    localStorage.clear()
  })

  afterEach(() => {
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

  it('should not call setMaternyId when no token in sessionStorage', () => {
    component.ngOnInit()
    expect(mockOrgService.setMaternyId).not.toHaveBeenCalled()
    expect(component.isLoading).toBe(false)
  })

  it('should set isLoading true and call setMaternyId when token is present', () => {
    sessionStorage.setItem('maternity_token', 'test-token')
    component.ngOnInit()
    expect(component.isLoading).toBe(true)
    expect(mockOrgService.setMaternyId).toHaveBeenCalledWith({ token: 'test-token' })
  })

  it('should store loc in localStorage on success', async () => {
    sessionStorage.setItem('maternity_token', 'token123')
    component.ngOnInit()
    // flush the microtask created by `await res` inside the async subscribe callback
    await Promise.resolve()
    expect(localStorage.getItem('loc')).toBe(JSON.stringify({ message: 'success' }))
  })

  it('should handle 400 error without throwing', () => {
    sessionStorage.setItem('maternity_token', 'token123')
    mockOrgService.setMaternyId.mockReturnValue(throwError(() => ({ status: 400 })))
    expect(() => component.ngOnInit()).not.toThrow()
    expect(mockOrgService.setMaternyId).toHaveBeenCalled()
  })

  it('should handle 419 error without throwing', () => {
    sessionStorage.setItem('maternity_token', 'token123')
    mockOrgService.setMaternyId.mockReturnValue(throwError(() => ({ status: 419 })))
    expect(() => component.ngOnInit()).not.toThrow()
    expect(mockOrgService.setMaternyId).toHaveBeenCalled()
  })

  it('should pass token from sessionStorage to checkMaternityCallback', () => {
    sessionStorage.setItem('maternity_token', 'direct-token')
    mockOrgService.setMaternyId.mockReturnValue(of({ message: 'no-match' }))
    component.ngOnInit()
    expect(mockOrgService.setMaternyId).toHaveBeenCalledWith({ token: 'direct-token' })
  })
})
