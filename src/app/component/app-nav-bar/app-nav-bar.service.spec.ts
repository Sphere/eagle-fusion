import { appNavBarService } from './app-nav-bar.service'

describe('appNavBarService', () => {
  let service: appNavBarService

  beforeEach(() => {
    service = new appNavBarService()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should create', () => {
    expect(service).toBeTruthy()
  })

  it('currentOption emits initial empty string', (done) => {
    service.currentOption.subscribe(val => {
      expect(val).toBe('')
      done()
    })
  })

  it('changeNavBarActive emits the new name', (done) => {
    const values: string[] = []
    service.currentOption.subscribe(val => values.push(val))
    service.changeNavBarActive('home')
    expect(values).toContain('home')
    done()
  })

  it('changeNavBarActive updates to latest value', (done) => {
    let latest = ''
    service.currentOption.subscribe(val => latest = val)
    service.changeNavBarActive('search')
    service.changeNavBarActive('profile')
    expect(latest).toBe('profile')
    done()
  })
})
