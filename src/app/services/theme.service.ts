import { Injectable, signal, effect } from '@angular/core'
interface CssVarEntry {
  cssVar: string
  rgbVar?: string
}
export interface OrgThemeColors {
  bgPrimary?: string
  white?: string
  primary?: string
  bgSecondary?: string
  bgDisabled?: string
  textPrimary?: string
  textSecondary?: string
  textTernary?: string
  textInactive?: string
  textActive?: string
  textDisabled?: string
  iconPrimary?: string
  accent?: string
  textonAccent?: string
  suceess?: string
  progress?: string
  danger?: string
  border?: string
  shadow?: string
  warning?: string
  black?: string,
  ellipse?: string
}
export interface OrgThemeConfig {
  mode: string
  [key: string]: OrgThemeColors | any | undefined
}
const CSS_VAR_MAP: Record<keyof OrgThemeColors, CssVarEntry> = {
  bgPrimary: { cssVar: '--theme-app-background' },
  white: { cssVar: '--theme-surface' },
  primary: { cssVar: '--theme-primary' },
  bgSecondary: { cssVar: '--theme-bg' },
  bgDisabled: { cssVar: '--theme-bg-disabled' },
  textPrimary: { cssVar: '--theme-text' },
  textSecondary: { cssVar: '--theme-text-soft' },
  textTernary: { cssVar: '--theme-text-muted' },
  textInactive: { cssVar: '--theme-inactive' },
  textActive: { cssVar: '--theme-tab-active-text' },
  textDisabled: { cssVar: '--theme-disabled' },
  iconPrimary: { cssVar: '--icon-color' },
  accent: { cssVar: '--theme-accent' },
  textonAccent: { cssVar: '--theme-on-accent' },
  suceess: { cssVar: '--theme-success' },
  progress: { cssVar: '--theme-progress' },
  danger: { cssVar: '--theme-error' },
  border: { cssVar: '--theme-border' },
  shadow: { cssVar: '--theme-shadow' },
  warning: { cssVar: '--theme-warning' },
  black: { cssVar: '--theme-black' },
  ellipse: { cssVar: '--theme-ellipse' },
}

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly STORAGE_KEY = 'theme'

  // ✅ Signal instead of BehaviorSubject
  private darkMode = signal<boolean>(false)

  // Optional readonly exposure
  readonly isDarkMode = this.darkMode.asReadonly()
  themeConfig: any
  defaultTheme: OrgThemeColors = {
    "bgPrimary": "#f8f8f8",
    "white": "#ffffff",
    "primary": "#1c5d95",
    "bgSecondary": "#ffffff",
    "bgDisabled": "#ffffff",
    "textPrimary": "#101828",
    "textSecondary": "#8c98a8",
    "textTernary": "#5f6b7a",
    "textInactive": "#808080",
    "textActive": "#000000",
    "textDisabled": "#101828",
    "iconPrimary": "#000000de",
    "accent": "#2E6491",
    "textonAccent": "#ffffff",
    "suceess": "#89c575",
    "progress": "#469788",
    "danger": "#951c1c",
    "border": "#1c5d951f",
    "shadow": "#0f172a14",
    "warning": "#E0BE80",
    "black": "#000000",
    "ellipse": "#E7F2FA",
  }

  constructor() {
    this.initTheme()
    this.watchSystemTheme()
    // ✅ Auto apply whenever value changes
    effect(() => {
      const isDark = this.darkMode()
      this.applyTheme(isDark)
      const styleTag = document.getElementById('dynamic-theme-overrides')
      if (!isDark) {
        if (this.themeConfig) {
          this.applyOrgColors(this.themeConfig)
        }
      } else {
        if (styleTag) {
          styleTag?.remove()
        }
      }
    })
  }

  // Initialize theme on app load
  private initTheme(): void {
    const saved = localStorage.getItem(this.STORAGE_KEY)

    if (saved) {
      this.darkMode.set(saved === 'dark')
    } else {
      this.darkMode.set(this.getSystemPreference())
    }
  }

  // Toggle theme
  toggleTheme(): void {
    this.setTheme(!this.darkMode())
  }

  // Explicit setter
  setTheme(isDark: boolean): void {
    this.darkMode.set(isDark)
    localStorage.setItem(this.STORAGE_KEY, isDark ? 'dark' : 'light')
  }

  // Apply class to DOM
  private applyTheme(isDark: boolean): void {
    const html = document.documentElement
    const body = document.body

    html.classList.remove('light-theme', 'dark-theme')
    body.classList.remove('light-theme', 'dark-theme')

    const themeClass = isDark ? 'dark-theme' : 'light-theme'

    html.classList.add(themeClass)
    body.classList.add(themeClass)
  }

  // System preference
  private getSystemPreference(): boolean {
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
  }

  // Listen to system changes
  private watchSystemTheme(): void {
    const media = window.matchMedia('(prefers-color-scheme: dark)')

    media.addEventListener('change', e => {
      const saved = localStorage.getItem(this.STORAGE_KEY)

      // Only auto-switch if user hasn’t overridden
      if (!saved) {
        this.setTheme(e.matches)
      }
    })
  }

  // Getter (for non-signal usage)
  isDark(): boolean {
    return this.darkMode()
  }

  hasStoredPreference(): boolean {
    return localStorage.getItem(this.STORAGE_KEY) !== null
  }

  private applyOrgColors(colors: OrgThemeColors): void {
    if (this.isDark()) return
    const styleTagId = 'dynamic-theme-overrides'

    let styleTag = document.getElementById(styleTagId) as HTMLStyleElement

    if (!styleTag) {
      styleTag = document.createElement('style')
      styleTag.id = styleTagId
      document.head.appendChild(styleTag)
    }

    let css = `.light-theme {`;

    (Object.keys(colors) as Array<keyof OrgThemeColors>).forEach(key => {
      const value = colors[key]
      const entry = CSS_VAR_MAP[key]
      if (!entry || !value) return

      css += `${entry.cssVar}: ${value} !important;`
    })

    css += `}`

    styleTag.innerHTML = css
  }

  hexToRgbString(hex: string): string {
    hex = hex.replace('#', '')

    // Support short hex (#fff)
    if (hex.length === 3) {
      hex = hex.split('').map(c => c + c).join('')
    }

    const bigint = parseInt(hex, 16)
    const r = (bigint >> 16) & 255
    const g = (bigint >> 8) & 255
    const b = bigint & 255

    return `rgb(${r}, ${g}, ${b})`
  }
  async applyOrgTheme(themeConfig: any): Promise<void> {
    if (!themeConfig) return
    this.themeConfig = themeConfig || this.defaultTheme
    if (!this.themeConfig) return
    this.applyOrgColors(this.themeConfig)
  }

}
