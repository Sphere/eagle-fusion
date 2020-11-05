import { Component, OnInit } from '@angular/core'
import { ConfigurationsService, TFetchStatus } from '@ws-widget/utils'
import { NavigatorService } from '../../services/navigator.service'
import { IBpmData } from '../../models/navigator.model'
import { ActivatedRoute, Data } from '@angular/router'
import { Subscription } from 'rxjs'

interface INavigatorTabs {
  techNavigator: boolean,
  salesNavigator: boolean,
  onboardingNavigator: boolean,
  bpmNavigator: boolean
}

@Component({
  selector: 'ws-app-navigator-home',
  templateUrl: './navigator-home.component.html',
  styleUrls: ['./navigator-home.component.scss'],
})
export class NavigatorHomeComponent implements OnInit {
  bpmData: IBpmData[] = []
  status: TFetchStatus = 'none'
  routeSubscription: Subscription | null = null
  navigatorTabs: INavigatorTabs | null = null
  navigatorCards: any = null

  selectedIndex = 0
  constructor(
    public configSvc: ConfigurationsService,
    private navSvc: NavigatorService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.routeSubscription = this.route.data.subscribe((data: Data) => {
      this.navigatorTabs = data.pageData.data.tabs
      this.navigatorCards = data.pageData.data.cards
      if (this.navigatorTabs && this.navigatorTabs.bpmNavigator) {
        this.navSvc.fetchBpmData().subscribe((res: any) => {
          this.bpmData = res.data
          this.status = 'done'
        })
      }
    })
  }

}
