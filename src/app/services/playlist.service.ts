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
  bodyConfig = computed(() => this.playlistData()?.LAYOUT_BODY?.sections ?? '')
  footerConfig = computed(() => this.playlistData()?.LAYOUT_FOOTER ?? '')
  config = computed(() => this.playlistData()?.LAYOUT_BODY ?? '')

  sections = computed(
    () => this.playlistData()?.LAYOUT_BODY?.sections ?? {}
  )

  selectedTabConfig = computed(() => {
    const sections = this.sections()
    if (!sections) return ''

    const tab = this.selectedTab()
    return sections[tab] || sections.homeTab || ''
  })

  private earnedBadgesSubject = new BehaviorSubject<number>(0);
  earnedBadges$ = this.earnedBadgesSubject.asObservable();
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
    let orgId = this.configSvc?.userProfile?.rootOrgId
    const body = {
      request: {
        type: 'web_layout',
        subtype: 'v1',
        action: 'get',
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
      this.playlistData.set(data)

      return data
    } catch (error) {
      this.logger.error('Failed to load playlist data', error)
      return null
    }
  }

  async getPlaylistConfig(): Promise<any> {
    const org = this.configSvc?.userProfile?.rootOrgId || 'default'

    const body = {
      request: {
        filters: { orgId: org }
      }
    }

    const url = API_END_POINTS.PLAYLIST_SEARCH

    const response: any = await this.http.post(url, body).toPromise()

    return response?.result?.playlist ?? []
  }

  clearCache() {
    this.playlistData.set(null)
  }

  setEarnedBadges(count: number, isIncrement: boolean = false) {
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
