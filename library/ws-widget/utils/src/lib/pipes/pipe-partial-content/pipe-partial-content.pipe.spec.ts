import { PipePartialContentPipe } from './pipe-partial-content.pipe'

describe('PipePartialContentPipe', () => {
  let pipe: PipePartialContentPipe

  beforeEach(() => {
    pipe = new PipePartialContentPipe()
  })

  it('should create', () => {
    expect(pipe).toBeTruthy()
  })

  it('should pick only the requested keys', () => {
    const value = { a: 1, b: 2, c: 3 }
    expect(pipe.transform(value, ['a', 'c'])).toEqual({ a: 1, c: 3 })
  })

  it('should skip keys whose value is falsy', () => {
    const value = { a: 0, b: '', c: null, d: 'kept' }
    expect(pipe.transform(value, ['a', 'b', 'c', 'd'])).toEqual({ d: 'kept' })
  })

  it('should skip keys that are absent from the source', () => {
    expect(pipe.transform({ a: 1 }, ['a', 'missing'])).toEqual({ a: 1 })
  })

  it('should return an empty object for an empty key list', () => {
    expect(pipe.transform({ a: 1 }, [])).toEqual({})
  })
})
