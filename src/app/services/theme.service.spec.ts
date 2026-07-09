jest.mock('@angular/core', () => ({
  ...jest.requireActual('@angular/core'),
  effect: (fn: any) => { (globalThis as any).__themeEffectFn = fn; fn(); return {} },
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
    document.querySelectorAll('#dynamic-theme-overrides').forEach(el => el.remove())
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

    it('returns early via applyOrgColors when in dark mode', async () => {
      service.setTheme(true)
      await service.applyOrgTheme({ primary: '#1c5d95' })
      expect(document.getElementById('dynamic-theme-overrides')).toBeNull()
    })

    it('skips unknown keys and empty values when applying org colors', async () => {
      service.setTheme(false)
      await service.applyOrgTheme({ primary: '#123456', bogusKey: '#fff', white: '' } as any)
      const tag = document.getElementById('dynamic-theme-overrides')
      expect(tag?.innerHTML).toContain('--theme-primary: #123456')
      expect(tag?.innerHTML).not.toContain('--theme-surface')
    })
  })

  describe('effect reactions', () => {
    it('applies org colors when light mode and themeConfig set', () => {
      service.setTheme(false)
      service.themeConfig = { primary: '#abcabc' }
      ;(globalThis as any).__themeEffectFn()
      const tag = document.getElementById('dynamic-theme-overrides')
      expect(tag?.innerHTML).toContain('--theme-primary: #abcabc')
    })

    it('removes style tag when switching to dark mode', () => {
      const tag = document.createElement('style')
      tag.id = 'dynamic-theme-overrides'
      document.head.appendChild(tag)
      service.setTheme(true)
      ;(globalThis as any).__themeEffectFn()
      expect(document.getElementById('dynamic-theme-overrides')).toBeNull()
    })
  })

  describe('system preference and watcher', () => {
    it('uses system preference (dark) when nothing saved', () => {
      localStorage.clear()
      ;(window.matchMedia as jest.Mock).mockReturnValue({ matches: true, addEventListener: jest.fn() })
      const svc = new ThemeService()
      expect(svc.isDark()).toBe(true)
    })

    it('auto-switches on system change when no stored preference', () => {
      let handler: any
      ;(window.matchMedia as jest.Mock).mockReturnValue({
        matches: false,
        addEventListener: (_e: string, h: any) => { handler = h },
      })
      const svc = new ThemeService()
      localStorage.clear()
      handler({ matches: true })
      expect(svc.isDark()).toBe(true)
    })

    it('does not auto-switch on system change when preference stored', () => {
      let handler: any
      ;(window.matchMedia as jest.Mock).mockReturnValue({
        matches: false,
        addEventListener: (_e: string, h: any) => { handler = h },
      })
      const svc = new ThemeService()
      svc.setTheme(false)
      handler({ matches: true })
      expect(svc.isDark()).toBe(false)
    })
  })
})
