import { Component, Input, OnInit } from '@angular/core'
import { ConfigurationsService, EventService } from '@ws-widget/utils'
import { WidgetContentService } from '../../_services/widget-content.service'

@Component({
  selector: 'ws-widget-user-content-rating',
  templateUrl: './user-content-rating.component.html',
  styleUrls: ['./user-content-rating.component.scss'],
})
export class UserContentRatingComponent implements OnInit {
  @Input() contentId!: string
  @Input() isDisabled = false
  isRequesting = true
  userRating = 0
  @Input() forPreview = false
  averageRatings = 0

  constructor(
    private events: EventService,
    private contentSvc: WidgetContentService,
    private configSvc: ConfigurationsService,
  ) { }

  ngOnInit() {
    if (!this.forPreview) {
      this.contentSvc.fetchContentRating(this.contentId).subscribe(
        result => {
          this.isRequesting = false
          this.userRating = result.rating
        },
        _err => {
          this.isRequesting = false
        },
      )
    }
  }

  addRating(index: number) {
    if (!this.forPreview) {
      this.isRequesting = true
      const previousRating = this.userRating
      if (this.userRating !== index + 1) {
        this.userRating = index + 1
        this.events.raiseInteractTelemetry('rating', 'content', {
          contentId: this.contentId,
          rating: this.userRating,
        })
        this.contentSvc.addContentRating(this.contentId, { rating: this.userRating }).subscribe(
          _ => {
            this.isRequesting = false
          },
          _ => {
            this.isRequesting = false
            this.userRating = previousRating
          },
        )
      } else {
        this.contentSvc.deleteContentRating(this.contentId).subscribe(
          _ => {
            this.userRating = 0
            this.isRequesting = false
          },
          _ => {
            this.isRequesting = false
            this.userRating = previousRating
          },
        )
      }
    } else {
      this.userRating = index + 1
    }
  }

  public get enableFeature(): boolean {
    switch (this.configSvc.rootOrg) {
      default:
        return true
    }
  }
}
