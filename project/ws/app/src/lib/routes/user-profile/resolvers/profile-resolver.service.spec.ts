import { ProfileResolverService } from './profile-resolver.service'

describe('ProfileResolverService', () => {
  let service: ProfileResolverService
  let configSvc: { userProfile: any }

  beforeEach(() => {
    configSvc = { userProfile: { firstName: 'test' } }
    service = new ProfileResolverService(configSvc as any)
  })

  it('should create', () => {
    expect(service).toBeTruthy()
  })

  it('should resolve with userProfile data and no error', done => {
    service.resolve({} as any, {} as any).subscribe(result => {
      expect(result.data).toBe(configSvc.userProfile)
      expect(result.error).toBeNull()
      done()
    })
  })
})
