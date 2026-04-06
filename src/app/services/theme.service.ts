import { Injectable } from '@angular/core'
import { BehaviorSubject } from 'rxjs'

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly STORAGE_KEY = 'theme';

  private darkModeSubject = new BehaviorSubject<boolean>(false);
  darkMode$ = this.darkModeSubject.asObservable();

  constructor() {
    this.initTheme()
    this.watchSystemTheme()
  }

  // Initialize theme on app load
  private initTheme(): void {
    const saved = localStorage.getItem(this.STORAGE_KEY)

    if (saved) {
      const isDark = saved === 'dark'
      this.darkModeSubject.next(isDark)
      this.applyTheme(isDark)
    } else {
      const prefersDark = this.getSystemPreference()
      this.darkModeSubject.next(prefersDark)
      this.applyTheme(prefersDark)
    }
  }

  // Toggle theme
  toggleTheme(): void {
    const newValue = !this.darkModeSubject.value
    this.setTheme(newValue)
  }

  // Explicit setter
  setTheme(isDark: boolean): void {
    this.darkModeSubject.next(isDark)
    this.applyTheme(isDark)
    localStorage.setItem(this.STORAGE_KEY, isDark ? 'dark' : 'light')
  }

  // Apply class to DOM
  private applyTheme(isDark: boolean): void {
    const html = document.documentElement
    const body = document.body

    // REMOVE all theme classes first
    body.classList.remove('light-theme', 'dark-theme')
    html.classList.remove('light-theme', 'dark-theme')

    // ADD correct theme
    const themeClass = isDark ? 'dark-theme' : 'light-theme'

    html.classList.add(themeClass)
    body.classList.add(themeClass)
  }

  // System preference
  private getSystemPreference(): boolean {
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
  }

  // Listen to system changes (only if user hasn’t overridden)
  private watchSystemTheme(): void {
    const media = window.matchMedia('(prefers-color-scheme: dark)')

    media.addEventListener('change', (e) => {
      const saved = localStorage.getItem(this.STORAGE_KEY)

      // Only auto-switch if user hasn't chosen manually
      if (!saved) {
        this.setTheme(e.matches)
      }
    })
  }

  // Getter
  isDark(): boolean {
    return this.darkModeSubject.value
  }
}