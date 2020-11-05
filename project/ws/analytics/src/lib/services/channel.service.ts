import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { NsChannelAnalytics } from '../routes/channel/models/channel.model'
import { Observable } from 'rxjs'

// TODO: move this in some common place
const PROXY_SLAG_V8 = '/LA1'
// const PROXY_SLAG_V8 = `http://kmserver11:6004`

@Injectable({
  providedIn: 'root',
})
export class ChannelService {
  constructor(private http: HttpClient) { }
  getContentAnalyticsClient(channelId: string, type: string): Observable<NsChannelAnalytics.IChannelAnalyticsData> {
    const url = `${PROXY_SLAG_V8}/api/la/contentanalytics?content_id=${channelId}&type=${type}`
    return this.http.get<NsChannelAnalytics.IChannelAnalyticsData>(url)
  }
}
