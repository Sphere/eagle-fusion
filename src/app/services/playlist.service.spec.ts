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

  it('setEarnedBadges emits count on earnedBadges$', done => {
    service.setEarnedBadges(10)
    service.earnedBadges$.subscribe(count => {
      expect(count).toBe(10)
      done()
    })
  })

  it('setEarnedBadges with isIncrement=true adds to current value', done => {
    service.setEarnedBadges(5)
    service.setEarnedBadges(3, true)
    service.earnedBadges$.subscribe(count => {
      expect(count).toBe(8)
      done()
    })
  })

  it('setEarnedBadges with count=0 emits 0', done => {
    service.setEarnedBadges(10)
    service.setEarnedBadges(0)
    service.earnedBadges$.subscribe(count => {
      expect(count).toBe(0)
      done()
    })
  })

  it('setEarnedBadges keeps higher currentCount when count < current', done => {
    service.setEarnedBadges(10)
    service.setEarnedBadges(3)
    service.earnedBadges$.subscribe(count => {
      expect(count).toBe(10)
      done()
    })
  })

  it('loadPlaylistData logs error and returns null when http fails', async () => {
    const { throwError } = require('rxjs')
    mockHttp.post = jest.fn().mockReturnValue(throwError(() => new Error('network error')))
    const result = await service.loadPlaylistData()
    expect(result).toBeNull()
    expect(mockLogger.error).toHaveBeenCalled()
  })

  it('loadPlaylistData returns null when response has no form data', async () => {
    mockHttp.post = jest.fn().mockReturnValue(of({ result: {} }))
    const result = await service.loadPlaylistData()
    expect(result).toBeNull()
  })

  describe('computed signals', () => {
    it('orgDetails returns orgData after loading', async () => {
      await service.loadPlaylistData()
      expect(service.orgDetails()).toBe('test-org')
    })

    it('sections returns sections object after loading', async () => {
      await service.loadPlaylistData()
      expect(service.sections()).toEqual({})
    })

    it('selectedTabConfig returns homeTab section when tab is homeTab', async () => {
      mockHttp.post = jest.fn().mockReturnValue(of({
        result: { form: { data: { LAYOUT_BODY: { sections: { homeTab: 'home-content' } } } } },
      }))
      await service.loadPlaylistData()
      service.setSelectedTab('homeTab')
      expect(service.selectedTabConfig()).toBe('home-content')
    })

    it('selectedTabConfig falls back to homeTab when selected tab not found', async () => {
      mockHttp.post = jest.fn().mockReturnValue(of({
        result: { form: { data: { LAYOUT_BODY: { sections: { homeTab: 'home-content' } } } } },
      }))
      await service.loadPlaylistData()
      service.setSelectedTab('nonExistentTab')
      expect(service.selectedTabConfig()).toBe('home-content')
    })
  })

  describe('getPlaylistConfig', () => {
    it('should call http.post and return playlist array', async () => {
      mockHttp.post = jest.fn().mockReturnValue(of({ result: { playlist: [{ id: 1 }] } }))
      const result = await service.getPlaylistConfig()
      expect(result).toEqual([{ id: 1 }])
      expect(mockHttp.post).toHaveBeenCalledWith('/apis/playlist/search', expect.any(Object))
    })

    it('should return cached result on second call', async () => {
      mockHttp.post = jest.fn().mockReturnValue(of({ result: { playlist: [{ id: 1 }] } }))
      await service.getPlaylistConfig()
      await service.getPlaylistConfig()
      expect(mockHttp.post).toHaveBeenCalledTimes(1)
    })

    it('should log error and return empty array when http fails', async () => {
      const { throwError } = require('rxjs')
      mockHttp.post = jest.fn().mockReturnValue(throwError(() => new Error('fail')))
      const result = await service.getPlaylistConfig()
      expect(result).toEqual([])
      expect(mockLogger.error).toHaveBeenCalled()
    })

    it('should return empty array when response has no playlist', async () => {
      mockHttp.post = jest.fn().mockReturnValue(of({ result: {} }))
      const result = await service.getPlaylistConfig()
      expect(result).toEqual([])
    })
  })

  describe('getPlaylistConfigId', () => {
    it('resolves a renamed playlistConfigId (e.g. backend renames COMPETENCY_PLAYLIST_V2 -> COMPETENCY_V3) with no code change', async () => {
      mockHttp.post = jest.fn().mockReturnValue(of({
        result: {
          form: {
            data: {
              LAYOUT_BODY: {
                sections: {
                  homeTab: [
                    { sectionId: 'COMPETENCY_PLAYLIST', playlistConfigId: 'COMPETENCY_V3' },
                    { sectionId: 'YOUR_PLANS_PLAYLIST', playlistConfigId: 'PLAYLIST_V2' },
                  ],
                },
              },
            },
          },
        },
      }))
      await service.loadPlaylistData()

      expect(service.getPlaylistConfigId('COMPETENCY_PLAYLIST')).toBe('COMPETENCY_V3')
      expect(service.getPlaylistConfigId('YOUR_PLANS_PLAYLIST')).toBe('PLAYLIST_V2')

      // The renamed id must be usable to pull the matching payload straight out of a
      // PLAYLIST_SEARCH response — proving the join reflects the new id end-to-end.
      const searchResponse = [
        { playlistId: 'COMPETENCY_V3', orgId: 'org-1', language: 'en', dataSource: { type: 'competency', payload: ['competency-payload'] } },
        { playlistId: 'PLAYLIST_V2', orgId: 'org-1', language: 'en', dataSource: { type: 'static', payload: ['course-1', 'course-2'] } },
        { playlistId: 'SOME_OTHER_UNRELATED_ID', orgId: 'org-1', language: 'en', dataSource: { type: 'static', payload: ['should-not-match'] } },
      ]

      const competencyConfigId = service.getPlaylistConfigId('COMPETENCY_PLAYLIST')
      const yourPlansConfigId = service.getPlaylistConfigId('YOUR_PLANS_PLAYLIST')

      const competencyMatch = searchResponse.find(p => p.playlistId === competencyConfigId)
      const yourPlansMatch = searchResponse.find(p => p.playlistId === yourPlansConfigId)

      expect(competencyMatch?.dataSource.payload).toEqual(['competency-payload'])
      expect(yourPlansMatch?.dataSource.payload).toEqual(['course-1', 'course-2'])
    })

    it('returns undefined when no section declares that sectionId', async () => {
      await service.loadPlaylistData()
      expect(service.getPlaylistConfigId('TOP_COURSE_PLAYLIST')).toBeUndefined()
    })

    it('returns undefined when the section exists but has no playlistConfigId', async () => {
      mockHttp.post = jest.fn().mockReturnValue(of({
        result: {
          form: {
            data: {
              LAYOUT_BODY: {
                sections: {
                  homeTab: [{ sectionId: 'CONTINUE_LEARNING' }],
                },
              },
            },
          },
        },
      }))
      await service.loadPlaylistData()
      expect(service.getPlaylistConfigId('CONTINUE_LEARNING')).toBeUndefined()
    })

    it('resolves before-login sections that have no sectionId field, using playlistConfigId directly as the join key', async () => {
      // Matches the real before-login web_layout shape: no `sectionId`, just `playlistConfigId`
      // used as the section's own identifier (no backend rename indirection before login).
      const beforeLoginBody = [
        { title: 'TOP COURSES', playlistConfigId: 'TOP_COURSE_PLAYLIST', payload: ['do_1', 'do_2'] },
        { title: 'CNE COURSES', playlistConfigId: 'CNE_COURSE_PLAYLIST', payload: ['do_3'] },
      ]
      mockHttp.post = jest.fn().mockReturnValue(of({
        result: { form: { data: { LAYOUT_BODY: beforeLoginBody } } },
      }))
      await service.loadPlaylistData()
      expect(service.getPlaylistConfigId('TOP_COURSE_PLAYLIST')).toBe('TOP_COURSE_PLAYLIST')
      expect(service.getPlaylistConfigId('CNE_COURSE_PLAYLIST')).toBe('CNE_COURSE_PLAYLIST')
      expect(service.getPlaylistConfigId('CONTINUE_LEARNING')).toBeUndefined()
    })

    it('finds a matching section across any tab, not just homeTab', async () => {
      mockHttp.post = jest.fn().mockReturnValue(of({
        result: {
          form: {
            data: {
              LAYOUT_BODY: {
                sections: {
                  homeTab: [{ sectionId: 'CONTINUE_LEARNING', playlistConfigId: 'CONTINUE_LEARNING' }],
                  courseTab: [{ sectionId: 'SEARCH_PLAYLIST', playlistConfigId: 'SEARCH_PLAYLIST_V4' }],
                },
              },
            },
          },
        },
      }))
      await service.loadPlaylistData()
      expect(service.getPlaylistConfigId('SEARCH_PLAYLIST')).toBe('SEARCH_PLAYLIST_V4')
    })
  })

  describe('computed signal defaults', () => {
    it('selectedTabConfig returns empty string when sections is null', () => {
      expect(service.selectedTabConfig()).toBe('')
    })

    it('headerConfig returns empty string before data loads', () => {
      expect(service.headerConfig()).toBe('')
    })

    it('bodyConfig returns null before data loads', () => {
      expect(service.bodyConfig()).toBeNull()
    })

    it('footerConfig returns empty string before data loads', () => {
      expect(service.footerConfig()).toBe('')
    })
  })

  describe('computed signals after loading', () => {
    it('headerConfig returns LAYOUT_HEADER after loading', async () => {
      mockHttp.post = jest.fn().mockReturnValue(of({
        result: { form: { data: { LAYOUT_HEADER: 'header-data', LAYOUT_BODY: [] } } },
      }))
      await service.loadPlaylistData()
      expect(service.headerConfig()).toBe('header-data')
    })

    it('bodyConfig returns LAYOUT_BODY after loading', async () => {
      await service.loadPlaylistData()
      expect(service.bodyConfig()).toEqual({ sections: {} })
    })

    it('footerConfig returns LAYOUT_FOOTER after loading', async () => {
      mockHttp.post = jest.fn().mockReturnValue(of({
        result: { form: { data: { LAYOUT_FOOTER: 'footer-data' } } },
      }))
      await service.loadPlaylistData()
      expect(service.footerConfig()).toBe('footer-data')
    })

    it('config computed returns LAYOUT_BODY after loading', async () => {
      await service.loadPlaylistData()
      expect(service.config()).toEqual({ sections: {} })
    })
  })

  describe('LAYOUT_BODY shape normalization (before-login array vs after-login sections object)', () => {
    it('wraps a before-login array LAYOUT_BODY into { sections: { homeTab } }', async () => {
      const beforeLoginBody = [{ title: 'Access free Healthcare courses' }, { title: 'CONTINUE LEARNING' }]
      mockHttp.post = jest.fn().mockReturnValue(of({
        result: { form: { data: { LAYOUT_BODY: beforeLoginBody } } },
      }))
      await service.loadPlaylistData()
      expect(service.sections()).toEqual({ homeTab: beforeLoginBody })
      expect(service.bodyConfig()).toEqual({ sections: { homeTab: beforeLoginBody } })
    })

    it('leaves an after-login sections-object LAYOUT_BODY unchanged', async () => {
      const afterLoginBody = { sections: { homeTab: [{ title: 'home section' }] } }
      mockHttp.post = jest.fn().mockReturnValue(of({
        result: { form: { data: { LAYOUT_BODY: afterLoginBody } } },
      }))
      await service.loadPlaylistData()
      expect(service.sections()).toEqual({ homeTab: [{ title: 'home section' }] })
    })

    it('selectedTabConfig resolves homeTab uniformly whether LAYOUT_BODY arrived as an array or a sections object', async () => {
      const beforeLoginBody = [{ title: 'card-1' }]
      mockHttp.post = jest.fn().mockReturnValue(of({
        result: { form: { data: { LAYOUT_BODY: beforeLoginBody } } },
      }))
      await service.loadPlaylistData()
      service.setSelectedTab('homeTab')
      expect(service.selectedTabConfig()).toEqual(beforeLoginBody)
    })
  })
})
