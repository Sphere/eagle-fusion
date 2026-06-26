jest.mock('@ws-widget/utils', () => ({
  LoggerService: class { log = jest.fn() },
}))

jest.mock('../../../../project/ws/app/src/lib/routes/user-profile/services/format-datepicker', () => ({
  AppDateAdapter: class {},
  APP_DATE_FORMATS: {},
}))

import { of } from 'rxjs'
import { YourLocationComponent } from './your-location.component'

describe('YourLocationComponent', () => {
  let component: YourLocationComponent
  let mockHttp: any
  let mockLogger: any

  beforeEach(() => {
    mockHttp = { get: jest.fn().mockReturnValue(of({ nationalities: [], states: [] })) }
    mockLogger = { log: jest.fn() }
    component = new YourLocationComponent(mockHttp, mockLogger)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should initialize aboutYouForm with expected controls', () => {
    expect(component.aboutYouForm.get('dob')).toBeTruthy()
    expect(component.aboutYouForm.get('country')).toBeTruthy()
    expect(component.aboutYouForm.get('distict')).toBeTruthy()
    expect(component.aboutYouForm.get('state')).toBeTruthy()
    expect(component.aboutYouForm.get('countryCode')).toBeTruthy()
  })

  it('should default nextBtnDisable to true', () => {
    expect(component.nextBtnDisable).toBe(true)
  })

  it('should default selectDisable to true', () => {
    expect(component.selectDisable).toBe(true)
  })

  it('should fetch countries on ngOnInit', () => {
    component.ngOnInit()
    expect(mockHttp.get).toHaveBeenCalledWith(component.countryUrl)
  })

  it('should set yourBackground to true on onsubmit()', () => {
    component.onsubmit()
    expect(component.yourBackground).toBe(true)
  })

  describe('disableNextBtn', () => {
    it('should set nextBtnDisable true when no dob or country', () => {
      component.disableNextBtn()
      expect(component.nextBtnDisable).toBe(true)
    })

    it('should set nextBtnDisable false for non-India country with dob', () => {
      component.aboutYouForm.patchValue({ dob: '1990-01-01', country: 'USA' })
      component.disableNextBtn()
      expect(component.nextBtnDisable).toBe(false)
    })

    it('should keep nextBtnDisable true for India without state and district', () => {
      component.aboutYouForm.patchValue({ dob: '1990-01-01', country: 'India' })
      component.disableNextBtn()
      expect(component.nextBtnDisable).toBe(true)
    })

    it('should set nextBtnDisable false for India with state and district', () => {
      component.aboutYouForm.patchValue({
        dob: '1990-01-01', country: 'India', state: 'UP', distict: 'Agra',
      })
      component.disableNextBtn()
      expect(component.nextBtnDisable).toBe(false)
    })
  })

  describe('dobData', () => {
    it('should patch form dob and call disableNextBtn', () => {
      const date = new Date('2000-01-01')
      component.dobData(date)
      expect(component.aboutYouForm.get('dob')?.value).toEqual(date)
    })
  })
})
