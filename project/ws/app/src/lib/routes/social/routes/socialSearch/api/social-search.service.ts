import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { SocialForum } from '../../forums/models/SocialForumposts.model'

const PROTECTED_SLAG_V8 = '/apis/protected/v8'

const API_END_POINTS = {
  SOCIAL_SEARCH_TIMELINE: `${PROTECTED_SLAG_V8}/social/post/search`, // this has to be changed(Temporary)

}
@Injectable({
  providedIn: 'root',
})

export class SocialSearchService {

  constructor(private http: HttpClient) { }

  fetchSearchTimelineData(request: SocialForum.ISocialSearchRequest) {

    return this.http.post<SocialForum.ISocialSearchTimeline>(API_END_POINTS.SOCIAL_SEARCH_TIMELINE, request)
  }
}
