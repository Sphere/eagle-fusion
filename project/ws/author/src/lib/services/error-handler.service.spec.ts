import { AuthoringErrorHandler } from './error-handler.service'
import { LoaderService } from './loader.service'

describe('AuthoringErrorHandler', () => {
  let service: AuthoringErrorHandler
  let loaderService: LoaderService
  let loggerService: { error: jest.Mock }

  beforeEach(() => {
    loaderService = new LoaderService()
    loggerService = { error: jest.fn() }
    service = new AuthoringErrorHandler(loaderService, loggerService as any)
  })

  it('should create', () => {
    expect(service).toBeTruthy()
  })

  it('should set changeLoad to false and log the error', () => {
    let value: boolean | undefined
    loaderService.changeLoad.subscribe(val => value = val)
    const error = new Error('test error')
    service.handleError(error)
    expect(value).toBe(false)
    expect(loggerService.error).toHaveBeenCalledWith(error)
  })
})
