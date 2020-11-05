import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Observable } from 'rxjs'
import { SocialForum } from '../../../models/SocialForumposts.model'

const API_END_POINTS = {
  // USER_CONTENT_LIKE: `/apis/protected/v8/user/content/like`,
  // USER_CONTENT_UNLIKE: `/apis/protected/v8/user/content/unlike`,
  // CONTENT_LIKES: `/apis/protected/v8/user/content/contentLikes`,
  USER_CONTENT_FLAG: `/apis/protected/v8/social/post/activity/create`,

}
@Injectable({
  providedIn: 'root',
})
export class BtnFlagService {

  constructor(private http: HttpClient) { }

  flagPost(flagRequest: SocialForum.IFlagRequest) {
    return this.http.post<{ data: Observable<number> }>(`${API_END_POINTS.USER_CONTENT_FLAG}`, flagRequest)
  }
  unflagPost(flagRequest: SocialForum.IFlagRequest) {
    return this.http.post<{ data: Observable<number> }>(`${API_END_POINTS.USER_CONTENT_FLAG}`, flagRequest)
  }
}
