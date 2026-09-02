jest.mock('@angular/core', () => {
  const actual = jest.requireActual('@angular/core')
  return { ...actual, effect: (fn: () => void) => { fn() } }
})

jest.mock('../../../../library/ws-widget/utils/src/public-api', () => ({
  ValueService: class {
    isMobile = jest.fn().mockReturnValue(false)
  },
}))

import { WebTrustedByPageComponent } from './web-trusted-by-page.component'

describe('WebTrustedByPageComponent', () => {
  let component: WebTrustedByPageComponent
  let mockValueSvc: any
  let mockThemeSvc: any

  beforeEach(() => {
    mockValueSvc = { isMobile: jest.fn().mockReturnValue(false) }
    mockThemeSvc = { isDark: jest.fn().mockReturnValue(false) }
    component = new WebTrustedByPageComponent(mockValueSvc, mockThemeSvc)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should set isXsmall from valueSvc.isMobile() on construction', () => {
    expect(component.isXsmall).toBe(false)
  })

  it('should set isXsmall true when isMobile returns true', () => {
    mockValueSvc.isMobile.mockReturnValue(true)
    mockThemeSvc.isDark.mockReturnValue(false)
    component = new WebTrustedByPageComponent(mockValueSvc, mockThemeSvc)
    expect(component.isXsmall).toBe(true)
  })

  it('should set isDark from themeSvc.isDark() on construction', () => {
    mockThemeSvc.isDark.mockReturnValue(true)
    component = new WebTrustedByPageComponent(mockValueSvc, mockThemeSvc)
    expect(component.isDark).toBe(true)
  })

  it('should accept config input', () => {
    component.config = { data: [{ title: 'Partner 1' }] }
    expect(component.config.data[0].title).toBe('Partner 1')
  })
})
