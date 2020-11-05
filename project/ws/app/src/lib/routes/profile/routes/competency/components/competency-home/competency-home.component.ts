import { Component, OnInit } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { ConfigurationsService } from '../../../../../../../../../../../library/ws-widget/utils/src/public-api'

@Component({
  selector: 'ws-app-competency-home',
  templateUrl: './competency-home.component.html',
  styleUrls: ['./competency-home.component.scss'],
})
export class CompetencyHomeComponent implements OnInit {
  enabledTab = this.activatedRoute.snapshot.data.pageData.data.enabledTabs.achievements.subTabs
  badgesEnabled = false
  constructor(
    private activatedRoute: ActivatedRoute,
    private configSvc: ConfigurationsService,
  ) { }

  ngOnInit() {
    this.badgesEnabled = (this.configSvc.restrictedFeatures && !this.configSvc.restrictedFeatures.has('badgeEnabled')) || false
  }

}
