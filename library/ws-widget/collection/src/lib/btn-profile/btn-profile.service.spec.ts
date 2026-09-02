import { BtnProfileService } from './btn-profile.service'

describe('BtnProfileService', () => {
  let service: BtnProfileService

  beforeEach(() => {
    service = new BtnProfileService()
  })

  it('should create', () => {
    expect(service).toBeTruthy()
  })

  it('should default the given name to Guest', () => {
    expect(service.givenName).toBe('Guest')
  })

  it('should replay the current name to a new subscriber', () => {
    const received: string[] = []
    service.currentName.subscribe(name => received.push(name))
    expect(received).toEqual(['Guest'])
  })

  it('should push a new name to existing subscribers', () => {
    const received: string[] = []
    service.currentName.subscribe(name => received.push(name))
    service.changeName('Ada')
    expect(received).toEqual(['Guest', 'Ada'])
  })

  it('should replay the latest name to a late subscriber', () => {
    service.changeName('Ada')
    const received: string[] = []
    service.currentName.subscribe(name => received.push(name))
    expect(received).toEqual(['Ada'])
  })

  it('should broadcast to every subscriber', () => {
    const first: string[] = []
    const second: string[] = []
    service.currentName.subscribe(n => first.push(n))
    service.currentName.subscribe(n => second.push(n))
    service.changeName('Grace')
    expect(first).toContain('Grace')
    expect(second).toContain('Grace')
  })
})
