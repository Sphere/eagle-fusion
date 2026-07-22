import { AuthNavBarToggleService } from './auth-nav-bar-toggle.service'

describe('AuthNavBarToggleService', () => {
  let service: AuthNavBarToggleService

  beforeEach(() => {
    service = new AuthNavBarToggleService()
  })

  it('should create', () => {
    expect(service).toBeTruthy()
  })

  it('should default isVisible to true', () => {
    expect(service.isVisible).toBe(true)
  })

  it('should set and get isVisible', () => {
    service.isVisible = false
    expect(service.isVisible).toBe(false)
  })

  it('should toggle isVisible and emit on toggleNavBar', () => {
    const emitted: boolean[] = []
    service.toggleNavBar.subscribe(val => emitted.push(val))
    service.toggle(false)
    expect(service.isVisible).toBe(false)
    expect(emitted).toEqual([false])
    service.toggle(true)
    expect(service.isVisible).toBe(true)
    expect(emitted).toEqual([false, true])
  })
})
