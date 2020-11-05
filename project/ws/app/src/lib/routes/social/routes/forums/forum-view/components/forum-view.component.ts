import { ChangeDetectorRef, Component, OnInit } from '@angular/core'
import { ActivatedRoute, Data, Router } from '@angular/router'
// tslint:disable-next-line: max-line-length
import { ConfigurationsService, NsPage, TFetchStatus, ValueService } from '@ws-widget/utils'
import { Observable } from 'rxjs'
import { SocialForum } from '../../models/SocialForumposts.model'
import { ForumHandlerService } from '../../service/EmitterService/forum-handler.service'
import { ForumService } from '../../service/forum.service'

@Component({
  selector: 'ws-app-forum-view',
  templateUrl: './forum-view.component.html',
  styleUrls: ['./forum-view.component.scss'],
})
export class ForumViewComponent implements OnInit {
  isXSmall$: Observable<boolean>
  showSocialLike = false
  panelOpenState = false
  forumViewRequest: SocialForum.IForumViewRequest = {
    sessionId: Date.now(),
    forumKind: SocialForum.EForumKind.FORUM,
    pgNo: 0, pgSize: 20,
    type: SocialForum.EForumViewType.ACTIVEALL,

  }
  forumViewResponse: SocialForum.IForumViewResponse = {
    hits: 0,
    result: [],
  }

  pageNavbar: Partial<NsPage.INavBackground> = this.configSvc.pageNavBar
  timelineFetchStatus: TFetchStatus = 'none'
  constructor(
    private _eventEmiter: ForumHandlerService,
    private forumSvc: ForumService,
    private router: Router,
    private configSvc: ConfigurationsService, private valueSvc: ValueService,
    private route: ActivatedRoute,
    private changeDetect: ChangeDetectorRef,

  ) {
    this.isXSmall$ = this.valueSvc.isXSmall$
    this._eventEmiter.sendFilterStatus(false)
    this._eventEmiter.sendStatusOfPredefinedFilter(false)
  }

  ngOnInit() {
    this.route.data.subscribe((rseult: Data) => {
      this.resetData()
      const data = rseult.content
      if (data && data.hits && data.result) {
        this.forumViewResponse.hits = data.hits
        this.forumViewResponse.result = [...this.forumViewResponse.result, ...data.result]
        if (data.hits > this.forumViewResponse.result.length) {
          this.timelineFetchStatus = 'hasMore'
        } else {
          this.timelineFetchStatus = 'done'
        }
      } else {
        this.timelineFetchStatus = 'none'
      }
    })
    this.showSocialLike = (this.configSvc.restrictedFeatures && !this.configSvc.restrictedFeatures.has('socialLike')) || false
    this._eventEmiter.setActiveComponent('ForumViewComponent')

  }
  fetchTimelineData() {
    if (this.timelineFetchStatus === 'done') {
      return
    }
    this.timelineFetchStatus = 'fetching';

    (this.forumViewRequest.pgNo as number) += 1

    this.forumSvc.fetchForums(this.forumViewRequest).subscribe(
      data => {
        if (data.hits && data.result) {
          this.forumViewResponse.hits = data.hits
          this.forumViewResponse.result = [...this.forumViewResponse.result, ...data.result]
          if (data.hits > this.forumViewResponse.result.length) {
            this.timelineFetchStatus = 'hasMore'
          } else {
            this.timelineFetchStatus = 'done'
          }
        } else {
          this.timelineFetchStatus = 'none'
        }
      },
      () => {
        this.timelineFetchStatus = 'error'
      },
    )
  }

  showForumDetail(forumSelected: SocialForum.IForumViewResult) {
    this.router.navigate([`/app/social/forums/view/${forumSelected.id}`])
  }
  resetData() {
    this.changeDetect.detectChanges()
  }
}
