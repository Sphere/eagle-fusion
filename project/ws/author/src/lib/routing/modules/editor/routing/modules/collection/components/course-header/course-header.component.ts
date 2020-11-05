
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'
import { ConfigurationsService } from '@ws-widget/utils/src/public-api'
import { SafeUrl, DomSanitizer } from '@angular/platform-browser'
import { HeaderServiceService } from './../../../../../../../../../../../../../src/app/services/header-service.service'
import { IActionButtonConfig, IActionButton } from '@ws/author/src/lib/interface/action-button'
import { CollectionStoreService } from '../../services/store.service'

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'ws-author-course-header',
  templateUrl: './course-header.component.html',
  styleUrls: ['./course-header.component.scss'],
})
export class CourseHeaderComponent implements OnInit {
  appIcon: SafeUrl | null = null
  courseNameHeader: any
  @Input() buttonConfig: IActionButtonConfig | null = null
  @Output() action = new EventEmitter<string>()
  @Output() subAction = new EventEmitter<{ type: string; identifier: string; nodeClicked?: boolean }>()

  requiredConfig: IActionButton[] = []

  constructor(private configSvc: ConfigurationsService, private domSanitizer: DomSanitizer,
              private headerService: HeaderServiceService,
              private store: CollectionStoreService) {
                this.headerService.showCourseHeader.subscribe(data => {
                  this.courseNameHeader = data
                })
   }

  ngOnInit() {
    if (this.configSvc.instanceConfig) {
       this.domSanitizer.bypassSecurityTrustResourceUrl(
        this.appIcon = this.configSvc.instanceConfig.logos.app,
      )
    }

    if (this.buttonConfig) {
      this.buttonConfig.buttons.forEach(button => {
        if (button.event === 'save' || button.event === 'push' || button.title === 'saveAndNext') {
          this.requiredConfig.push(button)
        }
      })
    }
  }
  showCourseSettings() {
   this.subAction.emit({ type: 'editContent', identifier: this.store.parentNode[0], nodeClicked: true })
  }
}
