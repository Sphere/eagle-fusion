import { RootService } from './root.service'

describe('RootService', () => {
  let service: RootService

  beforeEach(() => {
    service = new RootService()
  })

  it('should create', () => {
    expect(service).toBeTruthy()
  })

  it('showNavbarDisplay$ emits true by default', done => {
    service.showNavbarDisplay$.subscribe(val => {
      expect(val).toBe(true)
      done()
    })
  })

  it('showNavbarDisplay$ can be set to false', done => {
    const values: boolean[] = []
    service.showNavbarDisplay$.subscribe(val => values.push(val))
    service.showNavbarDisplay$.next(false)
    expect(values).toContain(false)
    done()
  })
})
