jest.mock('../../../../library/ws-widget/utils/src/public-api', () => ({
  LoggerService: class {
    log = jest.fn()
    warn = jest.fn()
    error = jest.fn()
  },
}))

import { DropdownDobComponent } from './dropdown-dob.component'
import { ChangeDetectorRef } from '@angular/core'

describe('DropdownDobComponent', () => {
  let component: DropdownDobComponent
  let mockCdr: ChangeDetectorRef
  let mockLogger: any

  beforeEach(() => {
    mockCdr = { detectChanges: jest.fn(), markForCheck: jest.fn() } as any
    mockLogger = { log: jest.fn(), warn: jest.fn(), error: jest.fn() }

    component = new DropdownDobComponent(mockCdr, mockLogger)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should create the component', () => {
    expect(component).toBeTruthy()
  })

  it('should have correct default property values', () => {
    expect(component.dateType).toBe('dob')
    expect(component.isEkshamata).toBe(false)
    expect(component.dob).toBeUndefined()
    expect(component.dateValue).toEqual([])
    expect(component.yearsValue).toEqual([])
    expect(component.monthValue).toHaveLength(12)
    expect(component.monthValue[0]).toEqual({ id: 1, name: 'January' })
    expect(component.monthValue[11]).toEqual({ id: 12, name: 'December' })
  })

  it('should initialize dobForm with required validators', () => {
    expect(component.dobForm).toBeDefined()
    expect(component.dobForm.get('dateField')).toBeTruthy()
    expect(component.dobForm.get('monthField')).toBeTruthy()
    expect(component.dobForm.get('yearField')).toBeTruthy()
    expect(component.dobForm.invalid).toBe(true)
  })

  describe('ngOnInit', () => {
    it('should call initYear on ngOnInit', () => {
      jest.spyOn(component, 'initYear')
      component.ngOnInit()
      expect(component.initYear).toHaveBeenCalled()
    })

    it('should disable the form when isEkshamata is true', () => {
      component.isEkshamata = true
      component.ngOnInit()
      expect(component.dobForm.disabled).toBe(true)
    })

    it('should not disable the form when isEkshamata is false', () => {
      component.isEkshamata = false
      component.ngOnInit()
      expect(component.dobForm.disabled).toBe(false)
    })
  })

  describe('initYear', () => {
    it('should populate yearsValue for dob type (18 to 100 years ago)', () => {
      component.dateType = 'dob'
      component.initYear()
      const currentYear = new Date().getFullYear()
      expect(component.yearsValue[0]).toBe(currentYear - 18)
      expect(component.yearsValue[component.yearsValue.length - 1]).toBe(currentYear - 99)
      expect(component.yearsValue).toHaveLength(82)
    })

    it('should populate yearsValue for joining type (1950 to current year)', () => {
      component.dateType = 'joining'
      component.initYear()
      const currentYear = new Date().getFullYear()
      expect(component.yearsValue[0]).toBe(currentYear)
      expect(component.yearsValue[component.yearsValue.length - 1]).toBe(1950)
    })

    it('should log the dateType via logger', () => {
      component.dateType = 'dob'
      component.initYear()
      expect(mockLogger.log).toHaveBeenCalledWith('this.dataType', 'dob')
    })
  })

  describe('updateDays', () => {
    it('should populate dateValue with correct days for a given month', () => {
      component.dobForm.patchValue({ yearField: 2020 })
      component.updateDays(1) // January has 31 days
      expect(component.dateValue).toHaveLength(31)
      expect(component.dateValue[0]).toBe(1)
      expect(component.dateValue[30]).toBe(31)
    })

    it('should populate dateValue with 28 days for February in a non-leap year', () => {
      component.dobForm.patchValue({ yearField: 2021 })
      component.updateDays(2)
      expect(component.dateValue).toHaveLength(28)
    })

    it('should populate dateValue with 29 days for February in a leap year', () => {
      component.dobForm.patchValue({ yearField: 2024 })
      component.updateDays(2)
      expect(component.dateValue).toHaveLength(29)
    })

    it('should reset dateField if current value exceeds days in selected month', () => {
      component.dobForm.patchValue({ yearField: 2021, dateField: 31 })
      component.updateDays(2) // February has max 28 days
      expect(component.dobForm.get('dateField')!.value).toBe('')
    })

    it('should not reset dateField if current value is within days in month', () => {
      component.dobForm.patchValue({ yearField: 2021, dateField: 15 })
      component.updateDays(2) // February has 28 days; 15 is valid
      expect(component.dobForm.get('dateField')!.value).toBe(15)
    })

    it('should use fallback year 2020 when yearField is empty', () => {
      component.dobForm.patchValue({ yearField: '' })
      component.updateDays(2) // February 2020 is a leap year
      expect(component.dateValue).toHaveLength(29)
    })
  })

  describe('updateForm', () => {
    it('should patch the form values when dob input is provided', () => {
      component.dob = '15/6/1990'
      component.updateForm()
      expect(component.dobForm.get('dateField')!.value).toBe(15)
      expect(component.dobForm.get('monthField')!.value).toBe(6)
      expect(component.dobForm.get('yearField')!.value).toBe(1990)
    })

    it('should call updateDays with the parsed month when dob is provided', () => {
      jest.spyOn(component, 'updateDays')
      component.dob = '10/3/1985'
      component.updateForm()
      expect(component.updateDays).toHaveBeenCalledWith(3)
    })

    it('should not patch the form when dob is undefined', () => {
      component.dob = undefined
      component.updateForm()
      expect(component.dobForm.get('dateField')!.value).toBe('')
      expect(component.dobForm.get('monthField')!.value).toBe('')
      expect(component.dobForm.get('yearField')!.value).toBe('')
    })
  })

  describe('countrySelect', () => {
    it('should emit the formatted dob string when form is valid', () => {
      jest.spyOn(component.dobValue, 'emit')
      component.dobForm.patchValue({ dateField: 10, monthField: 5, yearField: 1990 })
      component.countrySelect()
      expect(component.dobValue.emit).toHaveBeenCalledWith('10/5/1990')
    })

    it('should not emit when form is invalid', () => {
      jest.spyOn(component.dobValue, 'emit')
      component.dobForm.patchValue({ dateField: '', monthField: '', yearField: '' })
      component.countrySelect()
      expect(component.dobValue.emit).not.toHaveBeenCalled()
    })

    it('should not emit when only some fields are filled', () => {
      jest.spyOn(component.dobValue, 'emit')
      component.dobForm.patchValue({ dateField: 10, monthField: '', yearField: 1990 })
      component.countrySelect()
      expect(component.dobValue.emit).not.toHaveBeenCalled()
    })
  })

  describe('monthField valueChanges reactivity', () => {
    it('should call updateDays when monthField value changes', () => {
      jest.spyOn(component, 'updateDays')
      component.dobForm.get('monthField')!.setValue(4)
      expect(component.updateDays).toHaveBeenCalledWith(4)
    })

    it('should call updateDays when yearField changes and monthField has a value', () => {
      jest.spyOn(component, 'updateDays')
      component.dobForm.get('monthField')!.setValue(3)
      jest.clearAllMocks()
      component.dobForm.get('yearField')!.setValue(2000)
      expect(component.updateDays).toHaveBeenCalledWith(3)
    })

    it('should not call updateDays when yearField changes and monthField is empty', () => {
      jest.spyOn(component, 'updateDays')
      component.dobForm.get('monthField')!.setValue(null)
      jest.clearAllMocks()
      component.dobForm.get('yearField')!.setValue(2000)
      expect(component.updateDays).not.toHaveBeenCalled()
    })
  })
})
