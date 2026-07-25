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
  // Real competency payloads are arrays of competency objects, not plain course-id strings —
  // v1 (legacy) nests under an arbitrary key with levels under additionalProperties, v2
  // (current) carries `levels` directly with `courseId` per level.
  const competencyPlaylist = {
    playlistId: 'PL_COMPETENCY',
    dataSource: {
      type: 'competency',
      payload: [
        {
          comp1: {
            id: 1,
            name: 'Communication',
            additionalProperties: {
              competencyLevelDescription: [
                { level: 1, name: 'Beginner', course: [{ id: 'comp-course-1', lang: 'en' }, { id: 'comp-course-1', lang: 'hi' }] },
              ],
            },
          },
        },
        {
          id: 2,
          name: 'Nutrition',
          levels: [
            { name: 'Beginner', level: 1, courseId: 'comp-course-2' },
          ],
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
      userProfile: { userId: 'user-1' },
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
      mockUserSvc.fetchUserEnrollmentWithProgress.mockReturnValue(of([]))
      await comp.ngOnInit()
      const [course, competency] = comp.programData()
      expect(course.courseCount).toBe(2)
      expect(course.payload).toEqual(['course-1', 'course-2'])
      expect(competency.courseCount).toBe(2)
      expect(competency.payload).toEqual(['comp-course-1', 'comp-course-2'])
      expect(comp.isLoading()).toBe(false)
    })

    it('marks a program In-Progress when some enrolled courses are incomplete', async () => {
      comp.configData = { programs: [{ type: 'course', playlistConfigId: 'PL_STATIC' }] }
      mockUserSvc.fetchUserEnrollmentWithProgress.mockReturnValue(of([
        { courseId: 'course-1', completionPercentage: 100 },
        { courseId: 'unrelated', completionPercentage: 100 },
      ]))
      await comp.ngOnInit()
      expect(comp.programData()[0].programStatus).toBe('In-Progress')
    })

    it('marks a program Completed when every playlist course is finished', async () => {
      comp.configData = { programs: [{ type: 'course', playlistConfigId: 'PL_STATIC' }] }
      mockUserSvc.fetchUserEnrollmentWithProgress.mockReturnValue(of([
        { courseId: 'course-1', completionPercentage: 100 },
        { courseId: 'course-2', completionPercentage: 100 },
      ]))
      await comp.ngOnInit()
      expect(comp.programData()[0].programStatus).toBe('Completed')
    })

    it('leaves programStatus empty without enrolled courses', async () => {
      comp.configData = { programs: [{ type: 'course', playlistConfigId: 'PL_STATIC' }] }
      mockUserSvc.fetchUserEnrollmentWithProgress.mockReturnValue(of([]))
      await comp.ngOnInit()
      expect(comp.programData()[0].programStatus).toBe('')
    })

    it('marks competency programs In-Progress when some courses are enrolled', async () => {
      comp.configData = { programs: [{ type: 'competency', playlistConfigId: 'PL_COMPETENCY' }] }
      mockUserSvc.fetchUserEnrollmentWithProgress.mockReturnValue(of([
        { courseId: 'comp-course-1', completionPercentage: 100 },
      ]))
      await comp.ngOnInit()
      expect(comp.programData()[0].programStatus).toBe('In-Progress')
    })

    it('marks competency programs Completed when all courses are finished', async () => {
      comp.configData = { programs: [{ type: 'competency', playlistConfigId: 'PL_COMPETENCY' }] }
      mockUserSvc.fetchUserEnrollmentWithProgress.mockReturnValue(of([
        { courseId: 'comp-course-1', completionPercentage: 100 },
        { courseId: 'comp-course-2', completionPercentage: 100 },
      ]))
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

  describe('extractCourseIdsFromCompetency', () => {
    it('extracts course ids from the legacy (v1) keyed-object shape, deduping across languages', () => {
      const payload = [{
        'UP-C2': {
          id: 'UP-C2',
          additionalProperties: {
            competencyLevelDescription: [
              { level: '1', course: [{ id: 'do_1', lang: 'en' }, { id: 'do_1', lang: 'hi' }] },
              { level: '2', course: [{ id: 'do_2', lang: 'en' }] },
            ],
          },
        },
      }]
      expect(comp.extractCourseIdsFromCompetency(payload)).toEqual(['do_1', 'do_2'])
    })

    it('extracts course ids from the current (v2) flat shape', () => {
      const payload = [{
        id: 100,
        name: 'Pregnancy Identification',
        levels: [
          { level: 1, courseId: 'do_a' },
          { level: 2, courseId: 'do_b' },
        ],
      }]
      expect(comp.extractCourseIdsFromCompetency(payload)).toEqual(['do_a', 'do_b'])
    })

    it('handles a payload mixing both shapes together', () => {
      const payload = [
        { comp1: { id: 1, additionalProperties: { competencyLevelDescription: [{ course: [{ id: 'legacy-course', lang: 'en' }] }] } } },
        { id: 2, levels: [{ courseId: 'flat-course' }] },
      ]
      expect(comp.extractCourseIdsFromCompetency(payload)).toEqual(['legacy-course', 'flat-course'])
    })

    it('returns an empty array for empty or malformed payloads', () => {
      expect(comp.extractCourseIdsFromCompetency([])).toEqual([])
      expect(comp.extractCourseIdsFromCompetency([{ comp1: { id: 1 } }, null, 'text' as any])).toEqual([])
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

  describe('calculateProgramStatus', () => {
    it('returns empty string when no course IDs', () => {
      const result = comp['calculateProgramStatus']([], [])
      expect(result).toBe('')
    })

    it('returns empty string when no enrolled courses match', () => {
      const result = comp['calculateProgramStatus'](
        ['course-1'],
        [{ courseId: 'course-2', completionPercentage: 100 }]
      )
      expect(result).toBe('')
    })

    it('returns In-Progress when some but not all matched courses are completed', () => {
      const result = comp['calculateProgramStatus'](
        ['course-1', 'course-2'],
        [
          { courseId: 'course-1', completionPercentage: 100 },
          { courseId: 'course-2', completionPercentage: 0 },
        ]
      )
      expect(result).toBe('In-Progress')
    })

    it('returns Completed when all courses are finished', () => {
      const result = comp['calculateProgramStatus'](
        ['course-1', 'course-2'],
        [
          { courseId: 'course-1', completionPercentage: 100 },
          { courseId: 'course-2', completionPercentage: 100 },
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
