jest.mock('../../../../../library/ws-widget/collection/src/public-api', () => ({
  WidgetContentService: class {},
}))

import { of } from 'rxjs'
import { AshaLearningComponent } from './asha-learning.component'

describe('AshaLearningComponent', () => {
  let comp: AshaLearningComponent
  let mockRouter: any
  let mockTranslate: any
  let mockContentSvc: any
  let mockLogger: any

  const buildData = (progress: any[] = [], overrides: any = {}) => ({
    competencyID: '1',
    title: 'Communication',
    contentId: 'root-course',
    lang: 'en',
    levels: [1, 2, 3, 4, 5].map(level => ({
      competencyId: 1,
      level,
      course: `course-${level}`,
    })),
    progress,
    ...overrides,
  })

  const adminProgress = [{ levelId: 1, contentType: 'admin', passFailStatus: 'Pass' }]

  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => undefined)
    jest.spyOn(console, 'error').mockImplementation(() => undefined)
    mockRouter = { navigate: jest.fn() }
    mockTranslate = {
      instant: jest.fn((key: string) => key),
      getCurrentLang: jest.fn().mockReturnValue('en'),
    }
    mockContentSvc = {
      setAshaCardData: jest.fn(),
      setAshaData: jest.fn(),
      getFilteredCourseSearchResults: jest.fn().mockReturnValue(of({ result: { content: [] } })),
    }
    mockLogger = { log: jest.fn(), error: jest.fn(), warn: jest.fn() }
    comp = new AshaLearningComponent(mockRouter, mockTranslate, mockContentSvc, mockLogger)
    comp.ashaData = buildData()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should create', () => {
    expect(comp).toBeTruthy()
  })

  it('ngOnInit applies the expand input', () => {
    comp.expand = true
    comp.ngOnInit()
    expect(comp.isExpanded).toBe(true)
  })

  it('ngOnChanges recomputes level style and next-level info when ashaData changes', () => {
    const styleSpy = jest.spyOn(comp, 'getLevelStyle')
    comp.ngOnChanges({ ashaData: {} } as any)
    expect(styleSpy).toHaveBeenCalled()
    expect(comp.nextLevelInfo).toEqual({ highestLevelEntries: [], label: 'START_SELF_ASSESSMENT' })
  })

  it('toggleExpand flips the expanded state', () => {
    comp.toggleExpand()
    expect(comp.isExpanded).toBe(true)
    comp.toggleExpand()
    expect(comp.isExpanded).toBe(false)
  })

  describe('isAdminGrantedProgress / getEarnedProgress', () => {
    it('is false without progress', () => {
      expect(comp.isAdminGrantedProgress()).toBe(false)
    })

    it('is true when every entry is admin granted', () => {
      comp.ashaData = buildData(adminProgress)
      expect(comp.isAdminGrantedProgress()).toBe(true)
    })

    it('is false for mixed progress and getEarnedProgress drops admin entries', () => {
      comp.ashaData = buildData([
        ...adminProgress,
        { levelId: 1, contentType: 'course', passFailStatus: 'Pass' },
      ])
      expect(comp.isAdminGrantedProgress()).toBe(false)
      expect(comp.getEarnedProgress()).toEqual([{ levelId: 1, contentType: 'course', passFailStatus: 'Pass' }])
    })
  })

  describe('getNextLevelEntriesAndLabel', () => {
    it('suggests the self assessment when there is no progress', () => {
      const result = comp.getNextLevelEntriesAndLabel(comp.ashaData)
      expect(result).toEqual({ highestLevelEntries: [], label: 'START_SELF_ASSESSMENT' })
    })

    it('suggests the self assessment when progress is admin granted', () => {
      comp.ashaData = buildData(adminProgress)
      const result = comp.getNextLevelEntriesAndLabel(comp.ashaData)
      expect(result.label).toBe('START_SELF_ASSESSMENT')
    })

    it('suggests the course after a failed self assessment', () => {
      comp.ashaData = buildData([{ levelId: 1, contentType: 'selfAssessment', passFailStatus: 'Fail' }])
      const result = comp.getNextLevelEntriesAndLabel(comp.ashaData)
      expect(result.label).toBe('START_COURSE')
      expect(result.highestLevelEntries).toHaveLength(1)
    })

    it('falls back to the highest completed level after a passed self assessment', () => {
      comp.ashaData = buildData([{ levelId: 1, contentType: 'selfAssessment', passFailStatus: 'Pass' }])
      const result = comp.getNextLevelEntriesAndLabel(comp.ashaData)
      expect(result.label).toBe('START_SELF_ASSESSMENT')
    })

    it('suggests the course when the next incomplete level holds a course entry', () => {
      comp.ashaData = buildData([
        { levelId: 1, contentType: 'selfAssessment', passFailStatus: 'Pass' },
        { levelId: 2, contentType: 'course', passFailStatus: 'Fail' },
      ])
      const result = comp.getNextLevelEntriesAndLabel(comp.ashaData)
      expect(result.label).toBe('START_COURSE')
    })
  })

  describe('startSelfAssesment', () => {
    const makeEvent = () => ({ stopPropagation: jest.fn() }) as any

    it('stores the card data and stops event propagation', () => {
      const event = makeEvent()
      const data = buildData()
      comp.ashaData = data
      comp.startSelfAssesment(data, event)
      expect(event.stopPropagation).toHaveBeenCalled()
      expect(mockContentSvc.setAshaCardData).toHaveBeenCalledWith(data)
    })

    it('navigates to the self assessment when progress is admin granted', () => {
      const data = buildData(adminProgress)
      comp.ashaData = data
      comp.startSelfAssesment(data, makeEvent())
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/user/self-assessment'], { queryParams: data })
    })

    it('navigates to the self assessment when there is no progress', () => {
      const data = buildData()
      comp.startSelfAssesment(data, makeEvent())
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/user/self-assessment'], { queryParams: data })
    })

    it('navigates to the self assessment after a passed assessment with no course progress', () => {
      const data = buildData([{ levelId: 1, contentType: 'selfAssessment', passFailStatus: 'Pass' }])
      comp.ashaData = data
      comp.startSelfAssesment(data, makeEvent())
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/user/self-assessment'], { queryParams: data })
    })

    it('fetches and navigates to the next incomplete level course after a passed course', () => {
      mockContentSvc.getFilteredCourseSearchResults.mockReturnValue(of({
        result: { content: [{ identifier: 'course-2', batches: [{ batchId: 'b2' }] }] },
      }))
      const data = buildData([{ levelId: 1, contentType: 'course', passFailStatus: 'Pass' }])
      comp.ashaData = data
      comp.startSelfAssesment(data, makeEvent())
      expect(comp.btnName).toBe('Continue')
      expect(mockContentSvc.getFilteredCourseSearchResults).toHaveBeenCalledWith('course-2')
      expect(mockContentSvc.setAshaData).toHaveBeenCalledWith(expect.objectContaining({
        isAsha: true,
        batchid: 'b2',
        contentid: 'course-2',
        competencylevel: 2,
        competencyid: '1',
        competencyName: 'Communication',
      }))
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/toc/course-2/overview'], {
        queryParams: {
          primaryCategory: 'Course',
          batchId: 'b2',
          competencyid: '1',
          levelId: 2,
          courseid: 'root-course',
          isAsha: true,
        },
      })
    })

    it('does nothing when every level is already cleared', () => {
      const data = buildData([1, 2, 3, 4, 5].map(level => ({
        levelId: level, contentType: 'course', passFailStatus: 'Pass',
      })))
      comp.ashaData = data
      comp.startSelfAssesment(data, makeEvent())
      expect(mockContentSvc.getFilteredCourseSearchResults).not.toHaveBeenCalled()
      expect(mockRouter.navigate).not.toHaveBeenCalled()
    })

    it('skips the course search when no course maps to the level and language', () => {
      const data = buildData(
        [{ levelId: 1, contentType: 'course', passFailStatus: 'Pass' }],
        {
          levels: [
            { competencyId: 1, level: 1, course: 'course-1' },
            { competencyId: 1, level: 2, course: null },
          ],
        }
      )
      comp.ashaData = data
      comp.startSelfAssesment(data, makeEvent())
      expect(mockContentSvc.getFilteredCourseSearchResults).not.toHaveBeenCalled()
      expect(mockRouter.navigate).not.toHaveBeenCalled()
    })
  })

  describe('getCourseId', () => {
    it('returns the course id matching the competency, level, and language', () => {
      expect(comp.getCourseId('1', '3', comp.ashaData)).toBe('course-3')
    })

    it('returns the course id regardless of ashaData language', () => {
      mockTranslate.getCurrentLang.mockReturnValue('hi')
      const data = buildData([], { lang: undefined })
      expect(comp.getCourseId('1', '3', data)).toBe('course-3')
    })

    it('returns null when nothing matches', () => {
      expect(comp.getCourseId('99', '3', comp.ashaData)).toBeNull()
    })
  })

  describe('getNavigationData', () => {
    it('prefers content matching both course id and language', () => {
      const res = [
        { identifier: 'other', lang: 'en' },
        { identifier: 'course-2', lang: 'en' },
      ]
      expect(comp.getNavigationData(res, 2)).toEqual({ identifier: 'course-2', lang: 'en' })
    })

    it('falls back to a course id match alone', () => {
      const res = [{ identifier: 'course-2', lang: 'ta' }]
      expect(comp.getNavigationData(res, 2)).toEqual({ identifier: 'course-2', lang: 'ta' })
    })

    it('returns null when ashaData is missing', () => {
      comp.ashaData = undefined
      expect(comp.getNavigationData([{ identifier: 'course-2' }], 2)).toBeNull()
    })

    it('returns undefined when nothing matches', () => {
      expect(comp.getNavigationData([{ identifier: 'other', lang: 'en' }], 2)).toBeUndefined()
    })
  })

  describe('getCompletionPercentage', () => {
    it('returns 0 and keeps the button for admin granted progress', () => {
      comp.ashaData = buildData(adminProgress)
      expect(comp.getCompletionPercentage()).toBe(0)
      expect(comp.showBtn).toBe(true)
    })

    it('returns 0 and keeps the button when there is no progress', () => {
      expect(comp.getCompletionPercentage()).toBe(0)
      expect(comp.showBtn).toBe(true)
    })

    it('returns the pass percentage across five levels', () => {
      comp.ashaData = buildData([
        { levelId: 1, contentType: 'course', passFailStatus: 'Pass' },
        { levelId: 2, contentType: 'course', passFailStatus: 'Pass' },
        { levelId: 3, contentType: 'course', passFailStatus: 'Fail' },
      ])
      expect(comp.getCompletionPercentage()).toBe(40)
      expect(comp.showBtn).toBe(true)
    })

    it('hides the button at 100 percent', () => {
      comp.ashaData = buildData([1, 2, 3, 4, 5].map(level => ({
        levelId: level, contentType: 'course', passFailStatus: 'Pass',
      })))
      expect(comp.getCompletionPercentage()).toBe(100)
      expect(comp.showBtn).toBe(false)
    })
  })

  describe('getLevelStyle', () => {
    it('resets everything for admin granted progress', () => {
      comp.ashaData = buildData(adminProgress)
      comp.getLevelStyle()
      expect(comp.completedLevels).toEqual([])
      expect(comp.failedLevels).toEqual([])
      expect(comp.currentLevel).toBe(0)
    })

    it('maps pass and fail entries and points at the next level', () => {
      comp.ashaData = buildData([
        { levelId: 1, contentType: 'course', passFailStatus: 'Pass' },
        { levelId: 2, contentType: 'course', passFailStatus: 'Pass' },
        { levelId: 3, contentType: 'course', passFailStatus: 'Fail' },
      ])
      comp.getLevelStyle()
      expect(comp.completedLevels).toEqual([1, 2])
      expect(comp.failedLevels).toEqual([3])
      expect(comp.currentLevel).toBe(2)
    })

    it('sets currentLevel to the total when every level is complete', () => {
      comp.ashaData = buildData([1, 2, 3, 4, 5].map(level => ({
        levelId: level, contentType: 'course', passFailStatus: 'Pass',
      })))
      comp.getLevelStyle()
      expect(comp.currentLevel).toBe(5)
    })
  })

  describe('getLevelNote', () => {
    it('returns the default note without progress', () => {
      expect(comp.getLevelNote()).toBe('LEVEL_NOTE')
    })

    it('returns the default note for admin granted progress', () => {
      comp.ashaData = buildData(adminProgress)
      expect(comp.getLevelNote()).toBe('LEVEL_NOTE')
    })

    it('congratulates when every level is passed', () => {
      comp.ashaData = buildData([1, 2, 3, 4, 5].map(level => ({
        levelId: level, contentType: 'course', passFailStatus: 'Pass',
      })))
      expect(comp.getLevelNote()).toBe('YOU_CLEAR_ALL_LEVELS')
      expect(mockTranslate.instant).toHaveBeenCalledWith('YOU_CLEAR_ALL_LEVELS')
    })

    it('asks to clear the course after a failed course', () => {
      comp.ashaData = buildData([{ levelId: 1, contentType: 'course', passFailStatus: 'Fail' }])
      expect(comp.getLevelNote()).toBe('NOTE_CLEAR_COURSE')
      expect(mockTranslate.instant).toHaveBeenCalledWith('NOTE_CLEAR_COURSE', { nextLevel: 1 })
    })

    it('asks to clear the assessment after a failed assessment', () => {
      comp.ashaData = buildData([{ levelId: 1, contentType: 'selfAssessment', passFailStatus: 'Fail' }])
      expect(comp.getLevelNote()).toBe('NOTE_CLEAR_ASSESSMENT')
    })

    it('points at the next level after a passed course', () => {
      comp.ashaData = buildData([{ levelId: 1, contentType: 'course', passFailStatus: 'Pass' }])
      expect(comp.getLevelNote()).toBe('COMPLETE_LEVEL_COURSE')
      expect(mockTranslate.instant).toHaveBeenCalledWith('COMPLETE_LEVEL_COURSE', { nextLevel: 2 })
    })

    it('points at the next level after a passed assessment', () => {
      comp.ashaData = buildData([{ levelId: 1, contentType: 'selfAssessment', passFailStatus: 'Pass' }])
      expect(comp.getLevelNote()).toBe('COMPLETE_LEVEL_ASSESSMENT')
    })
  })
})
