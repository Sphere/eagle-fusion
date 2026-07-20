import { CompetencyUserService } from './competency-user.service'

describe('CompetencyUserService', () => {
  let service: CompetencyUserService

  beforeEach(() => {
    service = new CompetencyUserService()
  })

  it('should create', () => {
    expect(service).toBeTruthy()
  })

  it('updateValue$ starts with null', () => {
    let latest: any = 'unset'
    service.updateValue$.subscribe(v => { latest = v })
    expect(latest).toBeNull()
  })

  it('emitProfileUpdate pushes the value to subscribers', () => {
    const emitted: any[] = []
    service.updateValue$.subscribe(v => emitted.push(v))
    service.emitProfileUpdate({ language: 'hi' })
    expect(emitted).toEqual([null, { language: 'hi' }])
  })

  it('late subscribers receive the last emitted value', () => {
    service.emitProfileUpdate('profile-1')
    let latest: any
    service.updateValue$.subscribe(v => { latest = v })
    expect(latest).toBe('profile-1')
  })
})
