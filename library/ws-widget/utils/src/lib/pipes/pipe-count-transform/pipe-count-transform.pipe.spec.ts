import { PipeCountTransformPipe } from './pipe-count-transform.pipe'

describe('PipeCountTransformPipe', () => {
  let pipe: PipeCountTransformPipe

  beforeEach(() => {
    pipe = new PipeCountTransformPipe()
  })

  it('should create', () => {
    expect(pipe).toBeTruthy()
  })

  it('should return "0" for zero and negative values', () => {
    expect(pipe.transform(0)).toBe('0')
    expect(pipe.transform(-5)).toBe('0')
  })

  it('should return the raw value below one thousand', () => {
    expect(pipe.transform(1)).toBe('1')
    expect(pipe.transform(999)).toBe('999')
  })

  it('should drop the trailing ".0" for whole thousands', () => {
    expect(pipe.transform(1000)).toBe('1K')
    expect(pipe.transform(20000)).toBe('20K')
  })

  it('should keep one decimal for partial thousands', () => {
    expect(pipe.transform(1500)).toBe('1.5K')
    expect(pipe.transform(999999)).toBe('1000K')
  })

  it('should drop the trailing ".0" for whole millions', () => {
    expect(pipe.transform(1000000)).toBe('1M')
    expect(pipe.transform(5000000)).toBe('5M')
  })

  it('should keep one decimal for partial millions', () => {
    expect(pipe.transform(1500000)).toBe('1.5M')
    expect(pipe.transform(12300000)).toBe('12.3M')
  })
})
