import { Component, Input, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { ConfigurationsService, TFetchStatus, ValueService } from '@ws-widget/utils'
import { INavigatorCardModel } from '../../../../models/navigator.model'
import { NavigatorService } from '../../../../services/navigator.service'

@Component({
  selector: 'ws-app-navigator-card',
  templateUrl: './navigator-card.component.html',
  styleUrls: ['./navigator-card.component.scss'],
})
export class NavigatorCardComponent implements OnInit {
  @Input() navigatorCard!: INavigatorCardModel
  baseLpUrl = '/app/infy/navigator/lp/'
  baseFsUrl = '/app/infy/navigator/fs/program/'
  defaultThumbnail = '/assets/images/missing-thumbnail.png'

  fetchStatus: TFetchStatus = 'none'

  isXSmall$ = this.valueSvc.isXSmall$
  screenSizeIsLtMedium = false
  constructor(
    private router: Router,
    private configSvc: ConfigurationsService,
    private valueSvc: ValueService,
    private navSvc: NavigatorService,
  ) { }

  ngOnInit() {
    this.navSvc.fetchImageForContentID(this.navigatorCard.linkedIds).subscribe(
      res => {
        if (res) {
          this.navigatorCard.thumbnail = res[0].appIcon
        } else {
          if (this.configSvc.instanceConfig) {
            this.defaultThumbnail = this.configSvc.instanceConfig.logos.defaultContent
          }
        }
        this.fetchStatus = 'done'
      },
      () => {
        if (this.configSvc.instanceConfig) {
          this.defaultThumbnail = this.configSvc.instanceConfig.logos.defaultContent
        }
        this.fetchStatus = 'done'
      })
    this.isXSmall$.subscribe((isXSmall: boolean) => {
      this.screenSizeIsLtMedium = isXSmall
    })
  }

  imageClicked(navType: string) {
    if (navType === 'lp') {
      this.router.navigate([this.baseLpUrl + this.navigatorCard.routeButton])
    } else {
      this.router.navigate([this.baseFsUrl + this.navigatorCard.routeButton])
    }
  }
}
