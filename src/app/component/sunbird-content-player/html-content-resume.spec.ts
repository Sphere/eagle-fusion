import {
  clearLocalResume, currentUserId, LOCAL_RESUME_PREFIX, localResumeKey, readLocalResume, resumeFromHistory, ResumeSaveThrottle,
  saveLocalResume,
} from './html-content-resume'

describe('html-content-resume', () => {
  beforeEach(() => localStorage.clear())

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

  describe('browser storage (local copies), per user', () => {
    it('keys a position by user and content', () => {
      expect(localResumeKey('u1', 'do_a')).toBe(`${LOCAL_RESUME_PREFIX}u1:do_a`)
      expect(localResumeKey(null, 'do_a')).toBeNull()
      expect(localResumeKey('u1', '')).toBeNull()
    })

    it('saves, reads and clears per user and content', () => {
      saveLocalResume('u1', 'do_a', { si: 1 })
      saveLocalResume('u2', 'do_a', { si: 2 })
      expect(readLocalResume('u1', 'do_a')).toEqual({ si: 1 })
      expect(readLocalResume('u2', 'do_a')).toEqual({ si: 2 })
      expect(readLocalResume('u1', 'do_b')).toBeNull()
      clearLocalResume('u1', 'do_a')
      expect(readLocalResume('u1', 'do_a')).toBeNull()
      expect(readLocalResume('u2', 'do_a')).toEqual({ si: 2 })
    })

    it('stores and returns nothing without a user', () => {
      saveLocalResume(null, 'do_a', { si: 1 })
      expect(localStorage.length).toBe(0)
      expect(readLocalResume(undefined, 'do_a')).toBeNull()
      expect(() => clearLocalResume(null, 'do_a')).not.toThrow()
    })

    it('never throws when storage is broken or the value is not JSON', () => {
      localStorage.setItem(`${LOCAL_RESUME_PREFIX}u1:do_a`, '{oops')
      expect(readLocalResume('u1', 'do_a')).toBeNull()
      const spy = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('full') })
      expect(() => saveLocalResume('u1', 'do_a', { si: 1 })).not.toThrow()
      spy.mockRestore()
      const rm = jest.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => { throw new Error('blocked') })
      expect(() => clearLocalResume('u1', 'do_a')).not.toThrow()
      rm.mockRestore()
    })
  })

  describe('currentUserId', () => {
    it('prefers the loaded profile, else the session id kept at login', () => {
      localStorage.setItem('userUUID', 'u-session')
      expect(currentUserId('u-profile')).toBe('u-profile')
      expect(currentUserId(null)).toBe('u-session')
      localStorage.removeItem('userUUID')
      expect(currentUserId(undefined)).toBeNull()
    })

    it('returns null when storage is blocked', () => {
      const spy = jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked') })
      expect(currentUserId(null)).toBeNull()
      spy.mockRestore()
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
})
