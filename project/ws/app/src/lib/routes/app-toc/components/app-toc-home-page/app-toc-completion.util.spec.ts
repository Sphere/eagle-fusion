import { computeCourseCompletion } from './app-toc-completion.util'

describe('computeCourseCompletion', () => {
  // Course whose CURRENT hierarchy has 5 leaf resources.
  const currentIds = ['R1', 'R2', 'R3', 'R4', 'R5']

  it('excludes orphaned progress from removed resources (regression: showed 100% instead of 40%)', () => {
    // 2 of the 5 current resources complete (R1, R2); R3 in progress.
    // Progress ALSO carries 3 orphaned 100% records for resources removed from
    // the course (OLD1..OLD3) — these must not count toward the total.
    const progress = [
      { contentId: 'R1', completionPercentage: 100 },
      { contentId: 'R2', completionPercentage: 100 },
      { contentId: 'R3', completionPercentage: 0 },
      { contentId: 'OLD1', completionPercentage: 100 },
      { contentId: 'OLD2', completionPercentage: 100 },
      { contentId: 'OLD3', completionPercentage: 100 },
    ]
    // 200 (R1+R2) / (5 * 100) * 100 = 40 — matches the server completionPercentage.
    expect(computeCourseCompletion(progress, currentIds)).toBe(40)
  })

  it('reports 100% only when every current resource is complete', () => {
    const progress = currentIds.map(id => ({ contentId: id, completionPercentage: 100 }))
    expect(computeCourseCompletion(progress, currentIds)).toBe(100)
  })

  it('counts resources with no progress record as 0 via the denominator', () => {
    // Only R1 has a record; the other 4 current resources contribute 0.
    const progress = [{ contentId: 'R1', completionPercentage: 100 }]
    expect(computeCourseCompletion(progress, currentIds)).toBe(20)
  })

  it('treats missing / non-numeric completionPercentage as 0 instead of NaN', () => {
    const progress = [
      { contentId: 'R1', completionPercentage: 100 },
      { contentId: 'R2' },
      { contentId: 'R3', completionPercentage: null },
      { contentId: 'R4', completionPercentage: 'x' as any },
    ]
    // Only R1 counts: 100 / 500 * 100 = 20
    expect(computeCourseCompletion(progress, currentIds)).toBe(20)
  })

  it('returns 0 (not NaN) when the course has no current resources', () => {
    expect(computeCourseCompletion([{ contentId: 'OLD1', completionPercentage: 100 }], [])).toBe(0)
  })

  it('handles null/undefined inputs safely', () => {
    expect(computeCourseCompletion(null, currentIds)).toBe(0)
    expect(computeCourseCompletion(undefined, undefined)).toBe(0)
  })

  it('clamps to the 0–100 range', () => {
    // Defensive: even if a record carries an out-of-range value it cannot exceed 100.
    const progress = [{ contentId: 'R1', completionPercentage: 100000 }]
    expect(computeCourseCompletion(progress, currentIds)).toBe(100)
  })
})
