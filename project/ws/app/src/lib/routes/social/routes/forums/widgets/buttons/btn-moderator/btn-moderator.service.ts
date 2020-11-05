import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Observable } from 'rxjs'
import { SocialForum } from '../../../models/SocialForumposts.model'

const PROTECTED_SLAG_V8 = '/apis/protected/v8'
const API_END_POINTS = {
  // USER_CONTENT_LIKE: `/apis/protected/v8/user/content/like`,
  // USER_CONTENT_UNLIKE: `/apis/protected/v8/user/content/unlike`,
  // CONTENT_LIKES: `/apis/protected/v8/user/content/contentLikes`,
  SOCIAL_MODERATOR_REACT: `${PROTECTED_SLAG_V8}/social/moderator/moderatepost`,
}
@Injectable({
  providedIn: 'root',
})
export class BtnModeratorService {

  constructor(
    private http: HttpClient
  ) { }

  accept(moderatorRequest: SocialForum.IModeratorBtnRequest) {
    // console.log("In the service class the request obtained is "+moderatorRequest)
    // console.log("In the service class the request obtained is "+JSON.stringify(moderatorRequest))
    return this.http.post<{ data: Observable<number> }>(`${API_END_POINTS.SOCIAL_MODERATOR_REACT}`, moderatorRequest)
  }
  reject(moderatorRequest: SocialForum.IModeratorBtnRequest) {
    return this.http.post<{ data: Observable<number> }>(`${API_END_POINTS.SOCIAL_MODERATOR_REACT}`, moderatorRequest)
  }

}
