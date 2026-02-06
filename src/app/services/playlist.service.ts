import { Injectable, signal, computed } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { ConfigurationsService } from '../../../library/ws-widget/utils/src/public-api'

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

  constructor(
    private http: HttpClient,
    private configSvc: ConfigurationsService
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
    if (this.playlistData() && !force) {
      return this.playlistData()
    }

    const body = {
      request: {
        type: 'web_layout',
        subtype: 'v1',
        action: 'get',
        component: 'web',
        rootOrgId: this.configSvc?.userProfile?.rootOrgId || '*'
      }
    }

    const response: any = await this.http
      .post(`/apis/v1/form/read?v=${new Date().getTime()}`, body)
      .toPromise()

    const data = response?.result?.form?.data ?? null
    this.playlistData.set(data)

    return data
  }

  async getPlaylistConfig(): Promise<any> {
    const org = this.configSvc?.userProfile?.rootOrgId || 'default'

    const body = {
      request: {
        filters: { orgId: org }
      }
    }

    const url = `/apis/protected/v8/playlist/search?v=${new Date().getTime()}`

    const response: any = await this.http.post(url, body).toPromise()

    return response?.result?.playlist ?? []
  }

  clearCache() {
    this.playlistData.set(null)
  }
}
