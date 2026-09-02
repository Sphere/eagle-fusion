import { of } from 'rxjs'
import { ProfileService } from './profile.service'
import { API_END_POINTS } from '../../../../../../../../src/app/constants/apiConstants'

describe('ProfileService', () => {
  let service: ProfileService
  let http: any
  let configSvc: any

  beforeEach(() => {
    http = { get: jest.fn(() => of({})) }
    configSvc = { hostPath: 'example.com', sitePath: 'https://example.com' }
    service = new ProfileService(http, configSvc)
  })

  it('should create', () => {
    expect(service).toBeTruthy()
  })

  it('should set baseUrl from configSvc.sitePath', () => {
    expect(service.baseUrl).toBe('https://example.com')
  })

  it('should set validator_URL header using configSvc.hostPath', () => {
    expect(service.httpOptions.headers.get('validator_URL')).toBe(`https://example.com${API_END_POINTS.VALIDATE_USER}`)
  })

  describe('fetchConfigFile', () => {
    it('should call http.get with the profile config json url', () => {
      service.fetchConfigFile().subscribe()
      expect(http.get).toHaveBeenCalledWith('https://example.com/feature/profile.json')
    })
  })

  describe('timeSpent', () => {
    it('should call http.get with query params and httpOptions', () => {
      service.timeSpent('2023-01-01', '2023-01-31', 'Course', 1).subscribe()
      expect(http.get).toHaveBeenCalledWith(
        `${API_END_POINTS.TIME_SPENT}?startDate=2023-01-01&endDate=2023-01-31&isCompleted=1&contentType=Course`,
        service.httpOptions,
      )
    })
  })

  describe('nsoArtifacts', () => {
    it('should call http.get with query params and httpOptions', () => {
      service.nsoArtifacts('2023-01-01', '2023-01-31', 'Course', 0).subscribe()
      expect(http.get).toHaveBeenCalledWith(
        `${API_END_POINTS.NSO_PROGRESS}?startDate=2023-01-01&endDate=2023-01-31&isCompleted=0&contentType=Course`,
        service.httpOptions,
      )
    })
  })
})
