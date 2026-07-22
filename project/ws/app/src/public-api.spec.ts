import { getTestBed } from '@angular/core/testing'
import * as AppPublicApi from './public-api'

describe('app public-api', () => {
  afterEach(() => {
    jest.spyOn(getTestBed(), 'resetTestingModule').mockImplementation(() => undefined as any)
  })

  it('should export the expected feature modules and services', () => {
    expect(AppPublicApi.AppTocModule).toBeDefined()
    expect(AppPublicApi.ProfileModule).toBeDefined()
    expect(AppPublicApi.SearchModule).toBeDefined()
    expect(AppPublicApi.UserProfileModule).toBeDefined()
    expect(AppPublicApi.AppDateAdapter).toBeDefined()
    expect(AppPublicApi.APP_DATE_FORMATS).toBeDefined()
    expect(typeof AppPublicApi.changeformat).toBe('function')
    expect(typeof AppPublicApi.startWithYearformat).toBe('function')
  })
})
