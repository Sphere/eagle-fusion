import { LoaderService } from './loader.service'

describe('LoaderService', () => {
  let service: LoaderService

  beforeEach(() => {
    service = new LoaderService()
  })

  it('should create', () => {
    expect(service).toBeTruthy()
  })

  it('should default changeLoad to false', () => {
    let value: boolean | undefined
    service.changeLoad.subscribe(val => value = val)
    expect(value).toBe(false)
  })

  it('should emit new value on changeLoad', () => {
    let value: boolean | undefined
    service.changeLoad.subscribe(val => value = val)
    service.changeLoad.next(true)
    expect(value).toBe(true)
  })

  it('should default currentState to false', () => {
    let value: boolean | undefined
    service.currentState.subscribe(val => value = val)
    expect(value).toBe(false)
  })

  it('should update currentState via changeLoadState', () => {
    let value: boolean | undefined
    service.currentState.subscribe(val => value = val)
    service.changeLoadState(true)
    expect(value).toBe(true)
  })
})
