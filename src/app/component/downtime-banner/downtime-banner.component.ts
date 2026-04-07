import { Component, OnInit, OnDestroy } from '@angular/core'
import { CommonModule } from '@angular/common'
import { MatIconModule } from '@angular/material/icon'
import { MatButtonModule } from '@angular/material/button'
import { Subject } from 'rxjs'
import { takeUntil } from 'rxjs/operators'
import { DowntimeConfigService } from '../../services/downtime-config.service'
import { DowntimeContent, DowntimeCssConfig } from '../../models/downtime.model'
import { LanguageService } from '../../services/language.service'

/**
 * DowntimeBannerComponent
 *
 * Displays a sticky top banner when the application is in partial downtime mode.
 * Features:
 * - Non-blocking notification
 * - Sticky at top
 * - Multilingual support
 * - Dynamic styling from configuration
 * - Dismissible banner
 */
@Component({
  selector: 'app-downtime-banner',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './downtime-banner.component.html',
  styleUrls: ['./downtime-banner.component.scss'],
})
export class DowntimeBannerComponent implements OnInit, OnDestroy {
  isVisible = false
  content: DowntimeContent | null = null
  currentLanguage = 'en'
  cssConfig: DowntimeCssConfig | null = null

  private destroy$ = new Subject<void>()

  constructor(
    private downtimeService: DowntimeConfigService,
    private languageService: LanguageService,
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
    if (state.isDowntime && (state.type === 'full' || state.type === 'partial')) {
      this.content = state.content
      this.cssConfig = state.content.css || null
      this.isVisible = true
    }
  }

  /**
   * Subscribe to language changes
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
        if (state.isDowntime && (state.type === 'full' || state.type === 'partial')) {
          this.content = state.content
          this.cssConfig = state.content.css || null
          this.isVisible = true
        } else {
          this.isVisible = false
        }
      })
  }

  /**
   * Get localized title
   */
  getLocalizedTitle(): string {
    if (!this.content?.title) {
      return 'Service notification'
    }
    return (
      this.content.title[this.currentLanguage] || this.content.title['en'] || 'Service notification'
    )
  }

  /**
   * Get localized message
   */
  getLocalizedMessage(): string {
    if (!this.content?.message) {
      return ''
    }
    return (
      this.content.message[this.currentLanguage] ||
      this.content.message['en'] ||
      ''
    )
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

  /**
   * Get wrapper positioning styles
   */
  getWrapperStyles(): Record<string, any> {
    const position = this.cssConfig?.position || 'top'
    const styles: Record<string, any> = {}

    if (position === 'bottom') {
      styles['top'] = 'auto'
      styles['bottom'] = '24px'
    }
    // top position uses default CSS (top: 120px)

    return styles
  }

  /**
   * Get banner card styles
   */
  getBannerStyles(): Record<string, any> {
    if (!this.cssConfig) {
      return {}
    }

    const styles: Record<string, any> = {
      backgroundColor: this.cssConfig.bannerColor || '#FFF8EE',
      color: this.cssConfig.textColor || '#333333',
    }

    // Handle accent border from config
    const borderPosition = this.cssConfig.borderPosition || 'left'
    const borderColor = this.cssConfig.borderColor || '#CE9A39'
    if (borderPosition !== 'none') {
      const prop = `border${borderPosition.charAt(0).toUpperCase() + borderPosition.slice(1)}`
      styles[prop] = `4px solid ${borderColor}`
    }

    return styles
  }

  /**
   * Check if icon is a URL (S3/external image)
   */
  isIconUrl(): boolean {
    return !!this.content?.icon && (this.content.icon.startsWith('http://') || this.content.icon.startsWith('https://'))
  }

  /**
   * Get icon color styles
   */
  getIconStyles(): Record<string, any> {
    return {
      color: this.cssConfig?.borderColor || this.cssConfig?.primaryColor || '#CE9A39',
    }
  }

  /**
   * Dismiss the banner
   */
  dismissBanner(): void {
    this.isVisible = false
  }

  /**
   * Get Material icon name for banner
   */
  getIconName(): string {
    if (!this.content?.icon) {
      return 'error'
    }
    const iconMap: Record<string, string> = {
      info: 'info',
      alert: 'error',
      warning: 'error',
      error: 'error',
      wrench: 'build',
      maintenance: 'build',
    }
    return iconMap[this.content.icon] || 'error'
  }
}
