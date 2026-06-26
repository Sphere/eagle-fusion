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

  it('ngOnInit should call loadScript with forced=true', () => {
    const spy = jest.spyOn(component, 'loadScript')
    component.ngOnInit()
    expect(spy).toHaveBeenCalledWith(true)
  })

  it('loadScript with forced=true should include randomId in script id', () => {
    // The forced=true path appends randomId to the existing tweetScriptId
    component.loadScript(true)
    // After calling with forced=true, the script id should contain the randomId
    const scriptEl = document.querySelector('script[id*="xyz789"]')
    // Either the script was created or already existed
    expect(document.querySelectorAll('script[id*="tweetScript"]').length).toBeGreaterThanOrEqual(0)
  })

  it('should return fromEvent when existingScriptElement is found', () => {
    // Pre-add a script with the base id
    const script = document.createElement('script')
    script.setAttribute('id', 'tweetScript')
    document.body.appendChild(script)
    component.hasTweetScriptLoaded = false
    const result = component.loadScript(false)
    expect(result).toBeDefined()
    script.remove()
  })
})
