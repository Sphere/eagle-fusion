import { WindowService } from './navigation-history.service'

describe('WindowService', () => {
  let service: WindowService

  beforeEach(() => {
    service = new WindowService()
  })

  it('should create', () => {
    expect(service).toBeTruthy()
  })

  it('nativeWindow returns the global window object', () => {
    expect(service.nativeWindow).toBe(window)
  })

  it('nativeWindow is not null', () => {
    expect(service.nativeWindow).toBeTruthy()
  })
})
