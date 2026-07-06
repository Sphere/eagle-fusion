jest.mock('@angular/core', () => ({
  ...jest.requireActual('@angular/core'),
  effect: (fn: any) => { fn(); return {} },
}))

import { ThemeService } from './theme.service'

describe('ThemeService', () => {
  let service: ThemeService

  beforeEach(() => {
    localStorage.clear()
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockReturnValue({ matches: false, addEventListener: jest.fn() }),
    })
    service = new ThemeService()
  })

  afterEach(() => {
    localStorage.clear()
    jest.clearAllMocks()
  })

  it('should create', () => {
    expect(service).toBeTruthy()
  })

  it('isDark returns false by default', () => {
    expect(service.isDark()).toBe(false)
  })

  it('setTheme(true) makes isDark return true', () => {
    service.setTheme(true)
    expect(service.isDark()).toBe(true)
  })

  it('setTheme(false) makes isDark return false', () => {
    service.setTheme(true)
    service.setTheme(false)
    expect(service.isDark()).toBe(false)
  })

  it('toggleTheme flips from false to true', () => {
    expect(service.isDark()).toBe(false)
    service.toggleTheme()
    expect(service.isDark()).toBe(true)
  })

  it('toggleTheme flips from true to false', () => {
    service.setTheme(true)
    service.toggleTheme()
    expect(service.isDark()).toBe(false)
  })

  it('hasStoredPreference returns false when nothing in localStorage', () => {
    localStorage.removeItem('theme')
    expect(service.hasStoredPreference()).toBe(false)
  })

  it('hasStoredPreference returns true after setTheme', () => {
    service.setTheme(true)
    expect(service.hasStoredPreference()).toBe(true)
  })

  it('restores dark mode from localStorage on init', () => {
    localStorage.setItem('theme', 'dark')
    const svc2 = new ThemeService()
    expect(svc2.isDark()).toBe(true)
  })

  it('restores light mode from localStorage on init', () => {
    localStorage.setItem('theme', 'light')
    const svc2 = new ThemeService()
    expect(svc2.isDark()).toBe(false)
  })

  describe('hexToRgbString', () => {
    it('converts 6-digit hex to rgb string', () => {
      expect(service.hexToRgbString('#ffffff')).toBe('rgb(255, 255, 255)')
    })

    it('converts 3-digit hex to rgb string', () => {
      expect(service.hexToRgbString('#fff')).toBe('rgb(255, 255, 255)')
    })

    it('converts #000000 to rgb(0, 0, 0)', () => {
      expect(service.hexToRgbString('#000000')).toBe('rgb(0, 0, 0)')
    })

    it('converts a mid-range color correctly', () => {
      expect(service.hexToRgbString('#1c5d95')).toMatch(/^rgb\(\d+, \d+, \d+\)$/)
    })
  })

  describe('applyOrgTheme', () => {
    it('does not throw when themeConfig is null', async () => {
      await expect(service.applyOrgTheme(null)).resolves.not.toThrow()
    })

    it('does not throw with a valid theme config', async () => {
      await expect(service.applyOrgTheme({ primary: '#1c5d95' })).resolves.not.toThrow()
    })
  })
})
