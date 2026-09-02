import { TestBed } from '@angular/core/testing'
import { AppDateAdapter, APP_DATE_FORMATS, changeformat, startWithYearformat } from './format-datepicker'

describe('format-datepicker', () => {
  describe('AppDateAdapter', () => {
    let adapter: AppDateAdapter

    beforeEach(() => {
      TestBed.runInInjectionContext(() => {
        adapter = new AppDateAdapter()
      })
    })

    it('should create', () => {
      expect(adapter).toBeTruthy()
    })

    it('should format date with padded day and month for input display', () => {
      const date = new Date(2023, 0, 5)
      expect(adapter.format(date, 'input')).toBe('05-01-2023')
    })

    it('should format date without padding when day and month are double digit', () => {
      const date = new Date(2023, 10, 25)
      expect(adapter.format(date, 'input')).toBe('25-11-2023')
    })

    it('should return toDateString for non-input display formats', () => {
      const date = new Date(2023, 0, 5)
      expect(adapter.format(date, 'other')).toBe(date.toDateString())
    })
  })

  describe('APP_DATE_FORMATS', () => {
    it('should have expected structure', () => {
      expect(APP_DATE_FORMATS.display.dateInput).toBe('input')
      expect(APP_DATE_FORMATS.parse.dateInput).toEqual({ month: 'short', year: 'numeric', day: 'numeric' })
      expect(APP_DATE_FORMATS.display.monthYearLabel).toEqual({ year: 'numeric', month: 'numeric' })
      expect(APP_DATE_FORMATS.display.dateA11yLabel).toEqual({ year: 'numeric', month: 'long', day: 'numeric' })
      expect(APP_DATE_FORMATS.display.monthYearA11yLabel).toEqual({ year: 'numeric', month: 'long' })
    })
  })

  describe('changeformat', () => {
    it('should pad single digit day and month', () => {
      const date = new Date(2023, 0, 5)
      expect(changeformat(date)).toBe('05-01-2023')
    })

    it('should not pad double digit day and month', () => {
      const date = new Date(2023, 10, 25)
      expect(changeformat(date)).toBe('25-11-2023')
    })
  })

  describe('startWithYearformat', () => {
    it('should pad single digit day and month and prefix year', () => {
      const date = new Date(2023, 0, 5)
      expect(startWithYearformat(date)).toBe('2023-01-05')
    })

    it('should not pad double digit day and month', () => {
      const date = new Date(2023, 10, 25)
      expect(startWithYearformat(date)).toBe('2023-11-25')
    })
  })
})
