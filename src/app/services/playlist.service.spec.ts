jest.mock('../../../library/ws-widget/utils/src/public-api', () => ({
  ConfigurationsService: class {
    userProfile = { rootOrgId: 'org-1' }
  },
  LoggerService: class {
    log = jest.fn()
    warn = jest.fn()
    error = jest.fn()
  },
}))

jest.mock('../constants/apiConstants', () => ({
  API_END_POINTS: {
    FORM_READ: '/apis/form/read',
    PLAYLIST_SEARCH: '/apis/playlist/search',
  },
}))

import { of } from 'rxjs'
import { PlaylistService } from './playlist.service'
import { ConfigurationsService, LoggerService } from '../../../library/ws-widget/utils/src/public-api'

describe('PlaylistService', () => {
  let service: PlaylistService
  let mockHttp: any
  let mockConfigSvc: any
  let mockLogger: any

  beforeEach(() => {
    localStorage.clear()
    mockHttp = {
      post: jest.fn().mockReturnValue(of({
        result: { form: { data: { LAYOUT_BODY: { sections: {} }, orgData: 'test-org' } } },
      })),
    }
    mockConfigSvc = new ConfigurationsService()
    mockLogger = new LoggerService()
    service = new PlaylistService(mockHttp, mockConfigSvc, mockLogger)
  })

  afterEach(() => {
    localStorage.clear()
    jest.clearAllMocks()
  })

  it('should create', () => {
    expect(service).toBeTruthy()
  })

  it('getSelectedTab defaults to "homeTab" when localStorage is empty', () => {
    expect(service.getSelectedTab()).toBe('homeTab')
  })

  it('setSelectedTab updates the selected tab', () => {
    service.setSelectedTab('profileTab')
    expect(service.getSelectedTab()).toBe('profileTab')
  })

  it('setSelectedTab persists to localStorage', () => {
    service.setSelectedTab('accountTab')
    expect(localStorage.getItem('selectedTab')).toBe('accountTab')
  })

  it('setSelectedTab does nothing when tabId is empty', () => {
    service.setSelectedTab('profileTab')
    service.setSelectedTab('')
    expect(service.getSelectedTab()).toBe('profileTab')
  })

  it('clearCache resets playlistData', async () => {
    await service.loadPlaylistData()
    service.clearCache()
    // After clearing cache, next loadPlaylistData will call HTTP again
    await service.loadPlaylistData()
    expect(mockHttp.post).toHaveBeenCalledTimes(2)
  })

  it('loadPlaylistData returns cached data on second call', async () => {
    await service.loadPlaylistData()
    await service.loadPlaylistData()
    expect(mockHttp.post).toHaveBeenCalledTimes(1)
  })

  it('loadPlaylistData with force=true refetches data', async () => {
    await service.loadPlaylistData()
    await service.loadPlaylistData(true)
    expect(mockHttp.post).toHaveBeenCalledTimes(2)
  })

  it('setEarnedBadges emits count on earnedBadges$', (done) => {
    service.setEarnedBadges(10)
    service.earnedBadges$.subscribe(count => {
      expect(count).toBe(10)
      done()
    })
  })

  it('setEarnedBadges with isIncrement=true adds to current value', (done) => {
    service.setEarnedBadges(5)
    service.setEarnedBadges(3, true)
    service.earnedBadges$.subscribe(count => {
      expect(count).toBe(8)
      done()
    })
  })
})
