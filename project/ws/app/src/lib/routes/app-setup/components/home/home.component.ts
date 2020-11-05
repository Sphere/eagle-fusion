import { Component, OnInit } from '@angular/core'
import { ConfigurationsService } from '../../../../../../../../../library/ws-widget/utils/src/public-api'
import { SafeUrl, DomSanitizer } from '@angular/platform-browser'
import { Event, NavigationEnd, Router } from '@angular/router'

@Component({
  selector: 'ws-app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  appIcon: SafeUrl = ''
  stepCount = 1
  appName = ''
  showStepCount = false
  constructor(private configSvc: ConfigurationsService, private domSanitizer: DomSanitizer, private router: Router) {
    this.router.events.subscribe((e: Event) => {
      if (e instanceof NavigationEnd) {
        if (e.url.includes('lang')) {
          this.stepCount = 1
          this.showStepCount = true
        } else if (e.url.includes('tnc')) {
          this.stepCount = 2
          this.showStepCount = true
        } else if (e.url.includes('about-video')) {
          this.stepCount = 3
          this.showStepCount = true
        } else if (e.url.includes('interest')) {
          this.stepCount = 4
          this.showStepCount = true
        } else {
          this.showStepCount = false
        }

      }
    })
  }

  ngOnInit() {
    if (this.configSvc.instanceConfig) {
      this.appName = this.configSvc.instanceConfig.details.appName
      this.appIcon = this.domSanitizer.bypassSecurityTrustResourceUrl(
        this.configSvc.instanceConfig.logos.appTransparent,
      )
    }
  }

}
