jest.mock('../../../../library/ws-widget/utils/src/lib/services/value.service', () => ({
  ValueService: class {
    isMobile = jest.fn().mockReturnValue(false)
  },
}))

// playlist.service.ts imports from the full utils public-api, which loads
// ngx-image-cropper and fails in jsdom. Mock the service to avoid that chain.
jest.mock('../../services/playlist.service', () => ({
  PlaylistService: class MockPlaylistService {
    getPlaylistConfig = jest.fn().mockResolvedValue([])
  },
}))

jest.mock('../../../../library/ws-widget/collection/src/public-api', () => ({
  WidgetUserService: class MockWidgetUserService {
    fetchUserEnrollmentWithProgress = jest.fn().mockReturnValue({ toPromise: jest.fn().mockResolvedValue([]) })
  },
}))

jest.mock('../../../../library/ws-widget/utils/src/public-api', () => ({
  ConfigurationsService: class MockConfigurationsService {
    userProfile = null
  },
}))

import { ProgramHome } from './program-home'
import { of } from 'rxjs'

describe('ProgramHome', () => {
  let comp: ProgramHome
  let mockValueSvc: any
  let mockPlaylistSvc: any
  let mockUserSvc: any
  let mockConfigSvc: any

  const staticPlaylist = {
    playlistId: 'PL_STATIC',
    language: 'en',
    dataSource: { type: 'static', payload: ['course-1', 'course-2'] },
  }
  const competencyPlaylist = {
    playlistId: 'PL_COMPETENCY',
    dataSource: {
      type: 'competency',
      payload: [
        {
          'COMMUNITY_HEALTH': {
            competencyId: 'comp-001',
            additionalProperties: {
              competencyLevelDescription: [
                {
                  level: 1,
                  course: [{ id: 'comp-course-1', name: 'Course 1' }],
                },
                {
                  level: 2,
                  course: [{ id: 'comp-course-2', name: 'Course 2' }],
                },
              ],
            },
          },
        },
      ],
    },
  }

  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => undefined)
    mockValueSvc = { isMobile: jest.fn().mockReturnValue(false) }
    mockPlaylistSvc = {
      getPlaylistConfig: jest.fn().mockResolvedValue([staticPlaylist, competencyPlaylist]),
      selectedProgram: { set: jest.fn() },
      showDetails: { set: jest.fn() },
    }
    mockUserSvc = {
      fetchUserEnrollmentWithProgress: jest.fn().mockReturnValue(of([])),
    }
    mockConfigSvc = {
      userProfile: null,
    }
    comp = new ProgramHome(mockValueSvc, mockPlaylistSvc, mockUserSvc, mockConfigSvc)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should create with loading on and no program data', () => {
    expect(comp).toBeTruthy()
    expect(comp.isLoading()).toBe(true)
    expect(comp.programData()).toEqual([])
  })

  it('isXSmall mirrors the ValueService mobile signal', () => {
    expect(comp.isXSmall()).toBe(false)
  })

  describe('ngOnInit', () => {
    it('enriches course and competency programs with playlist counts', async () => {
      comp.configData = {
        programs: [
          { type: 'course', playlistConfigId: 'PL_STATIC' },
          { type: 'competency', playlistConfigId: 'PL_COMPETENCY' },
        ],
      }
      comp.userEnrollCourse = []
      await comp.ngOnInit()
      const [course, competency] = comp.programData()
      expect(course.courseCount).toBe(2)
      expect(course.courseIds).toEqual(['course-1', 'course-2'])
      expect(competency.courseCount).toBe(2)
      expect(competency.courseIds).toEqual(['comp-course-1', 'comp-course-2'])
      expect(comp.isLoading()).toBe(false)
    })

    it('marks a program In-Progress when some enrolled courses are incomplete', async () => {
      comp.configData = { programs: [{ type: 'course', playlistConfigId: 'PL_STATIC' }] }
      comp.userEnrollCourse = [
        { identifier: 'course-1', completionPercentage: 100 },
        { identifier: 'unrelated', completionPercentage: 100 },
      ]
      await comp.ngOnInit()
      expect(comp.programData()[0].programStatus).toBe('In-Progress')
    })

    it('marks a program Completed when every playlist course is finished', async () => {
      comp.configData = { programs: [{ type: 'course', playlistConfigId: 'PL_STATIC' }] }
      comp.userEnrollCourse = [
        { identifier: 'course-1', completionPercentage: 100 },
        { identifier: 'course-2', completionPercentage: 100 },
      ]
      await comp.ngOnInit()
      expect(comp.programData()[0].programStatus).toBe('Completed')
    })

    it('leaves programStatus empty without enrolled courses', async () => {
      comp.configData = { programs: [{ type: 'course', playlistConfigId: 'PL_STATIC' }] }
      await comp.ngOnInit()
      expect(comp.programData()[0].programStatus).toBe('')
    })

    it('marks competency programs In-Progress when some courses are enrolled', async () => {
      comp.configData = { programs: [{ type: 'competency', playlistConfigId: 'PL_COMPETENCY' }] }
      comp.userEnrollCourse = [
        { identifier: 'comp-course-1', completionPercentage: 50 },
      ]
      await comp.ngOnInit()
      expect(comp.programData()[0].programStatus).toBe('In-Progress')
    })

    it('marks competency programs Completed when all courses are finished', async () => {
      comp.configData = { programs: [{ type: 'competency', playlistConfigId: 'PL_COMPETENCY' }] }
      comp.userEnrollCourse = [
        { identifier: 'comp-course-1', completionPercentage: 100 },
        { identifier: 'comp-course-2', completionPercentage: 100 },
      ]
      await comp.ngOnInit()
      expect(comp.programData()[0].programStatus).toBe('Completed')
    })

    it('handles missing configData without throwing', async () => {
      comp.configData = undefined
      await comp.ngOnInit()
      expect(comp.programData()).toBeUndefined()
      expect(comp.isLoading()).toBe(false)
    })
  })

  describe('playlist lookups', () => {
    it('getStaticPlaylistForLang matches id, type, language, and validity', () => {
      const playlists = [staticPlaylist, { ...staticPlaylist, language: 'hi' }]
      expect(comp.getStaticPlaylistForLang(playlists, 'PL_STATIC', 'en')).toBe(staticPlaylist)
      expect(comp.getStaticPlaylistForLang(playlists, 'PL_STATIC', 'ta')).toBeNull()
      expect(comp.getStaticPlaylistForLang(playlists, 'MISSING', 'en')).toBeNull()
    })

    it('getCompetencyPlaylistForLang matches competency playlists regardless of language', () => {
      const playlists = [staticPlaylist, competencyPlaylist]
      expect(comp.getCompetencyPlaylistForLang(playlists, 'PL_COMPETENCY')).toBe(competencyPlaylist)
      expect(comp.getCompetencyPlaylistForLang(playlists, 'PL_STATIC')).toBeNull()
    })

    it('isValidPlaylist requires a typed data source with a non-empty payload', () => {
      expect(comp.isValidPlaylist(staticPlaylist)).toBe(true)
      expect(comp.isValidPlaylist({ dataSource: { type: 'static', payload: [] } })).toBe(false)
      expect(comp.isValidPlaylist({ dataSource: { payload: ['x'] } })).toBe(false)
      expect(comp.isValidPlaylist(null)).toBe(false)
    })
  })

  describe('extractCourseIdsFromCompetency', () => {
    it('extracts course IDs from competency playlist structure', () => {
      const result = comp['extractCourseIdsFromCompetency'](competencyPlaylist)
      expect(result).toEqual(['comp-course-1', 'comp-course-2'])
    })

    it('returns empty array for invalid payload', () => {
      const invalidPlaylist = { dataSource: { payload: null } }
      const result = comp['extractCourseIdsFromCompetency'](invalidPlaylist)
      expect(result).toEqual([])
    })

    it('handles missing competency levels gracefully', () => {
      const invalidPlaylist = {
        dataSource: {
          payload: [
            {
              'HEALTH_ED': {
                competencyId: 'comp-001',
                additionalProperties: {},
              },
            },
          ],
        },
      }
      const result = comp['extractCourseIdsFromCompetency'](invalidPlaylist)
      expect(result).toEqual([])
    })

    it('deduplicates course IDs', () => {
      const duplicatePlaylist = {
        dataSource: {
          payload: [
            {
              'COMP1': {
                additionalProperties: {
                  competencyLevelDescription: [
                    { course: [{ id: 'course-1' }] },
                  ],
                },
              },
            },
            {
              'COMP2': {
                additionalProperties: {
                  competencyLevelDescription: [
                    { course: [{ id: 'course-1' }] },
                  ],
                },
              },
            },
          ],
        },
      }
      const result = comp['extractCourseIdsFromCompetency'](duplicatePlaylist)
      expect(result).toEqual(['course-1'])
    })
  })

  describe('calculateProgramStatus', () => {
    it('returns empty string when no course IDs', () => {
      const result = comp['calculateProgramStatus']([], [])
      expect(result).toBe('')
    })

    it('returns empty string when no enrolled courses match', () => {
      const result = comp['calculateProgramStatus'](
        ['course-1'],
        [{ identifier: 'course-2', completionPercentage: 100 }]
      )
      expect(result).toBe('')
    })

    it('returns In-Progress when some courses are started', () => {
      const result = comp['calculateProgramStatus'](
        ['course-1', 'course-2'],
        [
          { identifier: 'course-1', completionPercentage: 50 },
          { identifier: 'course-2', completionPercentage: 0 },
        ]
      )
      expect(result).toBe('In-Progress')
    })

    it('returns Completed when all courses are finished', () => {
      const result = comp['calculateProgramStatus'](
        ['course-1', 'course-2'],
        [
          { identifier: 'course-1', completionPercentage: 100 },
          { identifier: 'course-2', completionPercentage: 100 },
        ]
      )
      expect(result).toBe('Completed')
    })
  })

  it('openProgram stores the program and flips the detail signals', () => {
    const program = { name: 'Program A' }
    comp.openProgram(program)
    expect(comp.programList).toBe(program)
    expect(mockPlaylistSvc.selectedProgram.set).toHaveBeenCalledWith(program)
    expect(mockPlaylistSvc.showDetails.set).toHaveBeenCalledWith(true)
    expect(comp.showDetails()).toBe(true)
  })
})
