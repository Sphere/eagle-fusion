jest.mock('@ws-widget/utils', () => ({
  ConfigurationsService: class {
    userProfile = { rootOrgId: 'org-1' }
  },
}))

jest.mock('../constants/apiConstants', () => ({
  API_END_POINTS: { FORM_READ: '/apis/form/read' },
}))

jest.mock('../models/downtime.model', () => ({
  DOWNTIME_DEFAULTS: {
    DEFAULT_ICON: 'warning',
    FALLBACK_MESSAGE: { title: 'Maintenance', message: 'Down for maintenance' },
    PRIMARY_COLOR: '#1c5d95',
    BACKGROUND_COLOR: '#f8f8f8',
    TEXT_COLOR: '#101828',
    BANNER_COLOR: '#1c5d95',
    BORDER_COLOR: '#dddddd',
    REFRESH_INTERVAL: 300,
  },
}))

import { of } from 'rxjs'
import { DowntimeConfigService } from './downtime-config.service'
import { ConfigurationsService } from '@ws-widget/utils'

describe('DowntimeConfigService', () => {
  let service: DowntimeConfigService
  let mockHttp: any
  let mockNgZone: any
  let mockConfigSvc: any

  beforeEach(() => {
    jest.useFakeTimers()
    mockHttp = {
      post: jest.fn().mockReturnValue(of({ result: { form: { data: null } } })),
    }
    mockNgZone = {
      runOutsideAngular: jest.fn().mockImplementation((fn: any) => fn()),
      run: jest.fn().mockImplementation((fn: any) => fn()),
    }
    mockConfigSvc = new ConfigurationsService()
    service = new DowntimeConfigService(mockNgZone, mockHttp, mockConfigSvc)
  })

  afterEach(() => {
    service.ngOnDestroy()
    jest.useRealTimers()
    jest.clearAllMocks()
  })

  it('should create', () => {
    expect(service).toBeTruthy()
  })

  it('isInDowntime returns false by default', () => {
    expect(service.isInDowntime()).toBe(false)
  })

  it('getDowntimeType returns "full" by default', () => {
    expect(service.getDowntimeType()).toBe('full')
  })

  it('getCurrentDowntimeState returns initial state', () => {
    const state = service.getCurrentDowntimeState()
    expect(state.isDowntime).toBe(false)
    expect(state.type).toBe('full')
  })

  it('isBypassed returns false when bypassOrgs is empty', () => {
    expect(service.isBypassed()).toBe(false)
  })

  it('initializeDowntimeConfig fetches and updates state', (done) => {
    service.initializeDowntimeConfig().subscribe(state => {
      expect(state.isDowntime).toBe(false)
      done()
    })
  })

  it('initializeDowntimeConfig handles API error gracefully', (done) => {
    mockHttp.post.mockReturnValue(of({ result: null }))
    const svc2 = new DowntimeConfigService(mockNgZone, mockHttp, mockConfigSvc)
    svc2.initializeDowntimeConfig().subscribe(state => {
      expect(state.isDowntime).toBe(false)
      done()
    })
    svc2.ngOnDestroy()
  })

  it('getDowntimeState returns an observable', (done) => {
    service.getDowntimeState().subscribe(state => {
      expect(state).toBeDefined()
      done()
    })
  })

  it('ngOnDestroy clears the refresh timer without throwing', () => {
    expect(() => service.ngOnDestroy()).not.toThrow()
  })
})
