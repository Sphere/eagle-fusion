import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core'
import { Subscription } from 'rxjs'
import { ConfigurationsService, EventService, UtilityService } from '../../../../utils/src/public-api'
import { NsContent } from '../_services/widget-content.model'
import { IKBContentCard } from './card-knowledge.model'

interface IKbCardData {
  content: IKBContentCard
  clickUrl: string
  actionBtns: { [btnId: string]: boolean }
}

@Component({
  selector: 'ws-widget-card-knowledge',
  templateUrl: './card-knowledge.component.html',
  styleUrls: ['./card-knowledge.component.scss'],
})
export class CardKnowledgeComponent implements OnInit, OnDestroy {
  @Input() widgetData!: IKbCardData
  @Output() followed = new EventEmitter<string>()
  @Output() unFollowed = new EventEmitter<string>()

  defaultThumbnail = ''
  prefChangeSubscription: Subscription | null = null
  isIntranetAllowedSettings = false
  constructor(private events: EventService, private configSvc: ConfigurationsService, private utilitySvc: UtilityService) {
    const instanceConfig = this.configSvc.instanceConfig
    if (instanceConfig) {
      this.defaultThumbnail = instanceConfig.logos.defaultContent
    }
  }

  ngOnInit() {

    this.isIntranetAllowedSettings = this.configSvc.isIntranetAllowed
    this.prefChangeSubscription = this.configSvc.prefChangeNotifier.subscribe(() => {
      this.isIntranetAllowedSettings = this.configSvc.isIntranetAllowed
    })
  }

  ngOnDestroy() {
    if (this.prefChangeSubscription) {
      this.prefChangeSubscription.unsubscribe()
    }
  }

  follow(id: string) {
    this.followed.emit(id)
  }

  unfollow(id: string) {
    this.unFollowed.emit(id)
  }

  raiseTelemetry() {
    this.events.raiseInteractTelemetry(
      'click',
      NsContent.EContentTypes.KNOWLEDGE_BOARD,
      {
        contentId: this.widgetData.content.identifier,
      },
    )
  }

  greyOut() {
    if (this.widgetData.content.isInIntranet && this.utilitySvc.isMobile) {
      return !this.isIntranetAllowedSettings
    }
    return true
  }

}
