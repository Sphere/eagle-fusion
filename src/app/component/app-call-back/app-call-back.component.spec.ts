import { AppCallBackComponent } from './app-call-back.component'
import { of, Subject } from 'rxjs'

describe('AppCallBackComponent', () => {
  let component: AppCallBackComponent
  let mockActivatedRoute: any
  let mockAppCallBackService: any
  let queryParamSubject: Subject<any>

  beforeEach(() => {
    queryParamSubject = new Subject<any>()

    mockActivatedRoute = {
      queryParamMap: queryParamSubject.asObservable(),
    }

    mockAppCallBackService = {
      webviewCookieSet: jest.fn().mockReturnValue(of({})),
    }
  })

  const createComponent = () => {
    return new AppCallBackComponent(mockActivatedRoute, mockAppCallBackService)
  }

  it('should create the component', () => {
    component = createComponent()
    expect(component).toBeTruthy()
  })

  it('should have default property values', () => {
    component = createComponent()
    expect(component.isLoading).toBe(false)
    expect(component.token).toBeUndefined()
  })

  it('should not call webviewCookieSet when token query param is absent', () => {
    component = createComponent()
    queryParamSubject.next({ params: {}, get: jest.fn().mockReturnValue(null) })
    expect(mockAppCallBackService.webviewCookieSet).not.toHaveBeenCalled()
    expect(component.isLoading).toBe(false)
  })

  it('should set isLoading and token when x-authenticated-user-token query param is present', () => {
    component = createComponent()
    const mockToken = 'test-token-123'
    const mockQueryParams = {
      params: { 'x-authenticated-user-token': mockToken },
      get: jest.fn().mockReturnValue(mockToken),
    }
    queryParamSubject.next(mockQueryParams)
    expect(component.isLoading).toBe(true)
    expect(component.token).toBe(mockToken)
  })

  it('should call webviewCookieSet with the token when token query param is present', () => {
    component = createComponent()
    const mockToken = 'test-token-abc'
    const mockQueryParams = {
      params: { 'x-authenticated-user-token': mockToken },
      get: jest.fn().mockReturnValue(mockToken),
    }
    queryParamSubject.next(mockQueryParams)
    expect(mockAppCallBackService.webviewCookieSet).toHaveBeenCalledWith(mockToken)
  })

  it('should redirect window.location when redirectUrl is present in response', () => {
    const redirectUrl = 'https://sphere.aastrika.org/dashboard'
    mockAppCallBackService.webviewCookieSet = jest.fn().mockReturnValue(of({ redirectUrl }))

    const originalLocation = window.location
    delete (window as any).location
      ; (window as any).location = redirectUrl

    component = createComponent()
    const mockToken = 'test-token-redirect'
    const mockQueryParams = {
      params: { 'x-authenticated-user-token': mockToken },
      get: jest.fn().mockReturnValue(mockToken),
    }
    queryParamSubject.next(mockQueryParams)

    expect(window.location).toBe(redirectUrl)
      ; (window as any).location = originalLocation
  })

  it('should not redirect when response has no redirectUrl', () => {
    mockAppCallBackService.webviewCookieSet = jest.fn().mockReturnValue(of({ someOtherField: 'value' }))

    const originalLocation = window.location
    component = createComponent()
    const mockToken = 'test-token-no-redirect'
    const mockQueryParams = {
      params: { 'x-authenticated-user-token': mockToken },
      get: jest.fn().mockReturnValue(mockToken),
    }
    queryParamSubject.next(mockQueryParams)

    expect(window.location).toBe(originalLocation)
  })

  it('should not call webviewCookieSet when token is falsy', () => {
    component = createComponent()
    component.token = null
    component.webviewCookieSet()
    expect(mockAppCallBackService.webviewCookieSet).not.toHaveBeenCalled()
  })

  it('should call webviewCookieSet with current token when webviewCookieSet method is called directly', () => {
    component = createComponent()
    component.token = 'direct-token'
    component.webviewCookieSet()
    expect(mockAppCallBackService.webviewCookieSet).toHaveBeenCalledWith('direct-token')
  })

  it('should handle multiple query param emissions and only act when token param present', () => {
    component = createComponent()

    queryParamSubject.next({ params: {}, get: jest.fn().mockReturnValue(null) })
    expect(mockAppCallBackService.webviewCookieSet).not.toHaveBeenCalled()

    const mockToken = 'second-emission-token'
    queryParamSubject.next({
      params: { 'x-authenticated-user-token': mockToken },
      get: jest.fn().mockReturnValue(mockToken),
    })
    expect(mockAppCallBackService.webviewCookieSet).toHaveBeenCalledTimes(1)
    expect(mockAppCallBackService.webviewCookieSet).toHaveBeenCalledWith(mockToken)
  })
})
