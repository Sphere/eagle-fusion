import { PipeLimitToPipe } from './pipe-limit-to.pipe'

describe('PipeLimitToPipe', () => {
  let pipe: PipeLimitToPipe

  beforeEach(() => {
    pipe = new PipeLimitToPipe()
  })

  it('should create', () => {
    expect(pipe).toBeTruthy()
  })

  it('should return null for empty or missing data', () => {
    expect(pipe.transform(null)).toBeNull()
    expect(pipe.transform(undefined)).toBeNull()
    expect(pipe.transform([])).toBeNull()
    expect(pipe.transform('')).toBeNull()
  })

  it('should slice arrays to the default limit of 5', () => {
    expect(pipe.transform([1, 2, 3, 4, 5, 6, 7])).toEqual([1, 2, 3, 4, 5])
  })

  it('should slice arrays to an explicit limit', () => {
    expect(pipe.transform([1, 2, 3, 4], 2)).toEqual([1, 2])
  })

  it('should return the whole array when shorter than the limit', () => {
    expect(pipe.transform([1, 2], 5)).toEqual([1, 2])
  })

  it('should append an ellipsis when a string is truncated', () => {
    expect(pipe.transform('abcdefgh', 3)).toBe('abc...')
  })

  it('should not append an ellipsis when the string fits the limit', () => {
    expect(pipe.transform('abc', 3)).toBe('abc')
    expect(pipe.transform('ab', 5)).toBe('ab')
  })

  it('should return null for unsupported types', () => {
    expect(pipe.transform({ length: 3 })).toBeNull()
  })
})
