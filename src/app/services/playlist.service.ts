import { Injectable } from '@angular/core'
import { data } from '../services/sampleData'
import { HttpClient } from '@angular/common/http'

@Injectable({
  providedIn: 'root'
})
export class PlaylistService {
  homeConfig: any
  courseConfig: any
  competencyConfig: any
  accountConfig: any
  notifConfig: any
  searchMobConfig: any
  playlistData: any
  constructor(
    private http: HttpClient
  ) { }

  getOrgDetails() {
    return this.playlistData.orgData
  }

  getHeaderConfig() {
    return this.playlistData.LAYOUT_HEADER
  }

  getFooterConfig() {
    return this.playlistData.LAYOUT_FOOTER
  }

  setSelectedTab(tabId: string) {
    let data = this.playlistData.LAYOUT_BODY.sections
    localStorage.setItem('selectedTab', tabId)
    window.location.href.split('/page/')
    switch (tabId) {
      case 'homeTab':
        this.homeConfig = data.homeTab
        break
      case 'courseTab':
        this.courseConfig = data.courseTab
        break
      case 'competencyTab':
        this.competencyConfig = data.competencyTab
        break
      case 'accountTab':
        this.accountConfig = data.accountTab
        break
      case 'notifTab':
        this.notifConfig = data.notifTab
        break
      case 'searchMob':
        this.searchMobConfig = data.searchMob
        break
      default:
        this.homeConfig = data.homeTab
        break
    }
  }

  getSelectedTab(): string {
    const tabId = localStorage.getItem('selectedTab')
    return tabId ? tabId : 'homeTab'
  }

  getHomeConfig() {
    return this.homeConfig || this.playlistData.LAYOUT_BODY.sections.homeTab
  }

  getCourseConfig() {
    return this.courseConfig || this.playlistData.LAYOUT_BODY.sections.courseTab
  }

  getCompetencyConfig() {
    return this.competencyConfig || this.playlistData.LAYOUT_BODY.sections.competencyTab
  }

  getAccountConfig() {
    return this.accountConfig || this.playlistData.LAYOUT_BODY.sections.accountTab
  }

  getNotifConfig() {
    return this.notifConfig || this.playlistData.LAYOUT_BODY.sections.homeTab
  }

  getSearchMobConfig() {
    return this.searchMobConfig || this.playlistData.LAYOUT_BODY.sections.searchMob
  }

  getPlaylistData() {
    // API call to fetch playlist data can be added here
    let body = {
      "request": {
        "type": "web_layout",
        "subtype": "v1",
        "action": "get",
        "component": "web",
        "rootOrgId": "0132317968766894088"
      }
    }
    this.http.post('https://sphere.aastrika.org/apis/v1/form/read?v=%24{new%20Date().getTime()', body, { headers: {} }).subscribe((response: any) => {
      console.log(response)
    })
    this.playlistData = data
    return data
  }
}
