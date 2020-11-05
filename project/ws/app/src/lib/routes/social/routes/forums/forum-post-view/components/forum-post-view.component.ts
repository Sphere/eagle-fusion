import { Component, OnInit } from '@angular/core'
import { ActivatedRoute, Data, Router } from '@angular/router'
import { TFetchStatus, ConfigurationsService } from '@ws-widget/utils'
import { SocialForum } from '../../models/SocialForumposts.model'
import { ForumService } from '../../service/forum.service'

@Component({
  selector: 'ws-app-forum-post-view',
  templateUrl: './forum-post-view.component.html',
  styleUrls: ['./forum-post-view.component.scss'],
})
export class ForumPostViewComponent implements OnInit {
  forumViewData: SocialForum.ITimelineResult | null = null
  postsOfForum: SocialForum.ITimelineResult[] = []
  forumViewResponse: SocialForum.IForumViewResponse = {
    hits: 0,
    result: [],
  }
  timelineFetchStatus: TFetchStatus = 'none'
  forumID = ''
  myPostTimelineReq: SocialForum.ITimelineRequest = {
    pgNo: -1,
    pgSize: 10,
    postKind: [SocialForum.EPostKind.FORUM, SocialForum.EPostKind.BLOG],
    sessionId: Date.now(),
    type: SocialForum.ETimelineType.ALL,
    source: { id: '', name: SocialForum.EDiscussionType.SOCIAL },
  }
  showSocialLike = false
  // tslint:disable-next-line: max-line-length
  constructor(private route: ActivatedRoute, private forumSvc: ForumService, private configSvc: ConfigurationsService, private router: Router) { }

  ngOnInit() {
    this.route.data.subscribe((rseult: Data) => {
      const data = rseult.content
      if (data.result) {
        this.route.paramMap.subscribe(params => {
          const idVal = params.get('id')
          if (idVal && this.myPostTimelineReq.source) {
            this.forumID = idVal
            data.result.forEach((forum: SocialForum.ITimelineResult) => {
              if (forum.id === this.forumID) {
                this.forumViewData = forum
              }
            })

            this.fetchPosts()
          }
        })
      }
    })
    this.showSocialLike = (this.configSvc.restrictedFeatures && !this.configSvc.restrictedFeatures.has('socialLike')) || false
  }
  fetchPosts() {
    if (this.myPostTimelineReq.source) {
      this.myPostTimelineReq.source.id = this.forumID
    }
    (this.myPostTimelineReq.pgNo as number) += 1
    this.forumSvc.fetchMyPosts(this.myPostTimelineReq).subscribe(data => {
      this.postsOfForum = [...this.postsOfForum, ...data.result]
      if (data.hits > this.postsOfForum.length) {
        this.timelineFetchStatus = 'hasMore'
      } else {
        this.timelineFetchStatus = 'done'
      }
    })
  }
  writePost() {
    this.router.navigate(['/app/social/forums/post/edit'], { queryParams: { forumId: this.forumID } })
  }
}
