import { Component, OnInit, OnDestroy } from '@angular/core'
import { ActivatedRoute, Data, Router } from '@angular/router'
import { Subscription } from 'rxjs'
import { TFetchStatus, ConfigurationsService, NsPage } from '@ws-widget/utils'
import { NsWidgetResolver } from '@ws-widget/resolver'
import { NsError, ROOT_WIDGET_CONFIG, NsDiscussionForum, WsDiscussionForumService } from '@ws-widget/collection'
import { MatButtonToggleChange } from '@angular/material'

@Component({
  selector: 'ws-app-qna-home',
  templateUrl: './qna-home.component.html',
  styleUrls: ['./qna-home.component.scss'],
})
export class QnaHomeComponent implements OnInit, OnDestroy {

  private routeSubscription: Subscription | null = null
  private queryParamsSubscription: Subscription | null = null
  errorWidget: NsWidgetResolver.IRenderConfigWithTypedData<NsError.IWidgetErrorResolver> = {
    widgetType: ROOT_WIDGET_CONFIG.errorResolver._type,
    widgetSubType: ROOT_WIDGET_CONFIG.errorResolver.errorResolver,
    widgetData: {
      errorType: 'internalServer',
    },
  }
  errorFetchingTimeline = false
  qnaTimeline!: NsDiscussionForum.ITimeline
  qnaTimelineRequest!: NsDiscussionForum.ITimelineRequest
  eTimelineTypes = NsDiscussionForum.ETimelineType
  currentTab = NsDiscussionForum.ETimelineType.ALL
  fetchStatus: TFetchStatus | null = null
  pageNavbar: Partial<NsPage.INavBackground> = this.configSvc.pageNavBar
  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private discussionSvc: WsDiscussionForumService,
    private configSvc: ConfigurationsService,
  ) { }

  ngOnInit() {
    this.queryParamsSubscription = this.activatedRoute.queryParamMap.subscribe(qParams => {
      const queryParams = qParams.get('tab')
      if (queryParams) {
        this.currentTab = queryParams as NsDiscussionForum.ETimelineType
      }
    })
    this.routeSubscription = this.activatedRoute.data.subscribe((response: Data) => {
      if (response.resolveData.error) {
        this.errorFetchingTimeline = true
      } else {
        this.qnaTimelineRequest = response.resolveData.data.request;
        (this.qnaTimelineRequest.pgNo as number) += 1
        this.qnaTimeline = response.resolveData.data.response
        this.verifyTimelineContentStatus()
      }
    })
  }
  ngOnDestroy() {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe()
    }
    if (this.queryParamsSubscription) {
      this.queryParamsSubscription.unsubscribe()
    }
  }
  onTabChange(event: MatButtonToggleChange) {
    this.router.navigate([], { queryParams: { tab: event.value }, preserveQueryParams: false })
  }
  fetchTimeLine() {
    if (this.fetchStatus === 'fetching') {
      return
    }
    this.fetchStatus = 'fetching'
    this.discussionSvc.fetchTimelineData(this.qnaTimelineRequest).subscribe(
      data => {
        if (Array.isArray(data.result)) {
          this.qnaTimeline.result = [
            ...this.qnaTimeline.result,
            ...data.result,
          ]
        }
        (this.qnaTimelineRequest.pgNo as number) += 1
        this.verifyTimelineContentStatus()
      },
      () => {
        this.fetchStatus = 'error'
      },
    )
  }
  verifyTimelineContentStatus() {
    if (this.qnaTimeline.hits > this.qnaTimeline.result.length) {
      this.fetchStatus = 'hasMore'
    } else if (!this.qnaTimeline.result.length) {
      this.fetchStatus = 'none'
    } else {
      this.fetchStatus = 'done'
    }
  }
}
