import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { Observable, Subscription } from 'rxjs'
import { ConfigurationsService, TFetchStatus, ValueService } from '@ws-widget/utils'
import { SocialForum } from '../../models/SocialForumposts.model'
import { ForumHandlerService } from '../../service/EmitterService/forum-handler.service'
import { ForumService } from '../../service/forum.service'

@Component({
  selector: 'ws-app-myforum-post',
  templateUrl: './myforum-post.component.html',
  styleUrls: ['./myforum-post.component.scss'],
})
export class MyforumPostComponent implements OnInit {

  myPostsTimelineData: SocialForum.ITimeline = {
    hits: 0,
    result: [

    ],
    filters: [],

  }
  // searchRequest: {
  //   filters: { [key: string]: string[] }
  // } = {
  //     filters: {},
  //   }
  // searchRequestObject: SocialForum.ISearchRequest = {
  //   filters: {},
  //   postKind: [],
  //   pgNo: 0,
  //   pgSize: 10,
  //   type: SocialForum.ETimelineType.ALL,

  // }
  bodyShow = false
  likeBarShow = false
  rep!: string
  pageNavbar: Partial<SocialForum.INavBackground> = this.configSvc.pageNavBar
  myPostTimelineReq: SocialForum.ITimelineRequest = {
    pgNo: -1,
    pgSize: 10,
    postKind: [SocialForum.EPostKind.FORUM],
    sessionId: Date.now(),
    type: SocialForum.ETimelineType.MY_PUBLISHED,
    userId: '',
    filters: {},
  }
  timelineFetchStatus: TFetchStatus = 'none'
  sub: Subscription = new Subscription

  isXSmall$: Observable<boolean>
  constructor(
    private _eventEmitter: ForumHandlerService,

    private forumSvc: ForumService,
    private configSvc: ConfigurationsService, private valueSvc: ValueService,
    private router: Router
  ) {
    this.isXSmall$ = this.valueSvc.isXSmall$
    this._eventEmitter.sendStatusOfPredefinedFilter(true)
  }

  ngOnInit() {
    this._eventEmitter.setActiveComponent('MyforumPostComponent')
    // Filters
    this._eventEmitter.sendStatusOfPredefinedFilter(true)

    this.timelineFetchStatus = 'fetching'
    this.fetchMyPost()
  }

  fetchMyPost() {
    //  console.log('The mY post FETCH TIMELINE IS CALLED')
    // if (this.timelineFetchStatus === 'done') {
    //   return
    // }

    this.timelineFetchStatus = 'fetching';

    (this.myPostTimelineReq.pgNo as number) += 1

    this.forumSvc.fetchMyPosts(this.myPostTimelineReq).subscribe(
      data => {
        if (data.hits && data.result) {
          // console.log('DATA: ', data)

          this.myPostsTimelineData.hits = data.hits

          // this.myPostsTimelineData.result = [...this.myPostsTimelineData.result, ...data.result]
          this.myPostsTimelineData.result = data.result
          this.myPostsTimelineData.filters = [...this.myPostsTimelineData.filters, ...data.filters]

          // this.timelineData.result.forEach(post => {
          //   if (post.id == this.posttoBeHidden) {
          //     post.hidden = true
          //   } else {
          //     post.hidden = false
          //   }
          // }
          // )

          // console.log("results are" + this.timelineData.result)
          if (data.hits > this.myPostsTimelineData.result.length) {
            this.timelineFetchStatus = 'hasMore'
          } else {
            this.timelineFetchStatus = 'done'
          }
        } else {
          this.myPostsTimelineData.result = []
          this.timelineFetchStatus = 'none'
        }
      },
      () => {
        this.timelineFetchStatus = 'error'
      },
    )

  }

  writePost() {
    this.router.navigate(['/app/social/forums/post/edit'])
  }
  // new approach

}
