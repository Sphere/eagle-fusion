import { Component, Input, OnInit } from '@angular/core'
import { SocialForum } from '../models/SocialForumposts.model'
import { ConfigurationsService } from '@ws-widget/utils'

@Component({
  selector: 'ws-app-forum-card',
  templateUrl: './forum-card.component.html',
  styleUrls: ['./forum-card.component.scss'],
})
export class ForumCardComponent implements OnInit {
  @Input() post: SocialForum.ITimelineResult | null = null
  @Input() partOfRequired = true

  showSocialLike = false

  constructor(private configSvc: ConfigurationsService) { }

  ngOnInit() {

    this.showSocialLike = (this.configSvc.restrictedFeatures && !this.configSvc.restrictedFeatures.has('socialLike')) || false
  }

}
