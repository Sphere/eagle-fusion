import { isStepChange, resumeFromHistory, ResumeSaveThrottle } from './html-content-resume'

describe('html-content-resume', () => {
  describe('resumeFromHistory', () => {
    const history = (progressdetails: unknown, completionPercentage = 40) => ({
      result: { contentList: [{ contentId: 'other' }, { contentId: 'do_a', completionPercentage, progressdetails }] },
    })

    it('reads htmlState from an object progressdetails', () => {
      expect(resumeFromHistory(history({ htmlState: { si: 1 } }), 'do_a')).toEqual({ state: { si: 1 }, completionPercentage: 40 })
    })

    it('accepts progressdetails and htmlState as JSON strings (they differ per environment)', () => {
      expect(resumeFromHistory(history(JSON.stringify({ htmlState: JSON.stringify({ si: 2 }) })), 'do_a')?.state).toEqual({ si: 2 })
    })

    it('returns no state for malformed or missing details, and null for an unknown content', () => {
      expect(resumeFromHistory(history('{bad json'), 'do_a')).toEqual({ state: null, completionPercentage: 40 })
      expect(resumeFromHistory(history(undefined, 0), 'do_a')).toEqual({ state: null, completionPercentage: 0 })
      expect(resumeFromHistory(history({}), 'do_b')).toBeNull()
      expect(resumeFromHistory({}, 'do_a')).toBeNull()
      expect(resumeFromHistory(null, 'do_a')).toBeNull()
    })
  })

  describe('ResumeSaveThrottle', () => {
    it('allows one position save per interval, and forced saves any time', () => {
      const t = new ResumeSaveThrottle(15000)
      expect(t.due(100000)).toBe(true)
      expect(t.due(105000)).toBe(false)
      expect(t.due(106000, true)).toBe(true)
      expect(t.due(115000)).toBe(false)
      expect(t.due(121000)).toBe(true)
    })
  })

  describe('isStepChange', () => {
    const base = { si: 0, qi: 0, phase: 'video', videoTime: 5, answeredQs: {}, watched: {} }
    it('is true for the first snapshot and for a new section, screen, question, answer or watched video', () => {
      expect(isStepChange(null, base)).toBe(true)
      expect(isStepChange(base, { ...base, si: 1 })).toBe(true)
      expect(isStepChange(base, { ...base, phase: 'quiz' })).toBe(true)
      expect(isStepChange(base, { ...base, qi: 1 })).toBe(true)
      expect(isStepChange(base, { ...base, answeredQs: { 's1:0': true } })).toBe(true)
      expect(isStepChange(base, { ...base, watched: { s1: true } })).toBe(true)
    })
    it('is false when only the video time moved, or there is no new snapshot', () => {
      expect(isStepChange(base, { ...base, videoTime: 15 })).toBe(false)
      expect(isStepChange(base, null)).toBe(false)
    })
  })
})
