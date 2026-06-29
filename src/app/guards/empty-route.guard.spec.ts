jest.mock('../services/downtime-config.service', () => ({
  DowntimeConfigService: class { getDowntimeState = jest.fn() },
}))

import { of } from 'rxjs'
import { EmptyRouteGuard } from './empty-route.guard'
import { DowntimeConfigService } from '../services/downtime-config.service'

describe('EmptyRouteGuard', () => {
  let guard: EmptyRouteGuard
  let mockDowntimeSvc: any

  beforeEach(() => {
    mockDowntimeSvc = new DowntimeConfigService()
    guard = new EmptyRouteGuard(mockDowntimeSvc)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should create', () => {
    expect(guard).toBeTruthy()
  })

  it('returns false during full downtime', done => {
    mockDowntimeSvc.getDowntimeState.mockReturnValue(of({ isDowntime: true, type: 'full' }))
    const result$ = guard.canActivate({} as any, {} as any) as any
    result$.subscribe((result: boolean) => {
      expect(result).toBe(false)
      done()
    })
  })

  it('returns true when there is no downtime', done => {
    mockDowntimeSvc.getDowntimeState.mockReturnValue(of({ isDowntime: false, type: null }))
    const result$ = guard.canActivate({} as any, {} as any) as any
    result$.subscribe((result: boolean) => {
      expect(result).toBe(true)
      done()
    })
  })

  it('returns true during partial downtime (type is not "full")', done => {
    mockDowntimeSvc.getDowntimeState.mockReturnValue(of({ isDowntime: true, type: 'partial' }))
    const result$ = guard.canActivate({} as any, {} as any) as any
    result$.subscribe((result: boolean) => {
      expect(result).toBe(true)
      done()
    })
  })

  it('calls getDowntimeState exactly once per canActivate call', done => {
    mockDowntimeSvc.getDowntimeState.mockReturnValue(of({ isDowntime: false, type: null }))
    const result$ = guard.canActivate({} as any, {} as any) as any
    result$.subscribe(() => {
      expect(mockDowntimeSvc.getDowntimeState).toHaveBeenCalledTimes(1)
      done()
    })
  })
})
