import { of, throwError } from 'rxjs'
import { MobileDashboardService } from './mobile-dashboard.service'
import { API_END_POINTS } from 'src/app/constants/apiConstants'

describe('MobileDashboardService', () => {
  let service: MobileDashboardService
  let mockHttp: any

  const buildPlaylist = (overrides: any = {}) => [{
    playlistId: 'COMPETENCY_PLAYLIST',
    role: ['ASHA'],
    dataSource: {
      payload: [
        {
          comp1: {
            id: 1,
            name: 'Communication',
            additionalProperties: {
              competencyLevelDescription: [
                {
                  level: 1,
                  name: 'Beginner',
                  description: 'd1',
                  'lang-hi-name': 'शुरुआती',
                  'lang-hi-description': 'विवरण',
                  course: [{ id: 'c1', lang: 'en' }],
                },
                { level: 2, levelName: 'Intermediate', course: [{ id: 'c2', lang: 'en' }] },
              ],
            },
          },
        },
      ],
    },
    ...overrides,
  }]

  const buildLevels = () => [
    { competencyId: 1, name: 'Beginner', competencyName: 'Communication', level: 1, course: [{ id: 'c1', lang: 'en' }] },
    { competencyId: 1, name: 'Intermediate', competencyName: 'Communication', level: 2, course: [{ id: 'c1', lang: 'en' }] },
    { competencyId: 2, name: 'Beginner', competencyName: 'Nutrition', level: 1, course: [{ id: 'c2', lang: 'en' }] },
  ]

  beforeEach(() => {
    mockHttp = {
      post: jest.fn().mockReturnValue(of(null)),
      get: jest.fn().mockReturnValue(of(null)),
    }
    service = new MobileDashboardService(mockHttp)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should create', () => {
    expect(service).toBeTruthy()
  })

  describe('getCompetencyInfo', () => {
    it('returns null when there is no COMPETENCY_PLAYLIST item', () => {
      expect(service.getCompetencyInfo([], 'org1', 'ASHA')).toBeNull()
      expect(service.getCompetencyInfo([{ playlistId: 'OTHER' }], 'org1', 'ASHA')).toBeNull()
    })

    it('returns null when the user designation is not in the playlist roles', () => {
      expect(service.getCompetencyInfo(buildPlaylist(), 'org1', 'ANM')).toBeNull()
    })

    it('matches the designation case-insensitively', () => {
      const result = service.getCompetencyInfo(buildPlaylist(), 'org1', 'asha')
      expect(result).not.toBeNull()
      expect(result!.isUserDesignationInRoles).toBe(true)
    })

    it('returns null when the playlist has no competencies payload', () => {
      const playlist = buildPlaylist({ dataSource: { payload: [] } })
      expect(service.getCompetencyInfo(playlist, 'org1', 'ASHA')).toBeNull()
    })

    it('extracts competencyIds and flattened levels with mapped fields', () => {
      const result = service.getCompetencyInfo(buildPlaylist(), 'org1', 'ASHA', 'hi')!
      expect(result.competencyIds).toEqual([1])
      expect(result.competencyLevels).toHaveLength(2)
      expect(result.competencyLevels[0]).toEqual({
        competencyId: 1,
        name: 'Beginner',
        competencyName: 'Communication',
        level: 1,
        levelName: 'Beginner',
        description: 'd1',
        langHiName: 'शुरुआती',
        langHiDescription: 'विवरण',
        course: [{ id: 'c1', lang: 'en' }],
      })
      expect(result.competencyLevels[1].name).toBe('Intermediate')
      expect(result.competencyLevels[1].course).toEqual([{ id: 'c2', lang: 'en' }])
    })

    it('falls back to item.payload when dataSource is missing', () => {
      const playlist = buildPlaylist()
      const item: any = { ...playlist[0], dataSource: undefined, payload: playlist[0].dataSource.payload }
      const result = service.getCompetencyInfo([item], 'org1', 'ASHA')
      expect(result).not.toBeNull()
      expect(result!.competencyIds).toEqual([1])
    })
  })

  describe('getAshaData', () => {
    it('returns empty result without HTTP calls when there are no competency ids', done => {
      service.getAshaData('en', buildLevels(), [], 'u1').subscribe(res => {
        expect(res).toEqual({ ashaData: [], completedCourses: [], inProgressCourses: [] })
        expect(mockHttp.post).not.toHaveBeenCalled()
        done()
      })
    })

    it('returns empty result when there are no competency levels', done => {
      service.getAshaData('en', [], ['1'], 'u1').subscribe(res => {
        expect(res).toEqual({ ashaData: [], completedCourses: [], inProgressCourses: [] })
        done()
      })
    })

    it('builds one card per competency from the playlist levels even when APIs return nothing', done => {
      service.getAshaData('en', buildLevels(), ['1', '2'], 'u1').subscribe(res => {
        expect(res.ashaData).toHaveLength(2)
        const [first, second] = res.ashaData
        expect(first.title).toBe('Communication')
        expect(first.competencyID).toBe('1')
        expect(first.contentId).toBe('c1')
        expect(first.isAsha).toBe('true')
        expect(first.levels).toHaveLength(2)
        expect(first.levels[0].competencyName).toBeUndefined()
        expect(second.title).toBe('Nutrition')
        expect(res.completedCourses).toEqual([])
        expect(res.inProgressCourses).toHaveLength(2)
        done()
      })
    })

    it('calls the search and progress endpoints with the expected arguments', done => {
      service.getAshaData('hi', buildLevels(), ['1', '2'], 'user-42').subscribe(() => {
        expect(mockHttp.post).toHaveBeenCalledWith(
          API_END_POINTS.SEARCH_V7PUBLIC,
          expect.objectContaining({
            request: expect.objectContaining({
              filters: expect.objectContaining({ lang: 'hi', competency: [true] }),
            }),
          })
        )
        expect(mockHttp.get).toHaveBeenCalledWith(API_END_POINTS.GET_ASHA_PROGRESS('user-42'))
        done()
      })
    })

    it('enriches card titles and batch info from search results without reducing count', done => {
      mockHttp.post.mockReturnValue(of({
        result: {
          content: [{
            identifier: 'c1',
            name: 'Course One',
            contentType: 'Course',
            batches: [{ batchId: 'b1' }],
            posterImage: 'img.png',
            childNodes: ['x', 'y'],
            lang: 'en',
          }],
        },
      }))
      service.getAshaData('en', buildLevels(), ['1', '2'], 'u1').subscribe(res => {
        expect(res.ashaData).toHaveLength(2)
        const enriched = res.ashaData.find((c: any) => c.competencyID === '1')
        expect(enriched.title).toBe('Course One')
        expect(enriched.batchId).toBe('b1')
        expect(enriched.thumbnail).toBe('img.png')
        expect(enriched.childContent).toBe(2)
        expect(enriched.levels).toHaveLength(2)
        done()
      })
    })

    it('resolves the competency id from competencies_v1 when no level references the course', done => {
      mockHttp.post.mockReturnValue(of({
        result: {
          content: [{
            identifier: 'unknown-course',
            name: 'Fallback Course',
            competencies_v1: '[{"competencyId": 2}]',
          }],
        },
      }))
      service.getAshaData('en', buildLevels(), ['1', '2'], 'u1').subscribe(res => {
        const enriched = res.ashaData.find((c: any) => c.competencyID === '2')
        expect(enriched.title).toBe('Fallback Course')
        done()
      })
    })

    it('ignores search results whose competency is not in the requested ids', done => {
      mockHttp.post.mockReturnValue(of({
        result: {
          content: [{ identifier: 'other', name: 'Other Course', competencies_v1: '[{"competencyId": 99}]' }],
        },
      }))
      service.getAshaData('en', buildLevels(), ['1', '2'], 'u1').subscribe(res => {
        expect(res.ashaData.map((c: any) => c.title)).toEqual(['Communication', 'Nutrition'])
        done()
      })
    })

    it('expands a passed course across every level that course covers', done => {
      mockHttp.get.mockReturnValue(of({
        data: [{ competencyid: 1, competencylevel: 1, passFailStatus: 'Pass', contentType: 'course', attemptcount: 2 }],
      }))
      // course c1 covers levels 1 and 2 of competency 1
      service.getAshaData('en', buildLevels(), ['1', '2'], 'u1').subscribe(res => {
        const card = res.ashaData.find((c: any) => c.competencyID === '1')
        const passedLevels = card.progress
          .filter((p: any) => p.passFailStatus === 'Pass')
          .map((p: any) => p.levelId)
          .sort()
        expect(passedLevels).toEqual([1, 2])
        expect(card.progress.every((p: any) => p.completionpercentage === 100)).toBe(true)
        done()
      })
    })

    it('keeps non-course progress records alongside expanded course progress', done => {
      mockHttp.get.mockReturnValue(of({
        data: [
          { competencyid: 2, competencylevel: 1, passFailStatus: 'Fail', contentType: 'selfAssessment' },
        ],
      }))
      service.getAshaData('en', buildLevels(), ['1', '2'], 'u1').subscribe(res => {
        const card = res.ashaData.find((c: any) => c.competencyID === '2')
        expect(card.progress).toHaveLength(1)
        expect(card.progress[0]).toEqual(expect.objectContaining({
          levelId: 1,
          passFailStatus: 'Fail',
          contentType: 'selfAssessment',
        }))
        done()
      })
    })

    it('points contentId at the self-assessment course when one exists in progress', done => {
      mockHttp.get.mockReturnValue(of({
        data: [
          { competencyid: 1, competencylevel: 1, passFailStatus: 'Pass', contentType: 'selfAssessment', courseid: 'sa-course' },
        ],
      }))
      service.getAshaData('en', buildLevels(), ['1', '2'], 'u1').subscribe(res => {
        const card = res.ashaData.find((c: any) => c.competencyID === '1')
        expect(card.contentId).toBe('sa-course')
        done()
      })
    })

    it('moves a competency with all five levels passed into completedCourses', done => {
      const levels = [1, 2, 3, 4, 5].map(level => ({
        competencyId: 3,
        name: `Level ${level}`,
        competencyName: 'Hygiene',
        level,
        course: [{ id: `c3-${level}`, lang: 'en' }],
      }))
      mockHttp.get.mockReturnValue(of({
        data: [1, 2, 3, 4, 5].map(level => ({
          competencyid: 3, competencylevel: level, passFailStatus: 'Pass', contentType: 'course',
        })),
      }))
      service.getAshaData('en', levels, ['3'], 'u1').subscribe(res => {
        expect(res.completedCourses).toHaveLength(1)
        expect(res.completedCourses[0].totalPercentage).toBe(100)
        expect(res.completedCourses[0].completedLevels).toBe(5)
        expect(res.inProgressCourses).toEqual([])
        done()
      })
    })

    it('sorts in-progress cards by competencyID and expands only the first', done => {
      service.getAshaData('en', buildLevels(), ['1', '2'], 'u1').subscribe(res => {
        expect(res.inProgressCourses.map((c: any) => c.competencyID)).toEqual(['1', '2'])
        expect(res.inProgressCourses[0].expand).toBe(true)
        expect(res.inProgressCourses[1].expand).toBe(false)
        done()
      })
    })

    it('recovers with playlist-only cards when result processing throws', done => {
      // content with a truthy length but no .map forces the map() operator to throw
      mockHttp.post.mockReturnValue(of({ result: { content: { length: 1 } } }))
      service.getAshaData('en', buildLevels(), ['1', '2'], 'u1').subscribe(res => {
        expect(res.ashaData).toHaveLength(2)
        expect(res.ashaData[0].title).toBe('Communication')
        done()
      })
    })

    it('still emits cards when both endpoints error', done => {
      mockHttp.post.mockReturnValue(throwError(() => new Error('search down')))
      mockHttp.get.mockReturnValue(throwError(() => new Error('progress down')))
      service.getAshaData('en', buildLevels(), ['1', '2'], 'u1').subscribe(res => {
        expect(res.ashaData).toHaveLength(2)
        expect(res.inProgressCourses).toHaveLength(2)
        done()
      })
    })
  })
})
