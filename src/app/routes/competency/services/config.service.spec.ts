jest.mock('@ws-widget/utils', () => ({
  ConfigurationsService: class {
    nodebbUserProfile = { username: 'testuser' }
    unMappedUser = {
      id: 'user-id-1',
      profileDetails: { preferences: { language: 'en' } },
    }
    hostPath = 'https://sphere.aastrika.org'
  },
}))

import { ConfigService } from './config.service'
import { ConfigurationsService } from '@ws-widget/utils'

describe('ConfigService', () => {
  let service: ConfigService
  let mockConfigSvc: any

  beforeEach(() => {
    localStorage.clear()
    mockConfigSvc = new ConfigurationsService()
    service = new ConfigService(mockConfigSvc)
  })

  afterEach(() => {
    localStorage.clear()
    jest.clearAllMocks()
  })

  it('should create', () => {
    expect(service).toBeTruthy()
  })

  it('setConfig stores competency data to localStorage', () => {
    const profileData = { professionalDetails: [{ designation: 'Nurse' }] }
    const profileDetails = { personalDetails: {} }
    service.setConfig(profileData, profileDetails)
    const stored = JSON.parse(localStorage.getItem('competency') || '{}')
    expect(stored.userName).toBe('testuser')
    expect(stored.id).toBe('user-id-1')
  })

  it('setConfig replaces existing competency in localStorage', () => {
    localStorage.setItem('competency', JSON.stringify({ old: true }))
    service.setConfig({ professionalDetails: [] }, {})
    const stored = JSON.parse(localStorage.getItem('competency') || '{}')
    expect(stored).not.toHaveProperty('old')
  })

  it('setConfig sets language from user preferences', () => {
    service.setConfig({ professionalDetails: [] }, {})
    const stored = JSON.parse(localStorage.getItem('competency') || '{}')
    expect(stored.language).toBe('en')
  })

  it('setConfig defaults userName to empty string when nodebbUserProfile is falsy', () => {
    mockConfigSvc.nodebbUserProfile = null
    service.setConfig({ professionalDetails: [] }, {})
    const stored = JSON.parse(localStorage.getItem('competency') || '{}')
    expect(stored.userName).toBe('')
  })

  it('setConfig defaults userName to empty string when username is missing', () => {
    mockConfigSvc.nodebbUserProfile = {}
    service.setConfig({ professionalDetails: [] }, {})
    const stored = JSON.parse(localStorage.getItem('competency') || '{}')
    expect(stored.userName).toBe('')
  })

  it('setConfig falls back to "en" when preferences language is undefined and url has no /hi/', () => {
    mockConfigSvc.unMappedUser = { id: 'user-id-1', profileDetails: { preferences: {} } }
    service.setConfig({ professionalDetails: [] }, {})
    const stored = JSON.parse(localStorage.getItem('competency') || '{}')
    expect(stored.language).toBe('en')
  })

  it('setConfig falls back to "hi" when preferences language is undefined and url contains /hi/', () => {
    mockConfigSvc.unMappedUser = { id: 'user-id-1', profileDetails: { preferences: {} } }
    const originalLocation = window.location
    delete (window as any).location
    ;(window as any).location = { href: 'http://localhost/hi/home' }
    service.setConfig({ professionalDetails: [] }, {})
    const stored = JSON.parse(localStorage.getItem('competency') || '{}')
    expect(stored.language).toBe('hi')
    ;(window as any).location = originalLocation
  })

  it('setConfig falls back to url language when unMappedUser has no profileDetails', () => {
    mockConfigSvc.unMappedUser = { id: 'user-id-1' }
    service.setConfig({ professionalDetails: [] }, {})
    const stored = JSON.parse(localStorage.getItem('competency') || '{}')
    expect(stored.language).toBe('en')
  })
})
