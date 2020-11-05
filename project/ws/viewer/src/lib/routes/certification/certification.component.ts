import { Component, OnInit, OnDestroy } from '@angular/core'
import { Subscription } from 'rxjs'
import {
  NsContent,
  // NsDiscussionForum,
  WidgetContentService,
} from '@ws-widget/collection'
// import { NsWidgetResolver } from '@ws-widget/resolver'
import { ActivatedRoute } from '@angular/router'

@Component({
  selector: 'viewer-certification',
  templateUrl: './certification.component.html',
  styleUrls: ['./certification.component.scss'],
})
export class CertificationComponent implements OnInit, OnDestroy {
  private routeDataSubscription: Subscription | null = null
  isFetchingDataComplete = false
  certificationData: NsContent.IContent | null = null
  forPreview = window.location.href.includes('/author/')

  // discussionForumWidget: NsWidgetResolver.IRenderConfigWithTypedData<
  //   NsDiscussionForum.IDiscussionForumInput
  // > | null = null
  constructor(private activatedRoute: ActivatedRoute, private contentSvc: WidgetContentService) {}

  ngOnInit() {
    this.routeDataSubscription = this.activatedRoute.data.subscribe(
      async data => {
        this.certificationData = data.content.data
        if (
          this.certificationData &&
          this.certificationData.artifactUrl.indexOf('content-store') >= 0
        ) {
          await this.setS3Cookie(this.certificationData.identifier)
        }
        this.isFetchingDataComplete = true
      },
      () => {},
    )
  }

  ngOnDestroy() {
    if (this.routeDataSubscription) {
      this.routeDataSubscription.unsubscribe()
    }
  }

  // formDiscussionForumWidget(content: NsContent.IContent) {
  //   this.discussionForumWidget = {
  //     widgetData: {
  //       description: content.description,
  //       id: content.identifier,
  //       name: NsDiscussionForum.EDiscussionType.LEARNING,
  //       title: content.name,
  //       initialPostCount: 2,
  //       isDisabled: this.forPreview,
  //     },
  //     widgetSubType: 'discussionForum',
  //     widgetType: 'discussionForum',
  //   }
  // }

  private async setS3Cookie(contentId: string) {
    await this.contentSvc
      .setS3Cookie(contentId)
      .toPromise()
      .catch(() => {
        // throw new DataResponseError('COOKIE_SET_FAILURE')
      })
    return
  }
}
