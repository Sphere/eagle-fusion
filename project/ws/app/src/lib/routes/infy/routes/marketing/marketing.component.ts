import { Component, OnInit, OnDestroy } from '@angular/core'
import { ActivatedRoute, ParamMap } from '@angular/router'
import { map } from 'rxjs/operators'
import { Subscription } from 'rxjs'
import { ValueService, ConfigurationsService, EFeatures, NsPage } from '@ws-widget/utils'

@Component({
  selector: 'ws-app-marketing',
  templateUrl: './marketing.component.html',
  styleUrls: ['./marketing.component.scss'],
})
export class MarketingComponent implements OnInit, OnDestroy {
  errorMessageCode: 'API_FAILURE' | 'NO_DATA' | 'INVALID_DATA' | 'NONE' = 'NONE'
  sideNavBarOpened = true
  isMarketingFeature = true
  isLtMedium$ = this.valueSvc.isLtMedium$
  pageNavbar: Partial<NsPage.INavBackground> = this.configSvc.pageNavBar
  private defaultSideNavBarOpenedSubscription: Subscription | null = null
  mode$ = this.isLtMedium$.pipe(map(isMedium => (isMedium ? 'over' : 'side')))
  screenSizeIsLtMedium = false
  currentTab = ''
  tabs = [
    'brandAssets',
    'experience',
    'hubs',
    'clientStories',
    'services',
    'industries',
    'productSubsidiary',
  ]
  paramSubscription: Subscription | null = null
  constructor(
    private route: ActivatedRoute,
    private valueSvc: ValueService,
    private configSvc: ConfigurationsService,
  ) {}
  ngOnInit() {
    if (this.configSvc.restrictedFeatures) {
      this.isMarketingFeature = !this.configSvc.restrictedFeatures.has(EFeatures.MARKETING_PAGE)
    }
    this.defaultSideNavBarOpenedSubscription = this.isLtMedium$.subscribe((isLtMedium: boolean) => {
      this.sideNavBarOpened = !isLtMedium
      this.screenSizeIsLtMedium = isLtMedium
    })
    this.paramSubscription = this.route.paramMap.subscribe((params: ParamMap) => {
      let tab = params.get('tab')
      if (tab) {
        if (this.tabs.indexOf(tab) === -1) {
          tab = 'brandAssets'
        }
        this.currentTab = tab
      }
    })
  }

  ngOnDestroy() {
    if (this.defaultSideNavBarOpenedSubscription) {
      this.defaultSideNavBarOpenedSubscription.unsubscribe()
    }
  }

  sideNavOnClick() {
    if (this.screenSizeIsLtMedium) {
      this.sideNavBarOpened = !this.sideNavBarOpened
    }
  }
}
