jest.mock('project/ws/app/src/lib/routes/org/org-service.service', () => ({
  OrgServiceService: class {
    setTnnmcToken = jest.fn()
  },
}))

jest.mock('../component/tnnmc-dialog-confirm/tnnmc-confirm.component', () => ({
  TnnmcConfirmComponent: class {},
}))

jest.mock('../../../library/ws-widget/utils/src/public-api', () => ({
  LoggerService: class {
    log = jest.fn()
  },
}))

import { of, throwError } from 'rxjs'
import { TnnmcCallbackComponent } from './tnnmc-callback.component'

describe('TnnmcCallbackComponent', () => {
  let component: TnnmcCallbackComponent
  let mockOrgService: any
  let mockDialog: any
  let mockRouter: any
  let mockLogger: any

  beforeEach(() => {
    mockOrgService = {
      setTnnmcToken: jest.fn().mockReturnValue(of({ message: 'success' })),
    }
    mockDialog = { open: jest.fn() }
    mockRouter = { navigate: jest.fn() }
    mockLogger = { log: jest.fn() }
    component = new TnnmcCallbackComponent(
      mockOrgService,
      mockDialog,
      mockRouter,
      mockLogger,
    )
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

  it('should not call setTnnmcToken when no token in sessionStorage', () => {
    component.ngOnInit()
    expect(mockOrgService.setTnnmcToken).not.toHaveBeenCalled()
    expect(component.isLoading).toBe(false)
  })

  it('should set isLoading true and call setTnnmcToken when token is present', () => {
    sessionStorage.setItem('tnnmc_token', 'tnnmc-token')
    component.ngOnInit()
    expect(component.isLoading).toBe(true)
    expect(mockOrgService.setTnnmcToken).toHaveBeenCalledWith({ token: 'tnnmc-token' })
  })

  it('should store loc in localStorage on success', async () => {
    sessionStorage.setItem('tnnmc_token', 'tnnmc-token')
    component.ngOnInit()
    // flush microtask from `await res` inside the async subscribe callback
    await Promise.resolve()
    expect(localStorage.getItem('loc')).toBe(JSON.stringify({ message: 'success' }))
  })

  it('should open confirm dialog and navigate on FAILURE status 400', () => {
    sessionStorage.setItem('tnnmc_token', 'tnnmc-token')
    mockOrgService.setTnnmcToken.mockReturnValue(
      throwError(() => ({
        status: 400,
        error: { status: 'FAILURE', message: 'Token expired' },
      })),
    )
    component.ngOnInit()
    expect(component.isLoading).toBe(false)
    expect(mockDialog.open).toHaveBeenCalled()
    expect(mockRouter.navigate).toHaveBeenCalledWith(
      ['/app/org-details'],
      expect.objectContaining({ queryParams: expect.any(Object) }),
    )
  })

  it('should navigate to public/home on non-FAILURE error', () => {
    sessionStorage.setItem('tnnmc_token', 'tnnmc-token')
    mockOrgService.setTnnmcToken.mockReturnValue(
      throwError(() => ({
        status: 419,
        error: { status: 'OTHER' },
      })),
    )
    component.ngOnInit()
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/public/home'])
  })
})
