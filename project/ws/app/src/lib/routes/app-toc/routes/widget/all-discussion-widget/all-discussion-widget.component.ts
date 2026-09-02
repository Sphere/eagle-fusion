import { Component, Inject } from '@angular/core'
import { ConfigService, EventsService, NavigationServiceService, DiscussionService, BaseWrapperComponent } from '@aastrika_npmjs/discussions-ui-v8'

@Component({
  standalone: false,
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
  tid: number = 0
  slug: string = ''
  context: any = { categories: { result: [] } }
  categoryId: any
  alldiscussPage = 'alldiscuss'
  previousState: any
  cIds: any = {}
  state: any = this.alldiscussPage

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

  wrapperInit() {
    this.state = this.alldiscussPage
  }

  widgetBackClick() {
    this.state = this.alldiscussPage
    this.showTrendTagPost = 0
  }

  stateChange(event: any) {
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
}
