jest.mock('../../services/leadership.service', () => ({
  LeadershipService: class {
    randomId = 'abc123'
  },
}))

import { TweetsComponent } from './tweets.component'

describe('TweetsComponent', () => {
  let component: TweetsComponent
  let mockLeaderSvc: any

  beforeEach(() => {
    mockLeaderSvc = { randomId: 'xyz789' }
    component = new TweetsComponent(mockLeaderSvc)
    // Clean up any script tags added
    document.querySelectorAll('script[id^="tweetScript"]').forEach(el => el.remove())
  })

  afterEach(() => {
    document.querySelectorAll('script[id^="tweetScript"]').forEach(el => el.remove())
    jest.clearAllMocks()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should default twitterUrl to empty string', () => {
    expect(component.twitterUrl).toBe('')
  })

  it('should default hasTweetScriptLoaded to false', () => {
    expect(component.hasTweetScriptLoaded).toBe(false)
  })

  it('should return empty string when hasTweetScriptLoaded is true', () => {
    component.hasTweetScriptLoaded = true
    const result = component.loadScript()
    expect(result).toBe('')
  })

  it('should append script tag on loadScript() when not loaded', () => {
    component.loadScript(false)
    const scriptEl = document.getElementById('tweetScript')
    expect(scriptEl).toBeTruthy()
  })

  it('should append script with twitter src on first load', () => {
    component.loadScript(false)
    const scriptEl = document.getElementById('tweetScript')
    expect(scriptEl?.getAttribute('src')).toBe('https://platform.twitter.com/widgets.js')
  })

  it('should accept twitterUrl input', () => {
    component.twitterUrl = 'https://twitter.com/someUser'
    expect(component.twitterUrl).toBe('https://twitter.com/someUser')
  })
})
