import { Component, Inject } from '@angular/core'
import { ConfigService, EventsService, NavigationServiceService, DiscussionService, BaseWrapperComponent } from '@aastrika_npmjs/discussions-ui-v8'
// import { EventsService } from '@project-sunbird/discussions-ui-v8/lib/events.service'
// import { NavigationServiceService } from '@project-sunbird/discussions-ui-v8/lib/navigation-service.service'
// import { DiscussionService } from '@project-sunbird/discussions-ui-v8/lib/services/discussion.service'
// import { BaseWrapperComponent } from '@project-sunbird/discussions-ui-v8/lib/wrapper/base-wrapper/base-wrapper.component'
// import lodash from 'lodash'
// import * as CONSTANTS from '@project-sunbird/discussions-ui-v8'

@Component({
  selector: 'all-discussion-widget',
  templateUrl: './all-discussion-widget.component.html',
  styleUrls: ['./all-discussion-widget.component.css'],
})
export class AllDiscussionWidgetComponent extends BaseWrapperComponent {

  detailsToggle = true
  category = 'category'
  detailsPage = 'categoryDetails'
  tagAllDiscussPage = 'tagAllDiscuss'
  homePage = 'categoryHome'
  showTrendTagPost = 0
  tid!: number
  slug!: string
  context: any = { categories: { result: [] } }
  categoryId: any
  alldiscussPage = 'alldiscuss'
  previousState: any
  cIds: any = {}

  constructor(
    @Inject(ConfigService)
    configSvc: ConfigService,
    @Inject(DiscussionService)
    discussionService: DiscussionService,
    @Inject(NavigationServiceService)
    navigationServiceService: NavigationServiceService,
    @Inject(EventsService)
    eventService: EventsService) {
    super(navigationServiceService, eventService, configSvc, discussionService)
  }
  // @Input() config

  wrapperInit() {
    this.state = this.alldiscussPage
  }

  widgetBackClick() {
    this.state = this.alldiscussPage
    this.showTrendTagPost = 0
  }

  stateChange(event: any) {
    // debugger
    // console.log(event)
    this.previousState = this.state
    this.state = event.action
    if (event.action === this.detailsPage) {
      this.tid = event.tid
      this.slug = event.title
      this.showTrendTagPost = 0
    }

    if (event.action === this.tagAllDiscussPage) {
      this.tid = event.tid
      this.slug = event.title
      this.showTrendTagPost = 1
      this.cIds.result = event.cIds
    }
  }

  // protected wrapperEventListener(data: any) {
  // }
}
