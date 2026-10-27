import { secureRandom, secureRandomInt, secureRandomString, secureShuffle } from './secureRandom'

describe('secureRandom helpers', () => {
  let getRandomValues: jest.SpyInstance

  beforeEach(() => {
    getRandomValues = jest.spyOn(globalThis.crypto, 'getRandomValues')
  })

  afterEach(() => {
    getRandomValues.mockRestore()
  })

  /** Makes getRandomValues fill every slot with the given values, in turn. */
  const feed = (...values: number[]) => {
    let call = 0
    getRandomValues.mockImplementation((buffer: Uint32Array) => {
      buffer.forEach((_value, index) => {
        buffer[index] = values[call % values.length]
        call += 1
      })
      return buffer
    })
  }

  describe('secureRandom', () => {
    it('uses crypto.getRandomValues', () => {
      secureRandom()
      expect(getRandomValues).toHaveBeenCalledWith(expect.any(Uint32Array))
    })

    it('maps the 32-bit range onto [0, 1)', () => {
      feed(0)
      expect(secureRandom()).toBe(0)
      feed(2 ** 31)
      expect(secureRandom()).toBe(0.5)
      feed(2 ** 32 - 1)
      expect(secureRandom()).toBeLessThan(1)
    })

    it('returns values in [0, 1) with the real crypto source', () => {
      getRandomValues.mockRestore()
      for (let i = 0; i < 200; i += 1) {
        const value = secureRandom()
        expect(value).toBeGreaterThanOrEqual(0)
        expect(value).toBeLessThan(1)
      }
    })
  })

  describe('secureRandomInt', () => {
    it('returns the crypto value modulo max', () => {
      feed(0)
      expect(secureRandomInt(5)).toBe(0)
      feed(9)
      expect(secureRandomInt(5)).toBe(4)
      feed(2 ** 31)
      expect(secureRandomInt(10)).toBe(8)
    })

    it('redraws values from the uneven tail of the 32-bit range so results are unbiased', () => {
      // 2^32 % 5 === 1, so 2^32 - 1 is the single biased value and must be rejected
      feed(2 ** 32 - 1, 7)
      expect(secureRandomInt(5)).toBe(2)
      expect(getRandomValues).toHaveBeenCalledTimes(2)
    })

    it('drops the fractional part of max', () => {
      feed(9)
      expect(secureRandomInt(5.7)).toBe(4)
    })

    it('returns 0 for a max below 1 or not a number, without drawing randomness', () => {
      expect(secureRandomInt(0)).toBe(0)
      expect(secureRandomInt(0.5)).toBe(0)
      expect(secureRandomInt(-3)).toBe(0)
      expect(secureRandomInt(Number.NaN)).toBe(0)
      expect(getRandomValues).not.toHaveBeenCalled()
    })

    it('stays in [0, max) with the real crypto source', () => {
      getRandomValues.mockRestore()
      for (let i = 0; i < 200; i += 1) {
        const value = secureRandomInt(7)
        expect(Number.isInteger(value)).toBe(true)
        expect(value).toBeGreaterThanOrEqual(0)
        expect(value).toBeLessThan(7)
      }
    })
  })

  describe('secureRandomString', () => {
    it('defaults to 8 base-36 characters', () => {
      expect(secureRandomString()).toMatch(/^[0-9a-z]{8}$/)
    })

    it('honours the requested length', () => {
      expect(secureRandomString(3)).toHaveLength(3)
    })

    it('maps each value onto a base-36 digit', () => {
      feed(10, 35, 36)
      expect(secureRandomString(3)).toBe('az0')
    })
  })

  describe('secureShuffle', () => {
    it('shuffles in place and returns the same array with the same members', () => {
      getRandomValues.mockRestore()
      const items = [1, 2, 3, 4, 5, 6]
      const result = secureShuffle(items)
      expect(result).toBe(items)
      expect([...result].sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6])
    })

    it('swaps each position with the drawn index', () => {
      // Always draw 0 -> each element from the end swaps with the first: [a,b,c] -> [b,c,a]
      feed(0)
      expect(secureShuffle(['a', 'b', 'c'])).toEqual(['b', 'c', 'a'])
    })

    it('handles empty and single-item arrays', () => {
      expect(secureShuffle([])).toEqual([])
      expect(secureShuffle(['only'])).toEqual(['only'])
      expect(getRandomValues).not.toHaveBeenCalled()
    })
  })
})
