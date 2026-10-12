import { PipeDurationTransformPipe } from './pipe-duration-transform.pipe'

describe('PipeDurationTransformPipe', () => {
  let pipe: PipeDurationTransformPipe

  beforeEach(() => {
    pipe = new PipeDurationTransformPipe()
  })

  it('should create', () => {
    expect(pipe).toBeTruthy()
  })

  it('should return an empty string for zero or negative durations', () => {
    expect(pipe.transform(0, 'hms')).toBe('')
    expect(pipe.transform(-10, 'hms')).toBe('')
  })

  describe('hms', () => {
    it('should render hours, minutes and seconds', () => {
      expect(pipe.transform(3661, 'hms')).toBe('1h 1m')
      expect(pipe.transform(3600, 'hms')).toBe('1h')
    })

    it('should render minutes and seconds when under an hour', () => {
      expect(pipe.transform(90, 'hms')).toBe('1m 30s')
      expect(pipe.transform(45, 'hms')).toBe('45s')
      expect(pipe.transform(120, 'hms')).toBe('2m')
    })

    it('should omit seconds once hours are present', () => {
      // 7250s == 2h 0m 50s — the seconds are suppressed because the hour component is set.
      expect(pipe.transform(7250, 'hms')).toBe('2h')
    })
  })

  describe('mnts', () => {
    it('should render bare numbers for hours and minutes', () => {
      expect(pipe.transform(3661, 'mnts')).toBe('1 1')
      expect(pipe.transform(90, 'mnts')).toBe('1 30')
      expect(pipe.transform(45, 'mnts')).toBe('45')
      expect(pipe.transform(3600, 'mnts')).toBe('1')
    })
  })

  describe('hour', () => {
    it('should render "less than an hour" under 3600 seconds', () => {
      expect(pipe.transform(59, 'hour')).toBe('less than an hour')
    })

    it('should render the singular for exactly one hour', () => {
      expect(pipe.transform(3600, 'hour')).toBe('1 hour')
    })

    it('should render the plural beyond one hour', () => {
      expect(pipe.transform(7200, 'hour')).toBe('2 hours')
    })
  })

  describe('time24 / default', () => {
    it('should substitute "00" for a zero minute or second component', () => {
      expect(pipe.transform(30, 'time24')).toBe('00:30')
      expect(pipe.transform(60, 'time24')).toBe('1:00'.replace('1', ' 1'))
    })

    it('should pad single-digit components with a space (padStart has no pad char)', () => {
      expect(pipe.transform(3600, 'time24')).toBe(' 1:00:00')
      expect(pipe.transform(61, 'time24')).toBe(' 1: 1')
    })

    it('should omit the hour component below an hour', () => {
      expect(pipe.transform(125, 'time24')).toBe(' 2: 5')
    })

    it('should fall back to the default formatting for an unknown type', () => {
      expect(pipe.transform(30, 'unknown' as any)).toBe('00:30')
    })
  })
})
