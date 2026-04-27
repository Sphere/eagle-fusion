import { Injectable, signal, effect } from '@angular/core'

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly STORAGE_KEY = 'theme'

  // ✅ Signal instead of BehaviorSubject
  private darkMode = signal<boolean>(false)

  // Optional readonly exposure
  readonly isDarkMode = this.darkMode.asReadonly()

  constructor() {
    this.initTheme()
    this.watchSystemTheme()
    // ✅ Auto apply whenever value changes
    effect(() => {
      this.applyTheme(this.darkMode())
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
}