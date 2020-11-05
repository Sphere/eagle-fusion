import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Observable } from 'rxjs'
import { SocialForum } from '../../../models/SocialForumposts.model'

const PROTECTED_SLAG_V8 = '/apis/protected/v8'
const API_END_POINTS = {
  // USER_CONTENT_LIKE: `/apis/protected/v8/user/content/like`,
  // USER_CONTENT_UNLIKE: `/apis/protected/v8/user/content/unlike`,
  // CONTENT_LIKES: `/apis/protected/v8/user/content/contentLikes`,
  SOCIAL_ADMIN_DEL: `${PROTECTED_SLAG_V8}/social/admin/deletePost`,
  SOCIAL_ADMIN_REVIVE: `${PROTECTED_SLAG_V8}/social/admin/reactivatePost`,
}

@Injectable({
  providedIn: 'root',
})
export class BtnAdminService {

  constructor(
    private http: HttpClient
  ) { }

  reject(moderatorRequest: SocialForum.IAdminBtnRequest) {
    return this.http.post<{ data: Observable<number> }>(`${API_END_POINTS.SOCIAL_ADMIN_DEL}`, moderatorRequest)
  }
  revivePost(adminRequest: SocialForum.IAdminRevivePostRequest) {
    return this.http.post<{ data: Observable<number> }>(`${API_END_POINTS.SOCIAL_ADMIN_REVIVE}`, adminRequest)
  }

}
