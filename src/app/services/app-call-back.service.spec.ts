jest.mock('../constants/apiConstants', () => ({
  API_END_POINTS: { webview_login: '/apis/webview/login' },
}))

import { of } from 'rxjs'
import { AppCallBackService } from './app-call-back.service'

describe('AppCallBackService', () => {
  let service: AppCallBackService
  let mockHttp: any

  beforeEach(() => {
    mockHttp = { get: jest.fn().mockReturnValue(of({ success: true })) }
    service = new AppCallBackService(mockHttp)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should create', () => {
    expect(service).toBeTruthy()
  })

  it('webviewCookieSet calls http.get with the correct URL', () => {
    service.webviewCookieSet('test-token')
    expect(mockHttp.get).toHaveBeenCalledWith(
      '/apis/webview/login',
      expect.objectContaining({ headers: expect.anything() })
    )
  })

  it('webviewCookieSet returns an observable', (done) => {
    service.webviewCookieSet('test-token').subscribe(res => {
      expect(res).toEqual({ success: true })
      done()
    })
  })
})
