import { Component, OnInit, Input } from '@angular/core'
import { ConfigurationsService } from '@ws-widget/utils'
import { Router } from '@angular/router'

@Component({
  selector: 'ws-app-course-pending-card',
  templateUrl: './course-pending-card.component.html',
  styleUrls: ['./course-pending-card.component.scss'],
})
export class CoursePendingCardComponent implements OnInit {
  defaultThumbnail = ''
  timeLeft: any
  @Input() cardData: any = []
  constructor(private configSvc: ConfigurationsService, private route: Router) { }

  ngOnInit() {
    const instanceConfig = this.configSvc.instanceConfig
    if (instanceConfig) {
      this.defaultThumbnail = instanceConfig.logos.defaultContent
    }
    this.timeLeft = (this.cardData.timeLeft / 60).toFixed(2)
  }
  onClickCard() {
    this.route.navigate(['/app/toc/', this.cardData.identifier, 'overview'])
  }
}
