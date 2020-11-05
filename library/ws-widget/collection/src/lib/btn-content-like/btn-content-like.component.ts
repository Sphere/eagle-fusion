import { Component, Input, OnDestroy, OnInit } from '@angular/core'
import { NsWidgetResolver, WidgetBaseComponent } from '@ws-widget/resolver'
import { Subscription } from 'rxjs'
import { ConfigurationsService, EventService, WsEvents } from '../../../../utils'
import { BtnContentLikeService } from './btn-content-like.service'

@Component({
  selector: 'ws-widget-btn-content-like',
  templateUrl: './btn-content-like.component.html',
  styleUrls: ['./btn-content-like.component.scss'],
})
export class BtnContentLikeComponent extends WidgetBaseComponent
  implements
  OnInit,
  OnDestroy,
  NsWidgetResolver.IWidgetData<{
    identifier: string
    isDisabled?: boolean
    totalLikes?: { [key: string]: number }
  }> {
  @Input() widgetData!: { identifier: string; isDisabled?: boolean }
  @Input() likesCount = 0
  @Input() color: 'primary' | 'accent' | 'default' = 'default'
  @Input() forPreview = false

  status: 'LIKED' | 'NOT_LIKED' | 'PENDING' = 'PENDING'
  isRestricted = false
  rootOrg = this.configSvc.rootOrg
  private likeSubscription: Subscription | null = null
  constructor(
    private events: EventService,
    private btnLikeSvc: BtnContentLikeService,
    private configSvc: ConfigurationsService,
  ) {
    super()
    if (this.configSvc.restrictedFeatures) {
      this.isRestricted = this.configSvc.restrictedFeatures.has('contentLike')
    }
  }

  get showLikesCount(): boolean {
    switch (this.configSvc.rootOrg) {
      default:
        return false
    }
  }

  get showCount(): boolean {
    if (this.showLikesCount) {
      if (this.likesCount > 0) {
        return true
      }
      return false
    }
    return false
  }

  ngOnInit() {
    if (!this.isRestricted && !this.forPreview) {
      this.likeSubscription = this.btnLikeSvc
        .isLikedFor(this.widgetData.identifier)
        .subscribe(isLiked => {
          if (isLiked) {
            this.status = 'LIKED'
          } else if (this.btnLikeSvc.fetchingLikes) {
            this.status = 'PENDING'
          } else {
            this.status = 'NOT_LIKED'
          }
        })
    } else {
      this.status = 'NOT_LIKED'
    }
  }
  ngOnDestroy() {
    if (this.likeSubscription) {
      this.likeSubscription.unsubscribe()
    }
  }
  like(event: Event) {
    if (!this.forPreview) {
      event.stopPropagation()
      this.raiseTelemetry('like')
      this.status = 'PENDING'
      this.btnLikeSvc.like(this.widgetData.identifier).subscribe(
        (data: { [key: string]: number }) => {
          if (data) {
            this.likesCount = data[this.widgetData.identifier]
          }
          this.status = 'LIKED'
        },
        () => {
          this.status = 'NOT_LIKED'
        },
      )
    } else {
      this.status = this.status === 'LIKED' ? 'NOT_LIKED' : 'LIKED'
    }
  }
  unlike(event: Event) {
    if (!this.forPreview) {
      event.stopPropagation()
      this.raiseTelemetry('unlike')
      this.status = 'PENDING'
      this.btnLikeSvc.unlike(this.widgetData.identifier).subscribe(
        (data: { [key: string]: number }) => {
          if (data) {
            this.likesCount = data[this.widgetData.identifier]
          }
          this.status = 'NOT_LIKED'
          this.events.dispatchEvent({
            eventType: WsEvents.WsEventType.Action,
            eventLogLevel: WsEvents.WsEventLogLevel.Info,
            from: 'favourites',
            to: 'favouritesStrip',
            data: null,
          })
        },
        () => {
          this.status = 'LIKED'
        },
      )
    } else {
      this.status = this.status === 'LIKED' ? 'NOT_LIKED' : 'LIKED'
    }
  }

  raiseTelemetry(action: 'like' | 'unlike') {
    this.events.raiseInteractTelemetry(action, 'content', {
      contentId: this.widgetData.identifier,
    })
  }
}
