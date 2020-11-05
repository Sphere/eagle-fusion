import { Component, OnInit, OnDestroy } from '@angular/core'
import { ActivatedRoute, ParamMap } from '@angular/router'
import { map } from 'rxjs/operators'
import { Subscription } from 'rxjs'
import { ValueService, ConfigurationsService, EFeatures, NsPage } from '@ws-widget/utils'

@Component({
  selector: 'ws-public-faq',
  templateUrl: './public-faq.component.html',
  styleUrls: ['./public-faq.component.scss'],
})
export class PublicFaqComponent implements OnInit, OnDestroy {
  errorMessageCode: 'API_FAILURE' | 'NO_DATA' | 'INVALID_DATA' | 'NONE' = 'NONE'
  sideNavBarOpened = true
  pageNavbar: Partial<NsPage.INavBackground> = this.configSvc.pageNavBar
  isFaqFeature = true
  isLtMedium$ = this.valueSvc.isLtMedium$
  private defaultSideNavBarOpenedSubscription: Subscription | null = null
  mode$ = this.isLtMedium$.pipe(map(isMedium => (isMedium ? 'over' : 'side')))
  screenSizeIsLtMedium = false
  currentTab = ''
  tabs = [
    'login',
    'odcAccess',
    'compatibility',
    'installation',
    'progressCompletion',
    'video',
    'post-learn',
    'authoring',
  ]
  paramSubscription: Subscription | null = null
  constructor(
    private route: ActivatedRoute,
    private valueSvc: ValueService,
    private configSvc: ConfigurationsService,
  ) {}
  ngOnInit() {
    if (this.configSvc.restrictedFeatures) {
      this.isFaqFeature = !this.configSvc.restrictedFeatures.has(EFeatures.FAQ)
    }
    this.defaultSideNavBarOpenedSubscription = this.isLtMedium$.subscribe((isLtMedium: boolean) => {
      this.sideNavBarOpened = !isLtMedium
      this.screenSizeIsLtMedium = isLtMedium
    })
    this.paramSubscription = this.route.paramMap.subscribe((params: ParamMap) => {
      let tab = params.get('tab')
      if (tab) {
        if (this.tabs.indexOf(tab) === -1) {
          tab = 'login'
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
