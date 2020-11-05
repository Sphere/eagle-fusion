import { Injectable } from '@angular/core'
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router'
import { Observable } from 'rxjs'
import { take } from 'rxjs/operators'
import { SocialForum } from '../routes/forums/models/SocialForumposts.model'
import { ForumService } from '../routes/forums/service/forum.service'

@Injectable()
export class ViewForumService implements
  Resolve<Observable<SocialForum.IForumViewResponse>> {

  forumViewRequest: SocialForum.IForumViewRequest = {
    sessionId: Date.now(),
    forumKind: SocialForum.EForumKind.FORUM,
    pgNo: 0, pgSize: 20,
    type: SocialForum.EForumViewType.ACTIVEALL,

  }
  constructor(
    private forumSvc: ForumService,
  ) { }

  resolve(_route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): Observable<any> {
    return this.forumSvc.getForumsDetails(this.forumViewRequest).pipe(take(1))
  }
}
