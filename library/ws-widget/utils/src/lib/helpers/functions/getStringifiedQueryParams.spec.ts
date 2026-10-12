import { getStringifiedQueryParams } from './getStringifiedQueryParams'

describe('getStringifiedQueryParams', () => {
  it('should return an empty string for an empty object', () => {
    expect(getStringifiedQueryParams({})).toBe('')
  })

  it('should join a single pair without a separator', () => {
    expect(getStringifiedQueryParams({ q: 'nursing' })).toBe('q=nursing')
  })

  it('should join multiple pairs with ampersands', () => {
    expect(getStringifiedQueryParams({ q: 'nursing', page: 2 })).toBe('q=nursing&page=2')
  })

  it('should drop entries with falsy values', () => {
    expect(getStringifiedQueryParams({ a: '', b: 0, c: undefined, d: 'kept' })).toBe('d=kept')
  })

  it('should comma-join array values', () => {
    expect(getStringifiedQueryParams({ tags: ['a', 'b'] })).toBe('tags=a,b')
  })

  it('should drop an empty array value', () => {
    expect(getStringifiedQueryParams({ tags: [], q: 'x' })).toBe('tags=&q=x')
  })
})
