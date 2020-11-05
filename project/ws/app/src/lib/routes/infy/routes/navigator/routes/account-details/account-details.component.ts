import { Component, OnInit } from '@angular/core'
import { Subscription } from 'rxjs'
import { Router, ActivatedRoute } from '@angular/router'
import { IIndustries, ISubPillar, IPillarSection } from '../../models/account.model'
import { MatTabChangeEvent } from '@angular/material'
import { NsWidgetResolver } from '@ws-widget/resolver'
import { ILpData } from '../../models/navigator.model'
import { NsContentStripMultiple, NsError, ROOT_WIDGET_CONFIG } from '@ws-widget/collection'

@Component({
  selector: 'ws-app-account-details',
  templateUrl: './account-details.component.html',
  styleUrls: ['./account-details.component.scss'],
})
export class AccountDetailsComponent implements OnInit {
  tabs: string[] = []
  fetchingContentData = false
  contentStripsHash = {}
  accountsData: IIndustries = {}
  accountsActive = false
  updateCalled = false
  contentStrips = [
    {
      id: 'overview',
      title: 'Overview',
    },
    {
      id: 'gtm',
      title: 'Case Study',
    },
    {
      id: 'tech',
      title: 'Technology',
    },
  ]
  selectedTab: string
  selectedAccount: string
  selectedPortfolio: string
  selectedPillar = 'Accelerate'
  selectedTheme: string
  noData = false

  baseAccountsUrl = '/app/infy/navigator/accounts/'

  overviewWidgetResolverData: NsWidgetResolver.IRenderConfigWithTypedData<
    NsContentStripMultiple.IContentStripMultiple
  > = {
      // tslint:disable-next-line: ter-indent
      widgetType: 'contentStrip',
      // tslint:disable-next-line: ter-indent
      widgetSubType: 'contentStripMultiple',
      // tslint:disable-next-line: ter-indent
      widgetData: {
        strips: [
          {
            key: 'overview-strip',
            preWidgets: [],
            title: 'Overview',
            filters: [],
            request: {
              ids: [],
            },
          },
          {
            key: 'gtm-strip',
            preWidgets: [],
            title: 'Contents',
            filters: [],
            request: {
              ids: [],
            },
          },
          {
            key: 'tech-strip',
            preWidgets: [],
            title: 'Tech Skills',
            filters: [],
            request: {
              ids: [],
            },
          },
        ],
        errorWidget: {
          widgetType: 'errorResolver',
          widgetSubType: 'errorResolver',
          widgetData: {
            errorType: 'contentUnavailable',
          },
        }, noDataWidget: {
          widgetData: {
            // tslint:disable-next-line: max-line-length
            html: '<div class="padding-s"> <div class="margin-bottom-s margin-top-m" i18n> <p class = "mat-h2 padding-left-m padding-right-m text-center margin-top-l font-weight">Contents will appear soon...</div>',
            containerStyle: {},
          },
          widgetSubType: 'elementHtml',
          widgetType: 'element',
        },
        loader: true,
      },
      // tslint:disable-next-line: ter-indent
    }

  errorWidget: NsWidgetResolver.IRenderConfigWithTypedData<NsError.IWidgetErrorResolver> = {
    widgetType: ROOT_WIDGET_CONFIG.errorResolver._type,
    widgetSubType: ROOT_WIDGET_CONFIG.errorResolver.errorResolver,
    widgetData: {
      errorType: 'contentUnavailable',
    },
  }

  routeSubscription: Subscription | null = null

  constructor(
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.selectedAccount = ''
    this.selectedPillar = ''
    this.selectedTheme = ''
    this.selectedPortfolio = ''
    this.selectedTab = ''
  }

  ngOnInit() {
    this.accountsData = this.route.snapshot.data.pageData.data

    this.tabs = Object.keys(this.accountsData).sort()
    this.routeSubscription = this.route.params.subscribe(params => {
      if (params['tab']) {
        this.selectedTab = params.tab.toLowerCase() || 'communications'
        // this.logger.log('selected', this.selectedTab)
        const data = this.accountsData[this.selectedTab]
        if (Object.keys(data).length) {
          this.noData = false
          this.updateData()
        } else {
          this.noData = true
        }
      } else {
        this.selectedTab = 'communications'
        this.updateData()
      }
    })
  }

  updateData() {
    this.updateCalled = true
    this.fetchingContentData = true
    // this.logger.log('tab', this.selectedTab)
    this.selectedAccount = this.fetchAccounts()[0]
    // this.logger.log('Check account', this.selectedAccount)
    this.selectedPortfolio = this.fetchPortfolios()[0]
    // this.logger.log('Check portfolio', this.selectedPortfolio)

    this.selectedTheme = this.fetchThemes()[0]
    // this.logger.log('Check theme', this.selectedTheme)

    //     const pillars: ISubPillar = this.accountsData[this.selectedTab][this.selectedAccount][
    // this.selectedPortfolio
    // ][this.selectedPillar][this.selectedTheme]
    // this.logger.log('Check pillars', pillars)
    this.updateContentStrip()
  }

  getStripMeta(stripName: string) {
    return {
      ctitle: stripName,
    }
  }

  updateContentStrip() {
    if (this.updateCalled) {
      const pillars: ISubPillar = this.accountsData[this.selectedTab][this.selectedAccount][
        this.selectedPortfolio][this.selectedPillar][this.selectedTheme]

      const gtmIds: string[] = []
      const overViewIds: string[] = []
      const techIds: string[] = []

      pillars.gtm.forEach((pillarSection: IPillarSection) => {
        gtmIds.push(pillarSection.identifier)
      })

      pillars.overview.forEach((pillarSection: IPillarSection) => {
        overViewIds.push(pillarSection.identifier)
      })

      pillars.tech.forEach((pillarSection: IPillarSection) => {
        techIds.push(pillarSection.identifier)
      })

      this.overviewWidgetResolverData.widgetData.strips.forEach(strip => {
        if (strip.key === 'overview-strip' && strip.request && strip.request.ids) {
          const overviewSet = new Set(overViewIds)
          strip.request.ids = Array.from(overviewSet)
        } else if (strip.key === 'gtm-strip' && strip.request) {
          strip.request.ids = gtmIds
        } else if (strip.key === 'tech-strip' && strip.request) {
          strip.request.ids = techIds
        }
      })
      this.overviewWidgetResolverData = { ...this.overviewWidgetResolverData }
      this.updateCalled = false
      // this.logger.log('gtm', this.gtmWidgetResolverData)
    }
  }

  knowMoreClicked(lpItem: ILpData) {
    this.router.navigateByUrl(lpItem.lp_external_certification[0].lp_external_certification_link)
  }

  fetchAccounts() {
    try {
      return Object.keys(this.accountsData[this.selectedTab])
    } catch (e) {
      return []
    }
  }

  fetchPortfolios() {
    try {
      return Object.keys(this.accountsData[this.selectedTab][this.selectedAccount])
    } catch (e) {
      return []
    }
  }

  fetchThemes() {
    try {
      return Object.keys(
        this.accountsData[this.selectedTab][this.selectedAccount][this.selectedPortfolio][
        this.selectedPillar],
      )
    } catch (e) {
      return []
    }
  }

  accountClicked(account: string) {
    this.updateCalled = true
    this.selectedAccount = account
    this.selectedPortfolio = this.fetchPortfolios()[0]
    this.selectedTheme = this.fetchThemes()[0]
    if (!this.accountsData[this.selectedTab][this.selectedAccount].length) {
      // this.logger.log('empty')
      this.noData = true
    } else {
      // this.logger.log('Account', this.selectedAccount, this.selectedPortfolio, this.selectedTheme)
      this.updateContentStrip()
    }
  }

  portfolioClicked(portfolio: string) {
    this.updateCalled = true
    this.selectedPortfolio = portfolio
    this.selectedTheme = this.fetchThemes()[0]
    this.updateContentStrip()
  }

  pillarClicked(pillar: string) {
    if (this.selectedPillar !== pillar) {
      this.updateCalled = true
      this.selectedPillar = pillar
      this.selectedTheme = this.fetchThemes()[0]
      this.updateContentStrip()
      this.selectedPillar = pillar
    }
  }

  themeClicked(theme: string) {
    this.updateCalled = true
    this.selectedTheme = theme
    this.updateContentStrip()
  }

  isObjectEmpty(obj: {}) {
    if (!obj) {
      return true
    }

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        return false
      }
    }
    return true
  }

  getSelectedIndex() {
    return this.tabs.indexOf(this.selectedTab)
  }

  navigate(event: MatTabChangeEvent) {
    this.updateCalled = true
    this.routeSubscription = this.route.params.subscribe(params => {
      if (params['tab']) {
        this.selectedTab = params.tab.toLowerCase() || 'communications'
        const data = this.accountsData[this.selectedTab]
        if (Object.keys(data).length) {
          this.noData = false
          this.updateData()
        } else {
          this.noData = true
        }
      } else {
        this.selectedTab = 'communications'
        this.updateData()
      }
    })
    this.noData = false
    this.router.navigateByUrl(this.baseAccountsUrl + event.tab.textLabel)
  }

  caps(str: string) {
    return str.toLocaleUpperCase()
  }
}
