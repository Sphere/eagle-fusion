import { Injectable } from '@angular/core'
import { Resolve } from '@angular/router'
import { Observable, of } from 'rxjs'
import { SocialForum } from '../routes/forums/models/SocialForumposts.model'
import { ForumService } from '../routes/forums/service/forum.service'
import { map, catchError } from 'rxjs/operators'

@Injectable()
export class ModeratorTimelineService implements Resolve<Observable<SocialForum.IModeratorTimeline>> {

  moderatorTimelineRequest: SocialForum.IModeratorTimelineRequest = {
    pgNo: 0,
    pgSize: 20,
    postKind: [SocialForum.EPostKind.BLOG],
    sessionId: Date.now(),
    type: SocialForum.ETimelineType.MODERATOR_TIMELINE,
    source: {
      id: [],
      name: SocialForum.EDiscussionType.SOCIAL,

    },
  }
  constructor(
    private forumSvc: ForumService,
  ) { }

  resolve(): Observable<any> {
    return this.forumSvc.fetchModeratorTimelineData(this.moderatorTimelineRequest).pipe(
      map(data => ({ data, error: null })),
      catchError(error => of({ error, data: null })),
    )
  }
}
