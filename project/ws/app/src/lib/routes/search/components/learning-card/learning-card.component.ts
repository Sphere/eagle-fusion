import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core'
import { NsContent } from '@ws-widget/collection'
import { ConfigurationsService, EventService } from '@ws-widget/utils'
import { SafeHtml, DomSanitizer } from '@angular/platform-browser'
import { Router } from '@angular/router'

@Component({
  selector: 'ws-app-learning-card',
  templateUrl: './learning-card.component.html',
  styleUrls: ['./learning-card.component.scss'],
})
export class LearningCardComponent implements OnInit, OnChanges {
  @Input()
  displayType: 'basic' | 'advanced' = 'basic'
  @Input()
  content: NsContent.IContent = {} as NsContent.IContent
  contentProgress = 0
  isExpanded = false
  defaultThumbnail = ''
  description: SafeHtml = ''
  constructor(
    private events: EventService,
    private configSvc: ConfigurationsService,
    private domSanitizer: DomSanitizer,
    private router: Router
  ) { }

  ngOnInit() {
    const instanceConfig = this.configSvc.instanceConfig
    if (instanceConfig) {
      this.defaultThumbnail = instanceConfig.logos.defaultContent
    }

  }
  ngOnChanges(changes: SimpleChanges) {
    for (const prop in changes) {
      if (prop === 'content' && this.content.description) {
        this.content.description = this.content.description.replace(/<br>/g, '')
        this.description = this.domSanitizer.bypassSecurityTrustHtml(this.content.description)
      }
    }
  }

  raiseTelemetry(content: any) {
    const url = `app/toc/` + `${content.identifier}` + `/overview?primaryCategory=Course`
    if (localStorage.getItem('telemetrySessionId') === null) {
      sessionStorage.setItem(`url_before_login`, url)
      this.router.navigateByUrl('app/login')
      this.events.raiseInteractTelemetry(
        'click',
        'cardSearch',
        {
          contentId: this.content.identifier,

        },
      )
    } else {
      this.router.navigateByUrl(url)
    }
  }
}
