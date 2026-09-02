import { Component, OnInit, OnDestroy } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Subject } from 'rxjs'
import { takeUntil } from 'rxjs/operators'
import { DowntimeConfigService } from '../../services/downtime-config.service'
import { DowntimeContent, DowntimeCssConfig } from '../../models/downtime.model'
import { LanguageService } from '../../services/language.service'

/**
 * DowntimeFullComponent
 *
 * Displays a full-screen maintenance page when the application is in full downtime mode.
 * Features:
 * - Center-aligned layout
 * - Multilingual support
 * - Dynamic styling from configuration
 * - Responsive design for desktop and tablet
 * - No background interaction allowed
 */
@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-downtime-full',
  templateUrl: './downtime-full.component.html',
  styleUrls: ['./downtime-full.component.scss'],
})
export class DowntimeFullComponent implements OnInit, OnDestroy {
  content: DowntimeContent | null = null
  currentLanguage = 'en'
  cssConfig: DowntimeCssConfig | null = null
  isLoading = true
  currentDowntimeState: any = null

  private readonly destroy$ = new Subject<void>()

  constructor(
    private readonly downtimeService: DowntimeConfigService,
    private readonly languageService: LanguageService,
  ) { }

  ngOnInit(): void {
    this.initializeComponent()
    this.subscribeToLanguageChanges()
    this.subscribeToDowntimeUpdates()
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }

  /**
   * Initialize the component with current downtime state
   */
  private initializeComponent(): void {
    const state = this.downtimeService.getCurrentDowntimeState()
    this.currentDowntimeState = state
    if (state.isDowntime && state.type === 'full' && !this.downtimeService.isBypassed()) {
      this.content = state.content
      this.cssConfig = state.content.css || null
    }
    this.isLoading = false
  }

  /**
   * Subscribe to language changes and update displayed content
   */
  private subscribeToLanguageChanges(): void {
    try {
      const currentLang = this.languageService.getCurrentLanguage()
      if (typeof currentLang === 'string') {
        this.currentLanguage = currentLang || 'en'
      } else {
        this.currentLanguage = 'en'
      }
    } catch (error) {
      this.currentLanguage = 'en'
    }
  }

  /**
   * Subscribe to downtime state updates
   */
  private subscribeToDowntimeUpdates(): void {
    this.downtimeService
      .getDowntimeState()
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        this.currentDowntimeState = state
        if (state.isDowntime && state.type === 'full' && !this.downtimeService.isBypassed()) {
          this.content = state.content
          this.cssConfig = state.content.css || null
        } else {
          this.content = null
          this.cssConfig = null
        }
      })
  }

  /**
   * Get localized title text
   */
  getLocalizedTitle(): string {
    if (!this.content?.title) {
      return 'System under maintenance'
    }
    return (
      this.content.title[this.currentLanguage] || this.content.title['en'] || 'System under maintenance'
    )
  }

  /**
   * Get localized message text
   */
  getLocalizedMessage(): string {
    if (!this.content?.message) {
      return 'Please check back soon'
    }
    return (
      this.content.message[this.currentLanguage] ||
      this.content.message['en'] ||
      'Please check back soon'
    )
  }

  /**
   * Get theme CSS class based on configuration
   */
  getThemeClass(): string {
    return this.cssConfig?.theme === 'dark' ? 'dark-theme' : ''
  }

  /**
   * Get dynamic styles from configuration
   */
  getContainerStyles(): Record<string, any> {
    if (!this.cssConfig) {
      return {}
    }

    const isDark = this.cssConfig.theme === 'dark'
    return {
      backgroundColor: this.cssConfig.backgroundColor || (isDark ? '#1a1a1a' : '#f5f5f5'),
      color: this.cssConfig.textColor || (isDark ? '#ffffff' : '#222222'),
    }
  }

  /**
   * Get button/accent styles
   */
  getAccentStyles(): Record<string, any> {
    if (!this.cssConfig) {
      return {}
    }

    return {
      color: this.cssConfig.primaryColor,
    }
  }

  /**
   * Get icon URL or CSS class
   * Supports both S3 URLs and local icon names
   */
  getIconClass(): string {
    if (!this.content?.icon) {
      return 'icon-wrench'
    }

    // If it's a URL (S3 or external), return it as-is for img src
    if (this.content.icon.startsWith('http://') || this.content.icon.startsWith('https://')) {
      return this.content.icon
    }

    // For local icon names, map to CSS classes
    const iconMap: Record<string, string> = {
      wrench: 'icon-wrench',
      info: 'icon-info',
      alert: 'icon-alert',
      maintenance: 'icon-maintenance',
    }
    return iconMap[this.content.icon] || 'icon-wrench'
  }

  /**
   * Get app link if enabled in downtime config JSON
   */
  getAppLink(): { url: string; label: string; hint?: string } | null {
    try {
      if (!this.content?.appLink) {
        return null
      }
      const { isEnabled, url, label, hint } = this.content.appLink
      if (isEnabled && url && label) {
        return { url, label, hint }
      }
      return null
    } catch (error) {
      return null
    }
  }
}
