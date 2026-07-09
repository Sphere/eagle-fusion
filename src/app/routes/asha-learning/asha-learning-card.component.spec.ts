import { SimpleChange } from '@angular/core'
import { AshaLearningCardComponent } from './asha-learning-card.component'

describe('AshaLearningCardComponent', () => {
  let comp: AshaLearningCardComponent
  let mockRouter: any

  const normalizedCompetency = (overrides: any = {}) => ({
    id: '10',
    title: 'Communication',
    levels: [
      { level: 1, levelName: 'Beginner', course: [{ id: 'c1' }], completed: true },
      { level: 2, levelName: 'Intermediate', course: [{ id: 'c2' }] },
      { level: 3, levelName: 'Advanced', course: [{ id: 'c3' }] },
    ],
    ...overrides,
  })

  beforeEach(() => {
    mockRouter = { navigate: jest.fn() }
    comp = new AshaLearningCardComponent(mockRouter)
  })

  it('should create', () => {
    expect(comp).toBeTruthy()
  })

  it('ngOnChanges rebuilds the card when the competency input changes', () => {
    comp.competency = normalizedCompetency()
    comp.ngOnChanges({ competency: new SimpleChange(undefined, comp.competency, true) })
    expect(comp.title).toBe('Communication')
    expect(comp.levels).toHaveLength(3)
    expect(comp.competencyId).toBe('10')
  })

  describe('buildCard', () => {
    it('derives completion, progress, current level, and labels', () => {
      comp.competency = normalizedCompetency()
      comp.buildCard()
      expect(comp.completedLevelCount).toBe(1)
      expect(comp.completedLevels).toEqual([1])
      expect(comp.progressPercentage).toBe(33)
      expect(comp.currentLevel).toBe(2)
      expect(comp.ctaLabel).toBe('START_COURSE')
      expect(comp.noteLabel).toBe('COMPLETE_LEVEL_COURSE')
    })

    it('marks levels completed from passFailStatus or status fields', () => {
      comp.competency = normalizedCompetency({
        levels: [
          { level: 1, passFailStatus: 'Pass' },
          { level: 2, status: 'Pass' },
          { level: 3, status: 'completed' },
          { level: 4 },
        ],
      })
      comp.buildCard()
      expect(comp.completedLevels).toEqual([1, 2, 3])
    })

    it('falls back to a generated title and level names', () => {
      comp.competency = { id: '5', levels: [{}] }
      comp.buildCard()
      expect(comp.title).toBe('Competency 5')
      expect(comp.levels[0].level).toBe(1)
      expect(comp.levels[0].levelName).toBe('Level 1')
    })
  })

  describe('normalizeCompetency', () => {
    it('returns empty levels for a missing payload', () => {
      expect(comp.normalizeCompetency(null)).toEqual({ levels: [] })
    })

    it('passes through an already normalized payload', () => {
      const payload = normalizedCompetency()
      expect(comp.normalizeCompetency(payload)).toBe(payload)
    })

    it('unwraps an array payload whose first item is normalized', () => {
      const payload = normalizedCompetency()
      expect(comp.normalizeCompetency([payload])).toBe(payload)
    })

    it('normalizes a keyed playlist competency with level descriptions', () => {
      const payload = {
        comp1: {
          id: 7,
          name: 'Nutrition',
          additionalProperties: {
            competencyLevelDescription: [
              { level: 1, levelName: 'Basics', description: 'd1', course: [{ id: 'c1' }] },
              { levelName: 'No level id — skipped' },
            ],
          },
        },
      }
      const result = comp.normalizeCompetency(payload)
      expect(result.id).toBe(7)
      expect(result.title).toBe('Nutrition')
      expect(result.levels).toEqual([
        { level: 1, levelName: 'Basics', description: 'd1', course: [{ id: 'c1' }] },
      ])
    })
  })

  describe('extractCourseIds', () => {
    it('reads ids from a course array', () => {
      expect(comp.extractCourseIds({ course: [{ id: 'a' }, { identifier: 'b' }, {}] })).toEqual(['a', 'b'])
    })

    it('reads a courseIds array directly', () => {
      expect(comp.extractCourseIds({ courseIds: ['a', '', 'b'] })).toEqual(['a', 'b'])
    })

    it('returns empty for missing input', () => {
      expect(comp.extractCourseIds(null)).toEqual([])
      expect(comp.extractCourseIds({})).toEqual([])
    })
  })

  describe('getProgressPercentage', () => {
    it('prefers an explicit progressPercentage', () => {
      expect(comp.getProgressPercentage({ progressPercentage: 55 })).toBe(55)
    })

    it('computes from a progress array of pass entries', () => {
      comp.competency = normalizedCompetency()
      comp.buildCard()
      const percentage = comp.getProgressPercentage({
        progress: [{ passFailStatus: 'Pass' }, { passFailStatus: 'Fail' }],
      })
      expect(percentage).toBe(33)
    })

    it('falls back to completed level count', () => {
      comp.competency = normalizedCompetency()
      comp.buildCard()
      expect(comp.getProgressPercentage({})).toBe(33)
    })
  })

  describe('labels and level state', () => {
    it('getActionLabel suggests the assessment when there are no levels', () => {
      comp.levels = []
      expect(comp.getActionLabel()).toBe('START_SELF_ASSESSMENT')
    })

    it('getActionLabel suggests the assessment when the next level has no courses', () => {
      comp.competency = normalizedCompetency({
        levels: [{ level: 1, levelName: 'Beginner' }],
      })
      comp.buildCard()
      expect(comp.ctaLabel).toBe('START_SELF_ASSESSMENT')
      expect(comp.noteLabel).toBe('COMPLETE_LEVEL_ASSESSMENT')
    })

    it('getNoteLabel congratulates at full progress', () => {
      comp.competency = normalizedCompetency({
        levels: [{ level: 1, course: [{ id: 'c1' }], completed: true }],
      })
      comp.buildCard()
      expect(comp.noteLabel).toBe('YOU_CLEAR_ALL_LEVELS')
    })

    it('getNoteLabel congratulates when no incomplete level even below full progress', () => {
      comp.levels = [
        { level: 1, levelName: 'L1', courseIds: ['c1'], completed: true },
      ]
      comp.progressPercentage = 50
      expect(comp.getNoteLabel()).toBe('YOU_CLEAR_ALL_LEVELS')
    })

    it('getLevelState reports completed, current, and pending', () => {
      comp.competency = normalizedCompetency()
      comp.buildCard()
      expect(comp.getLevelState(comp.levels[0])).toBe('completed')
      expect(comp.getLevelState(comp.levels[1])).toBe('current')
      expect(comp.getLevelState(comp.levels[2])).toBe('pending')
    })

    it('getCurrentLevel falls back to the last level when all are complete', () => {
      comp.competency = normalizedCompetency({
        levels: [
          { level: 1, completed: true },
          { level: 2, completed: true },
        ],
      })
      comp.buildCard()
      expect(comp.currentLevel).toBe(2)
    })
  })

  it('toggleExpand flips the flag and emits the change', () => {
    const emitted: boolean[] = []
    comp.expandedChange.subscribe(v => emitted.push(v))
    comp.toggleExpand()
    comp.toggleExpand()
    expect(emitted).toEqual([true, false])
  })

  describe('onActionClick', () => {
    it('navigates to the course toc when the CTA is a course', () => {
      comp.competency = normalizedCompetency()
      comp.buildCard()
      comp.onActionClick()
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/toc/c2/overview'], {
        queryParams: {
          competencyid: '10',
          levelId: 2,
          courseid: 'c2',
          isAsha: true,
        },
      })
    })

    it('navigates to the self assessment when the CTA is an assessment with a course id', () => {
      comp.competency = normalizedCompetency()
      comp.buildCard()
      comp.ctaLabel = 'START_SELF_ASSESSMENT'
      comp.onActionClick()
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/user/self-assessment'], {
        queryParams: {
          contentId: 'c2',
          competencyId: '10',
          level: 2,
          isAsha: true,
        },
      })
    })

    it('falls back to the competency page without any course id', () => {
      comp.competency = normalizedCompetency({
        levels: [{ level: 1, levelName: 'Beginner' }],
      })
      comp.buildCard()
      comp.onActionClick()
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/user/competency'])
    })
  })

  it('trackByLevel returns the level number', () => {
    expect(comp.trackByLevel(0, { level: 4 } as any)).toBe(4)
  })
})
