import { Injectable, signal, computed } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { ConfigurationsService, LoggerService } from '../../../library/ws-widget/utils/src/public-api'
import { BehaviorSubject } from 'rxjs'
import { API_END_POINTS } from '../constants/apiConstants'

@Injectable({ providedIn: 'root' })
export class PlaylistService {
  private playlistData = signal<any | null>(null)
  private selectedTab = signal<string>(
    localStorage.getItem('selectedTab') || 'homeTab'
  )
  orgDetails = computed(() => this.playlistData()?.orgData ?? '')

  headerConfig = computed(() => this.playlistData()?.LAYOUT_HEADER ?? '')
  bodyConfig = computed(() => this.playlistData()?.LAYOUT_BODY ?? [])
  footerConfig = computed(() => this.playlistData()?.LAYOUT_FOOTER ?? '')
  config = computed(() => this.playlistData()?.LAYOUT_BODY ?? '')

  sections = computed(
    () => this.playlistData()?.LAYOUT_BODY?.sections ?? {}
  )
  programs = computed(() => this.playlistData()?.LAYOUT_BODY?.programConfig ?? '')

  selectedTabConfig = computed(() => {
    const sections = this.sections()
    if (!sections) return ''

    const tab = this.selectedTab()
    return sections[tab] || sections.homeTab || ''
  })

  private playlistConfigCache = signal<any[] | null>(null)

  private earnedBadgesSubject = new BehaviorSubject<number>(0)
  earnedBadges$ = this.earnedBadgesSubject.asObservable()
  showDetails = signal(false)
  selectedProgram = signal<any | null>({})
  constructor(
    private http: HttpClient,
    private configSvc: ConfigurationsService,
    private logger: LoggerService
  ) { }
  setSelectedTab(tabId: string) {
    if (!tabId) return
    this.selectedTab.set(tabId)
    localStorage.setItem('selectedTab', tabId)
  }

  getSelectedTab(): string {
    return this.selectedTab()
  }

  async loadPlaylistData(force = false): Promise<any> {
    // Return cached data if available and force is false
    const cachedData = this.playlistData()
    if (cachedData && !force) {
      return cachedData
    }
    const orgId = this.configSvc?.userProfile?.rootOrgId
    const body = {
      request: {
        type: 'web_layout',
        subtype: 'v1',
        action: 'get',
        framework: 'v2',
        component: (orgId && window.location.href.includes('ekshamata')) ? 'ekshamata' : 'web',
        rootOrgId: orgId || '*',
      },
    }

    try {
      const url = API_END_POINTS.FORM_READ
      const response: any = await this.http
        .post(url, body)
        .toPromise()

      const data = response?.result?.form?.data ?? null
      if (data?.LAYOUT_BODY?.programConfig) {
        this.getPlaylistConfig()
      }
      this.playlistData.set(data)

      return data
    } catch (error) {
      this.logger.error('Failed to load playlist data', error)
      return null
    }
  }

  async getPlaylistConfig(): Promise<any> {
    const cached = this.playlistConfigCache()
    if (cached) return cached
    const org = this.configSvc?.userProfile?.rootOrgId || 'default'
    const body = {
      request: {
        filters: { orgId: org },
      },
    }
    const url = API_END_POINTS.PLAYLIST_SEARCH
    try {
      const response: any = await this.http.post(url, body).toPromise()
      const result = response?.result?.playlist ?? []
      this.playlistConfigCache.set(result)
      return result
    } catch (error) {
      this.logger.error('Failed to load playlist config', error)
      return []
    }
  }

  /**
   * Resolves the playlist/search `playlistId` to filter by for a given UI `sectionId`, by
   * reading the `playlistConfigId` the backend already attaches to that section in the
   * web_layout config (LAYOUT_BODY.sections). This is the join key backend owns — if they
   * rename a playlistId, updating playlistConfigId in the section config is enough; no
   * frontend deploy needed.
   */
  getPlaylistConfigId(sectionId: string): string | undefined {
    const sectionsByTab: any = this.sections() || {}
    for (const tabSections of Object.values(sectionsByTab)) {
      if (Array.isArray(tabSections)) {
        const match = (tabSections as any[]).find(s => s?.sectionId === sectionId && s?.playlistConfigId)
        if (match) return match.playlistConfigId
      }
    }
    return undefined
  }

  clearCache() {
    this.playlistData.set(null)
  }

  setEarnedBadges(count: number, isIncrement = false) {
    const currentCount = this.earnedBadgesSubject.getValue()
    if (isIncrement) {
      count = currentCount + count
    }
    if (count !== 0 && !isIncrement) {
      count = currentCount > count ? currentCount : count
    }
    this.earnedBadgesSubject.next(count)
  }
}
