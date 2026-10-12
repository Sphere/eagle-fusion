import { ConditionCheckService } from './condition-check.service'
import { NSContent } from '../../../interface/content'

describe('ConditionCheckService', () => {
  let service: ConditionCheckService

  const content: any = {
    contentType: 'Course',
    mediaType: 'video',
  }

  beforeEach(() => {
    service = new ConditionCheckService()
  })

  it('should create', () => {
    expect(service).toBeTruthy()
  })

  describe('checkConditionV2', () => {
    it('should return true when no conditions passed', () => {
      expect(service.checkConditionV2(content as NSContent.IContentMeta)).toBe(true)
    })

    it('should return false when notFit matches', () => {
      const conditions = {
        notFit: [{ contentType: ['Course'] }],
      } as any
      expect(service.checkConditionV2(content, conditions)).toBe(false)
    })

    it('should return true when notFit does not match and no fit condition', () => {
      const conditions = {
        notFit: [{ contentType: ['Collection'] }],
      } as any
      expect(service.checkConditionV2(content, conditions)).toBe(true)
    })

    it('should return true when notFit does not match and fit matches', () => {
      const conditions = {
        notFit: [{ contentType: ['Collection'] }],
        fit: [{ contentType: ['Course'] }],
      } as any
      expect(service.checkConditionV2(content, conditions)).toBe(true)
    })

    it('should return false when notFit does not match but fit does not match', () => {
      const conditions = {
        notFit: [{ contentType: ['Collection'] }],
        fit: [{ contentType: ['Collection'] }],
      } as any
      expect(service.checkConditionV2(content, conditions)).toBe(false)
    })

    it('should return false when notFit matches and skip evaluating fit', () => {
      const conditions = {
        notFit: [{ contentType: ['Course'] }],
        fit: [{ contentType: ['Course'] }],
      } as any
      expect(service.checkConditionV2(content, conditions)).toBe(false)
    })

    it('should evaluate only fit when notFit is empty array', () => {
      const conditions = {
        notFit: [],
        fit: [{ contentType: ['Course'] }],
      } as any
      expect(service.checkConditionV2(content, conditions)).toBe(true)
    })

    it('should return true when conditions object has neither fit nor notFit', () => {
      const conditions = {} as any
      expect(service.checkConditionV2(content, conditions)).toBe(true)
    })
  })

  describe('checkUniqueCondition', () => {
    it('should return true when conditions includes wildcard *', () => {
      expect(service.checkUniqueCondition(content, '*' as any)).toBe(true)
    })

    it('should return true when some condition matches', () => {
      const conditions = [{ contentType: ['Course'] }] as any
      expect(service.checkUniqueCondition(content, conditions)).toBe(true)
    })

    it('should return false when no condition matches', () => {
      const conditions = [{ contentType: ['Collection'] }] as any
      expect(service.checkUniqueCondition(content, conditions)).toBe(false)
    })

    it('should return false when a key in condition fails while others pass', () => {
      const conditions = [{ contentType: ['Course'], mediaType: ['image'] }] as any
      expect(service.checkUniqueCondition(content, conditions)).toBe(false)
    })

    it('should return true when multiple keys all pass', () => {
      const conditions = [{ contentType: ['Course'], mediaType: ['video'] }] as any
      expect(service.checkUniqueCondition(content, conditions)).toBe(true)
    })

    it('should return false and catch exception when conditions is malformed', () => {
      const conditions: any = null
      expect(service.checkUniqueCondition(content, conditions)).toBe(false)
    })
  })
})
