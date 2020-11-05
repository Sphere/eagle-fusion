import { Component, OnInit, OnDestroy } from '@angular/core'
import { Subscription } from 'rxjs'
import { ActivatedRoute } from '@angular/router'
import { map } from 'rxjs/operators'

import { ValueService, ConfigurationsService, EFeatures, NsPage } from '@ws-widget/utils'
import { IFAQ, IContent } from '../faq.model'

@Component({
  selector: 'ws-app-faq-home',
  templateUrl: './faq-home.component.html',
  styleUrls: ['./faq-home.component.scss'],
})
export class FaqHomeComponent implements OnInit, OnDestroy {
  errorMessageCode: 'API_FAILURE' | 'NO_DATA' | 'INVALID_DATA' | 'NONE' = 'NONE'
  sideNavBarOpened = true
  pageNavbar: Partial<NsPage.INavBackground> = this.configSvc.pageNavBar
  isFaqFeature = true
  isLtMedium$ = this.valueSvc.isLtMedium$
  private defaultSideNavBarOpenedSubscription: Subscription | null = null
  mode$ = this.isLtMedium$.pipe(map(isMedium => (isMedium ? 'over' : 'side')))
  screenSizeIsLtMedium = false
  selectedTabData: IContent[] | null = null
  selectedTabIndex = 0
  faqConfigs: IFAQ[] | null = null

  private subscriptionFAQ: Subscription | null = null
  private subscriptionActiveFAQ: Subscription | null = null
  constructor(
    private route: ActivatedRoute,
    private valueSvc: ValueService,
    private configSvc: ConfigurationsService,
  ) { }
  ngOnInit() {
    this.subscriptionFAQ = this.route.data.subscribe(data => {
      this.faqConfigs = data.pageData.data
      if (this.faqConfigs) {
        this.selectedTabData = this.faqConfigs[0].contents
        this.selectedTabIndex = 0
      }
    })
    this.subscriptionActiveFAQ = this.route.queryParamMap.subscribe(queryParam => {
      const activeTab = queryParam.get('tab') || ''
      if (this.faqConfigs) {
        this.faqConfigs.forEach((config, index) => {
          if (config.groupKey === activeTab) {
            this.selectedTabIndex = index
            this.selectedTabData = this.faqConfigs && this.faqConfigs[index].contents
          }
        })
      }
    })
    // todo

    if (this.configSvc.restrictedFeatures) {
      this.isFaqFeature = !this.configSvc.restrictedFeatures.has(EFeatures.FAQ)
    }
    this.defaultSideNavBarOpenedSubscription = this.isLtMedium$.subscribe((isLtMedium: boolean) => {
      this.sideNavBarOpened = !isLtMedium
      this.screenSizeIsLtMedium = isLtMedium
    })
  }

  ngOnDestroy() {
    if (this.subscriptionFAQ) {
      this.subscriptionFAQ.unsubscribe()
    }
    if (this.defaultSideNavBarOpenedSubscription) {
      this.defaultSideNavBarOpenedSubscription.unsubscribe()
    }
    if (this.subscriptionActiveFAQ) {
      this.subscriptionActiveFAQ.unsubscribe()
    }
  }

  sideNavOnClick(index: number) {
    if (this.faqConfigs) {
      this.selectedTabData = this.faqConfigs[index].contents
      this.selectedTabIndex = index
    }
    if (this.screenSizeIsLtMedium) {
      this.sideNavBarOpened = !this.sideNavBarOpened
    }
  }
}
