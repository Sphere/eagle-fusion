import { Injectable, signal, computed } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { ConfigurationsService, LoggerService } from '../../../library/ws-widget/utils/src/public-api'
import { BehaviorSubject } from 'rxjs'
import { API_END_POINTS } from '../constants/apiConstants'
import { isEkshamataPortal } from '../constants/portal'

@Injectable({ providedIn: 'root' })
export class PlaylistService {
  private readonly playlistData = signal<any | null>(null)
  private readonly selectedTab = signal<string>(
    localStorage.getItem('selectedTab') || 'homeTab'
  )
  orgDetails = computed(() => this.playlistData()?.orgData ?? '')

  headerConfig = computed(() => this.playlistData()?.LAYOUT_HEADER ?? '')
  bodyConfig = computed(() => this.playlistData()?.LAYOUT_BODY ?? null)
  footerConfig = computed(() => this.playlistData()?.LAYOUT_FOOTER ?? '')
  config = computed(() => this.playlistData()?.LAYOUT_BODY ?? null)

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

  private readonly playlistConfigCache = signal<any[] | null>(null)

  private readonly earnedBadgesSubject = new BehaviorSubject<number>(0)
  earnedBadges$ = this.earnedBadgesSubject.asObservable()
  showDetails = signal(false)
  selectedProgram = signal<any | null>({})
  constructor(
    private readonly http: HttpClient,
    private readonly configSvc: ConfigurationsService,
    private readonly logger: LoggerService
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
        component: (orgId && isEkshamataPortal()) ? 'ekshamata' : 'web',
        rootOrgId: orgId || '*',
      },
    }

    try {
      const url = API_END_POINTS.FORM_READ
      const response: any = await this.http
        .post(url, body)
        .toPromise()

      const data = response?.result?.form?.data ?? null
      if (data) {
        data.LAYOUT_BODY = this.normalizeLayoutBody(data.LAYOUT_BODY)
      }
      if (data?.LAYOUT_BODY?.programConfig) {
        await this.getPlaylistConfig()
      }
      this.playlistData.set(data)

      return data
    } catch (error) {
      this.logger.error('Failed to load playlist data', error)
      return null
    }
  }

  /**
   * The before-login web_layout response returns `LAYOUT_BODY` as a plain array of
   * section-cards; the after-login response returns it as `{ sections: { homeTab: [...] } }`
   * (and possibly other tabs, e.g. `accountTab`). Normalizing both into the object shape here
   * — the single seam both responses pass through — means every consumer can rely on
   * `sections()?.homeTab` regardless of login state, instead of each guessing the shape.
   */
  private normalizeLayoutBody(layoutBody: any): any {
    if (Array.isArray(layoutBody)) {
      return { sections: { homeTab: layoutBody } }
    }
    return layoutBody ?? { sections: {} }
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
   *
   * The before-login (`web`) response doesn't carry a separate `sectionId` field per section —
   * `playlistConfigId` there IS the section identifier (e.g. `{ playlistConfigId:
   * "TOP_COURSE_PLAYLIST" }`, no renaming layer). The after-login response can rename it (e.g.
   * `{ sectionId: "TOP_COURSE_PLAYLIST", playlistConfigId: "TOP_COURSE_PLAYLIST_V2" }`). Falling
   * back to `playlistConfigId` when `sectionId` is absent covers both without the caller caring
   * which shape it's looking at.
   */
  getPlaylistConfigId(sectionId: string): string | undefined {
    const sectionsByTab: any = this.sections() || {}
    for (const tabSections of Object.values(sectionsByTab)) {
      if (Array.isArray(tabSections)) {
        const match = (tabSections as any[]).find(s => (s?.sectionId ?? s?.playlistConfigId) === sectionId && s?.playlistConfigId)
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
