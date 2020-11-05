import { Component, OnInit, Input, OnChanges } from '@angular/core'
import { NsDiscussionForum, NsContent } from '@ws-widget/collection'
import { NsWidgetResolver } from '@ws-widget/resolver'
import { ActivatedRoute } from '../../../../../../../../../node_modules/@angular/router'
import { ConfigurationsService } from '../../../../../../../../../library/ws-widget/utils/src/public-api'

@Component({
  selector: 'ws-app-toc-discussion',
  templateUrl: './app-toc-discussion.component.html',
  styleUrls: ['./app-toc-discussion.component.scss'],
})
export class AppTocDiscussionComponent implements OnChanges, OnInit {
  @Input() content!: NsContent.IContent
  showDiscussionForum = true
  isRestricted = true
  @Input() forPreview = false
  discussionForumWidget: NsWidgetResolver.IRenderConfigWithTypedData<
    NsDiscussionForum.IDiscussionForumInput
  > | null = null
  constructor(private activatedRoute: ActivatedRoute, private configSvc: ConfigurationsService) { }

  ngOnChanges() {
    this.forPreview = window.location.href.includes('/author/')
    if (this.content) {
      this.discussionForumWidget = {
        widgetData: {
          description: this.content.description,
          id: this.content.identifier,
          name: NsDiscussionForum.EDiscussionType.LEARNING,
          title: this.content.name,
          initialPostCount: 2,
          isDisabled: this.forPreview,
        },
        widgetSubType: 'discussionForum',
        widgetType: 'discussionForum',
      }
    }
  }

  ngOnInit() {
    if (this.configSvc.restrictedFeatures) {
      this.isRestricted =
        this.configSvc.restrictedFeatures.has('disscussionForum') ||
        this.configSvc.restrictedFeatures.has('disscussionForumTRPU')
    }
    if (this.activatedRoute.parent && this.activatedRoute.parent.data) {
      this.activatedRoute.parent.data.subscribe((data: any) => {
        if (data && data.content && data.content.data) {
          this.content = data.content.data
          this.ngOnChanges()
        }
      })
    }
  }
}
