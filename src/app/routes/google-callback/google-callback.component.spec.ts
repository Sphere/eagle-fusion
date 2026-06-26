jest.mock('@ws-widget/collection', () => ({
  WidgetContentService: class {
    googleAuthenticate = jest.fn()
  },
}))

jest.mock('../signup/signup.service', () => ({
  SignupService: class {
    fetchStartUpDetails = jest.fn()
  },
}))

import { of, throwError } from 'rxjs'
import { GoogleCallbackComponent } from './google-callback.component'

describe('GoogleCallbackComponent', () => {
  let component: GoogleCallbackComponent
  let mockRouter: any
  let mockContentSvc: any
  let mockSignupService: any
  let mockSnackBar: any

  beforeEach(() => {
    mockRouter = {
      url: '/google/callback&id_token=test-token-abc',
      navigate: jest.fn(),
    }
    mockContentSvc = {
      googleAuthenticate: jest.fn().mockReturnValue(of({ msg: 'Login successful' })),
    }
    mockSignupService = {
      fetchStartUpDetails: jest.fn().mockResolvedValue({ status: 200, roles: ['PUBLIC'] }),
    }
    mockSnackBar = { open: jest.fn() }
    component = new GoogleCallbackComponent(mockRouter, mockContentSvc, mockSignupService, mockSnackBar)
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
    jest.clearAllMocks()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should call googleAuthenticate with extracted id_token on ngOnInit', () => {
    component.ngOnInit()
    expect(mockContentSvc.googleAuthenticate).toHaveBeenCalledWith({ idToken: 'test-token-abc' })
  })

  it('should not call googleAuthenticate when URL does not include /google/callback', () => {
    mockRouter.url = '/other/page&id_token=token'
    component.ngOnInit()
    expect(mockContentSvc.googleAuthenticate).not.toHaveBeenCalled()
  })

  it('should open snackbar with error message on 401 result', async () => {
    mockSignupService.fetchStartUpDetails.mockResolvedValue({
      status: 401,
      error: { params: { errmsg: 'Unauthorized' } },
    })
    component.ngOnInit()
    await Promise.resolve() // flush microtask from async subscribe callback
    expect(mockSnackBar.open).toHaveBeenCalledWith('Unauthorized', undefined, expect.any(Object))
  })

  it('should open snackbar with error message on 419 result', async () => {
    mockSignupService.fetchStartUpDetails.mockResolvedValue({
      status: 419,
      error: { params: { errmsg: 'Session expired' } },
    })
    component.ngOnInit()
    await Promise.resolve()
    expect(mockSnackBar.open).toHaveBeenCalledWith('Session expired', undefined, expect.any(Object))
  })

  it('should navigate to /app/login on googleAuthenticate error', async () => {
    mockContentSvc.googleAuthenticate.mockReturnValue(throwError(() => ({ error: 'Auth failed' })))
    component.ngOnInit()
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/login'])
  })

  it('should open snackbar on googleAuthenticate error', () => {
    mockContentSvc.googleAuthenticate.mockReturnValue(throwError(() => ({ error: 'Auth failed' })))
    component.ngOnInit()
    expect(mockSnackBar.open).toHaveBeenCalledWith('Auth failed', undefined, expect.any(Object))
  })
})
