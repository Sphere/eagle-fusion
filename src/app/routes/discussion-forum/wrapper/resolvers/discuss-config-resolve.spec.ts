jest.mock('@ws-widget/utils', () => ({
  ConfigurationsService: class {
    nodebbUserProfile = null
  },
}))

jest.mock('../service/discuss-utils.service', () => ({
  DiscussUtilsService: class {
    setDiscussionConfig = jest.fn()
    getDiscussionConfig = jest.fn().mockReturnValue(null)
  },
}))

import { DiscussConfigResolve } from './discuss-config-resolve'
import { DiscussUtilsService } from '../service/discuss-utils.service'
import { ConfigurationsService } from '@ws-widget/utils'

describe('DiscussConfigResolve', () => {
  let resolver: DiscussConfigResolve
  let mockDiscussUtilsSvc: any
  let mockConfigSvc: any

  beforeEach(() => {
    localStorage.clear()
    mockDiscussUtilsSvc = new DiscussUtilsService()
    mockConfigSvc = new ConfigurationsService()
    resolver = new DiscussConfigResolve(mockDiscussUtilsSvc, mockConfigSvc as any)
  })

  afterEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  it('should create', () => {
    expect(resolver).toBeTruthy()
  })

  it('calls setConfig in the constructor', () => {
    expect(mockDiscussUtilsSvc.setDiscussionConfig).toHaveBeenCalled()
  })

  it('setConfig calls discussUtilitySvc.setDiscussionConfig with menu options', () => {
    const call = mockDiscussUtilsSvc.setDiscussionConfig.mock.calls[0][0]
    expect(call.menuOptions).toHaveLength(4)
    expect(call.menuOptions[0].route).toBe('all-discussions')
    expect(call.menuOptions[1].route).toBe('categories')
    expect(call.menuOptions[2].route).toBe('tags')
    expect(call.menuOptions[3].route).toBe('my-discussion')
  })

  it('setConfig stores config in localStorage under "home"', () => {
    const stored = JSON.parse(localStorage.getItem('home') || '{}')
    expect(stored.routerSlug).toBe('/app')
    expect(stored.bannerOption).toBe(true)
  })

  it('setConfig uses nodebbUserProfile.username when available', () => {
    mockConfigSvc.nodebbUserProfile = { username: 'testuser', email: 'test@test.com' }
    resolver = new DiscussConfigResolve(mockDiscussUtilsSvc, mockConfigSvc as any)
    const call = mockDiscussUtilsSvc.setDiscussionConfig.mock.calls[1][0]
    expect(call.userName).toBe('testuser')
  })

  it('setConfig falls back to empty string for userName when nodebbUserProfile is null', () => {
    mockConfigSvc.nodebbUserProfile = null
    resolver = new DiscussConfigResolve(mockDiscussUtilsSvc, mockConfigSvc as any)
    const call = mockDiscussUtilsSvc.setDiscussionConfig.mock.calls[1][0]
    expect(call.userName).toBe('')
  })

  it('setConfig returns config from getDiscussionConfig when it is set', () => {
    const fakeConfig = { menuOptions: [], userName: 'user' }
    mockDiscussUtilsSvc.getDiscussionConfig.mockReturnValue(fakeConfig)
    const result = resolver.setConfig()
    expect(result).toBe(fakeConfig)
  })

  it('setConfig returns built config when getDiscussionConfig returns null', () => {
    mockDiscussUtilsSvc.getDiscussionConfig.mockReturnValue(null)
    const result = resolver.setConfig()
    expect(result.routerSlug).toBe('/app')
  })
})
