import { DiscussUtilsService } from './discuss-utils.service'

describe('DiscussUtilsService', () => {
  let service: DiscussUtilsService

  beforeEach(() => {
    service = new DiscussUtilsService()
  })

  it('should create', () => {
    expect(service).toBeTruthy()
  })

  it('discussionCnfig is undefined initially', () => {
    expect(service.discussionCnfig).toBeUndefined()
  })

  it('setDiscussionConfig stores config', () => {
    service.setDiscussionConfig({ enabled: true, host: 'forum.example.com' })
    expect(service.getDiscussionConfig()).toEqual({ enabled: true, host: 'forum.example.com' })
  })

  it('getDiscussionConfig returns stored config', () => {
    service.setDiscussionConfig({ key: 'value' })
    expect(service.getDiscussionConfig()).toEqual({ key: 'value' })
  })

  describe('stringToColor', () => {
    it('returns an HSL color string', () => {
      const result = service.stringToColor('hello')
      expect(result).toMatch(/^hsl\(\d+,100%,30%\)$/)
    })

    it('returns different colors for different strings', () => {
      expect(service.stringToColor('alice')).not.toBe(service.stringToColor('bob'))
    })

    it('returns the same color for the same string', () => {
      expect(service.stringToColor('test')).toBe(service.stringToColor('test'))
    })

    it('handles empty string without throwing', () => {
      expect(() => service.stringToColor('')).not.toThrow()
    })
  })

  describe('getContrast', () => {
    it('always returns the hardcoded rgba string', () => {
      expect(service.getContrast('#ffffff')).toBe('rgba(255, 255, 255, 80%)')
      expect(service.getContrast('#000000')).toBe('rgba(255, 255, 255, 80%)')
    })
  })
})
