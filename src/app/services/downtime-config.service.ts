import { Injectable, NgZone } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { BehaviorSubject, Observable, of } from 'rxjs'
import { map, tap, catchError } from 'rxjs/operators'
import {
  AppDowntimeConfig,
  DowntimeState,
  DOWNTIME_DEFAULTS,
  DowntimeType,
} from '../models/downtime.model'

/**
 * DowntimeConfigService
 *
 * Manages downtime/maintenance configuration for the application.
 * Fetches config from /apis/v1/form/read API using app_update_info form type.
 * Response path: form.data.schemas.DOWN_TIME_INFO.WEB.[appName]
 * Auto-refreshes based on configured interval.
 */
@Injectable({
  providedIn: 'root',
})
export class DowntimeConfigService {
  private readonly API_ENDPOINT = '/apis/v1/form/read'

  constructor(
    private ngZone: NgZone,
    private httpClient: HttpClient,
  ) { }

  private downtimeState$ = new BehaviorSubject<DowntimeState>({
    isDowntime: false,
    type: 'full',
    content: {
      icon: DOWNTIME_DEFAULTS.DEFAULT_ICON,
      title: DOWNTIME_DEFAULTS.FALLBACK_MESSAGE.title,
      message: DOWNTIME_DEFAULTS.FALLBACK_MESSAGE.message,
      css: {
        theme: 'light',
        primaryColor: DOWNTIME_DEFAULTS.PRIMARY_COLOR,
        backgroundColor: DOWNTIME_DEFAULTS.BACKGROUND_COLOR,
        textColor: DOWNTIME_DEFAULTS.TEXT_COLOR,
        bannerColor: DOWNTIME_DEFAULTS.BANNER_COLOR,
      },
    },
  })

  private refreshTimer: any = null
  private currentConfig: AppDowntimeConfig | null = null

  /**
   * Initialize downtime configuration
   * Called on application bootstrap
   */
  public initializeDowntimeConfig(): Observable<DowntimeState> {
    return this.fetchDowntimeConfig().pipe(
      tap(state => {
        this.downtimeState$.next(state)
        this.scheduleAutoRefresh(state)
      }),
    )
  }

  /**
   * Get current downtime state as observable
   */
  public getDowntimeState(): Observable<DowntimeState> {
    return this.downtimeState$.asObservable()
  }

  /**
   * Get current downtime state synchronously
   */
  public getCurrentDowntimeState(): DowntimeState {
    return this.downtimeState$.value
  }

  /**
   * Check if application is in downtime
   */
  public isInDowntime(): boolean {
    return this.downtimeState$.value.isDowntime
  }

  /**
   * Get downtime type (full or partial)
   */
  public getDowntimeType(): DowntimeType {
    return this.downtimeState$.value.type
  }

  /**
   * Fetch downtime config from /apis/v1/form/read API
   * Uses app_update_info form type with rootOrgId: '*'
   */
  private fetchDowntimeConfig(): Observable<DowntimeState> {
    const body = {
      request: {
        type: 'app_update_info',
        subtype: '*',
        action: 'get',
        component: 'app',
        rootOrgId: '*',
      },
    }

    return this.httpClient
      .post<any>(`${this.API_ENDPOINT}?v=${Date.now()}`, body)
      .pipe(
        map(response => {
          const data = response?.result?.form?.data
          if (!data) {
            return this.getDefaultDowntimeState(false)
          }
          return this.parseDowntimeConfig(data)
        }),
        catchError(error => {
          console.error('Failed to fetch downtime config from API:', error)
          return of(this.getDefaultDowntimeState(false))
        }),
      )
  }

  /**
   * Parse the API response data and build downtime state
   * Response structure: data.schemas.DOWN_TIME_INFO.WEB.[appName]
   */
  private parseDowntimeConfig(data: any): DowntimeState {
    try {
      const webConfig = data?.schemas?.DOWN_TIME_INFO?.WEB
      if (!webConfig) {
        return this.getDefaultDowntimeState(false)
      }

      // Try app-specific config first, then fall back to 'default'
      const appName = this.getAppName()
      const config: AppDowntimeConfig = webConfig[appName] || webConfig.default

      if (!config) {
        return this.getDefaultDowntimeState(false)
      }

      this.currentConfig = config
      const refreshTimer = config.refreshInterval || DOWNTIME_DEFAULTS.REFRESH_INTERVAL

      if (config.isEnabled !== true) {
        const defaultState = this.getDefaultDowntimeState(false)
        defaultState.refreshTimer = refreshTimer
        return defaultState
      }

      const normalizedType = this.normalizeDowntimeType(config.type)

      return {
        isDowntime: true,
        type: normalizedType,
        content: this.enrichDowntimeContent(config.content),
        refreshTimer,
      }
    } catch (error) {
      console.error('Error parsing downtime configuration:', error)
      return this.getDefaultDowntimeState(false)
    }
  }

  /**
   * Enrich downtime content with defaults and CSS
   */
  private enrichDowntimeContent(content: any) {
    const enriched: any = {
      icon: content?.icon || DOWNTIME_DEFAULTS.DEFAULT_ICON,
      title: content?.title || DOWNTIME_DEFAULTS.FALLBACK_MESSAGE.title,
      message: content?.message || DOWNTIME_DEFAULTS.FALLBACK_MESSAGE.message,
      css: {
        theme: (content?.css?.theme as 'light' | 'dark') || 'light',
        primaryColor: content?.css?.primaryColor || DOWNTIME_DEFAULTS.PRIMARY_COLOR,
        backgroundColor: content?.css?.backgroundColor || DOWNTIME_DEFAULTS.BACKGROUND_COLOR,
        textColor: content?.css?.textColor || DOWNTIME_DEFAULTS.TEXT_COLOR,
        bannerColor: content?.css?.bannerColor || DOWNTIME_DEFAULTS.BANNER_COLOR,
      },
    }

    // Preserve appLink if present
    if (content?.appLink) {
      enriched.appLink = content.appLink
    }

    return enriched
  }

  /**
   * Normalize downtime type to valid values
   */
  private normalizeDowntimeType(type: any): DowntimeType {
    if (type === 'partial') {
      return 'partial'
    }
    return 'full'
  }

  /**
   * Get default downtime state
   */
  private getDefaultDowntimeState(isDowntime: boolean): DowntimeState {
    return {
      isDowntime,
      type: 'full',
      content: {
        icon: DOWNTIME_DEFAULTS.DEFAULT_ICON,
        title: DOWNTIME_DEFAULTS.FALLBACK_MESSAGE.title,
        message: DOWNTIME_DEFAULTS.FALLBACK_MESSAGE.message,
        css: {
          theme: 'light',
          primaryColor: DOWNTIME_DEFAULTS.PRIMARY_COLOR,
          backgroundColor: DOWNTIME_DEFAULTS.BACKGROUND_COLOR,
          textColor: DOWNTIME_DEFAULTS.TEXT_COLOR,
          bannerColor: DOWNTIME_DEFAULTS.BANNER_COLOR,
        },
      },
    }
  }

  /**
   * Schedule auto-refresh of downtime configuration
   */
  private scheduleAutoRefresh(state: DowntimeState): void {
    this.clearRefreshTimer()

    if (!state.refreshTimer || state.refreshTimer === 0) {
      return
    }

    this.ngZone.runOutsideAngular(() => {
      this.refreshTimer = setInterval(() => {
        this.ngZone.run(() => {
          this.refreshDowntimeConfig()
        })
      }, state.refreshTimer * 1000)
    })
  }

  /**
   * Refresh downtime configuration
   */
  private refreshDowntimeConfig(): void {
    this.fetchDowntimeConfig().subscribe(
      state => {
        this.downtimeState$.next(state)
        this.scheduleAutoRefresh(state)
      },
      error => {
        console.warn('Auto-refresh failed:', error)
        if (this.currentConfig?.refreshInterval) {
          this.scheduleAutoRefresh(this.getCurrentDowntimeState())
        }
      },
    )
  }

  /**
   * Clear refresh timer
   */
  private clearRefreshTimer(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer)
      this.refreshTimer = null
    }
  }

  /**
   * Determine the application name from hostname
   */
  private getAppName(): string {
    const hostname = window.location.hostname
    if (hostname.includes('ekshamata')) {
      return 'ekshamata'
    }
    if (hostname.includes('sphere')) {
      return 'sphere'
    }
    return 'default'
  }

  /**
   * Cleanup when service is destroyed
   */
  public ngOnDestroy(): void {
    this.clearRefreshTimer()
  }
}
