jest.mock('@ws-widget/utils', () => ({
  ConfigurationsService: class {
    isAuthenticated = false
    instanceConfig = null
  },
}))

import { LoginGuard } from './login.guard'
import { ConfigurationsService } from '@ws-widget/utils'

function makeRoute(queryParams: Record<string, string> = {}) {
  return {
    queryParamMap: {
      has: (key: string) => key in queryParams,
      get: (key: string) => queryParams[key] || null,
    },
  } as any
}

describe('LoginGuard', () => {
  let guard: LoginGuard
  let mockRouter: any
  let mockConfigSvc: any

  beforeEach(() => {
    mockRouter = {
      parseUrl: jest.fn().mockImplementation(url => ({ toString: () => url })),
    }
    mockConfigSvc = new ConfigurationsService()
    guard = new LoginGuard(mockRouter, mockConfigSvc as any)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should create', () => {
    expect(guard).toBeTruthy()
  })

  it('returns true when user is not authenticated', () => {
    mockConfigSvc.isAuthenticated = false
    mockConfigSvc.instanceConfig = null
    const result = guard.canActivate(makeRoute(), {} as any)
    expect(result).toBe(true)
  })

  it('returns true when not authenticated and isLoginHidden is true', () => {
    mockConfigSvc.isAuthenticated = false
    mockConfigSvc.instanceConfig = { keycloak: { isLoginHidden: true } }
    const result = guard.canActivate(makeRoute(), {} as any)
    expect(result).toBe(true)
  })

  it('redirects to ref param URL when authenticated and ref is present', () => {
    mockConfigSvc.isAuthenticated = true
    const route = makeRoute({ ref: encodeURIComponent('/app/search') })
    guard.canActivate(route, {} as any)
    expect(mockRouter.parseUrl).toHaveBeenCalledWith('/app/search')
  })

  it('redirects to page/home when authenticated and no ref param', () => {
    mockConfigSvc.isAuthenticated = true
    guard.canActivate(makeRoute(), {} as any)
    expect(mockRouter.parseUrl).toHaveBeenCalledWith('page/home')
  })

  it('decodes ref URL param before parsing', () => {
    mockConfigSvc.isAuthenticated = true
    const encoded = encodeURIComponent('/app/user/profile')
    const route = makeRoute({ ref: encoded })
    guard.canActivate(route, {} as any)
    expect(mockRouter.parseUrl).toHaveBeenCalledWith('/app/user/profile')
  })

  it('handles empty ref param gracefully when authenticated', () => {
    mockConfigSvc.isAuthenticated = true
    const route = makeRoute({ ref: '' })
    guard.canActivate(route, {} as any)
    expect(mockRouter.parseUrl).toHaveBeenCalledWith('')
  })

  it('returns true when not authenticated with instanceConfig and isLoginHidden false', () => {
    mockConfigSvc.isAuthenticated = false
    mockConfigSvc.instanceConfig = { keycloak: { isLoginHidden: false } }
    const result = guard.canActivate(makeRoute(), {} as any)
    expect(result).toBe(true)
  })
})
