import { Component, OnInit } from '@angular/core'
import { MatTabChangeEvent } from '@angular/material'
import { ActivatedRoute, Router } from '@angular/router'
import { NsContentStripMultiple } from '@ws-widget/collection'
import { NsWidgetResolver } from '@ws-widget/resolver'
import {
  IIndustriesData,
  IIndustriesDataTheme,
  IIndustriesIdentifiers,
  IMegaTrends,
} from '../../models/navigator.model'

@Component({
  selector: 'ws-app-industries',
  templateUrl: './industries.component.html',
  styleUrls: ['./industries.component.scss'],
})
export class IndustriesComponent implements OnInit {
  industriesData = this.route.snapshot.data.pageData.data

  tabs: string[] = []

  selectedType: string

  displayTypes: string[] = ['Mega Trends', 'Digital Pentagon']
  selectedTrend: string
  dummyTrends: string[] = ['Trend 1', 'Trend 2', 'Trend 3']
  enablePrev = false
  enableNext = false
  subDomains = {}
  contentStripsHash: IIndustriesData = {
    narratives: [],
    clientStories: [],
    techSkills: [],
    reference: [],
    megatrends: [],
  }

  baseIndustriesUrl = '/app/infy/navigator/industries/'

  subDomainMapping: any

  selectedTab = 'CME'
  selectedTabRoute = 'CME'
  anaylticsTab = 'CME'
  selectedPillar = 'Accelerate'
  selectedTheme: string
  selectedSubDomain = 'Banking'
  fetchingData: boolean
  fetchingContentData: boolean
  megaTrendSelected = false

  megaTrendwidgetResolverData: NsWidgetResolver.IRenderConfigWithTypedData<
    NsContentStripMultiple.IContentStripMultiple
  > = {
    widgetType: 'contentStrip',
    widgetSubType: 'contentStripMultiple',
    widgetData: {
      strips: [
        {
          key: 'megaTrends-strip',
          preWidgets: [],
          title: 'Mega Trends',
          filters: [],
          request: {
            ids: [],
          },
        },
      ],
      noDataWidget: {
        widgetData: {
          html:
            // tslint:disable-next-line: max-line-length
            '<div class="padding-s"> <div class="margin-bottom-s margin-top-m" i18n> <p class = "mat-h2 padding-left-m padding-right-m text-center margin-top-l font-weight">Contents will appear soon...</div>',
          containerStyle: {},
        },
        widgetSubType: 'elementHtml',
        widgetType: 'element',
      },
      errorWidget: {
        widgetType: 'errorResolver',
        widgetSubType: 'errorResolver',
        widgetData: {
          errorType: 'internalServer',
        },
      },
    },
  }

  navigatorwidgetResolverData: NsWidgetResolver.IRenderConfigWithTypedData<
    NsContentStripMultiple.IContentStripMultiple
  > = {
    widgetType: 'contentStrip',
    widgetSubType: 'contentStripMultiple',
    widgetData: {
      strips: [
        {
          key: 'narratives-strip',
          preWidgets: [],
          title: 'Narratives',
          filters: [],
          request: {
            ids: [],
          },
        },
        {
          key: 'references-strip',
          preWidgets: [],
          title: 'References',
          filters: [],
          request: {
            ids: [],
          },
        },
        {
          key: 'clientStories-strip',
          preWidgets: [],
          title: 'Client Stories',
          filters: [],
          request: {
            ids: [],
          },
        },
        {
          key: 'techSkills-strip',
          preWidgets: [],
          title: 'Tech Skills',
          filters: [],
          request: {
            ids: [],
          },
        },
      ],
      noDataWidget: {
        widgetData: {
          html:
            // tslint:disable-next-line: max-line-length
            '<div class="padding-s"> <div class="margin-bottom-s margin-top-m" i18n> <p class = "mat-h2 padding-left-m padding-right-m text-center margin-top-l font-weight">Contents will appear soon...</div>',
          containerStyle: {},
        },
        widgetSubType: 'elementHtml',
        widgetType: 'element',
      },
      errorWidget: {
        widgetType: 'errorResolver',
        widgetSubType: 'errorResolver',
        widgetData: {
          errorType: 'internalServer',
        },
      },
    },
  }

  constructor(private route: ActivatedRoute, private router: Router) {
    this.selectedType = this.displayTypes[1]
    this.selectedTrend = this.dummyTrends[0]
    this.selectedTheme = ''
    this.fetchingData = true
    this.fetchingContentData = true
  }

  ngOnInit() {
    this.fetchingData = true

    this.fetchingData = false
    this.tabs = Object.keys(this.industriesData)

    this.route.params.subscribe(params => {
      this.selectedTabRoute = params.tab ? params.tab : 'CME'
      this.selectedTab = params.tab ? params.tab.split('-').join(' ') : 'CME'
      this.anaylticsTab = this.selectedTab
      this.anaylticsTab = this.anaylticsTab.replace(' ', '-')
      this.selectedSubDomain = Object.keys(this.industriesData[this.selectedTab])[0]
      if (
        this.industriesData[this.selectedTab] &&
        this.industriesData[this.selectedTab][this.selectedSubDomain] &&
        this.industriesData[this.selectedTab][this.selectedSubDomain][this.selectedPillar] &&
        this.industriesData[this.selectedTab][this.selectedSubDomain][this.selectedPillar].length
      ) {
        this.selectedTheme = this.industriesData[this.selectedTab][this.selectedSubDomain][
          this.selectedPillar
][0].themeName
      }
      this.selectedType = this.displayTypes[1]
      this.selectedTrend = this.dummyTrends[0]
      // this.selectFirstTheme();
      this.selectMegaTrend()
      this.updateContent()
    })
  }

  fetchSubDomains() {
    if (this.industriesData) {
      const subDomains = Object.keys(this.industriesData[this.selectedTab])
      const idx = Object.keys(this.industriesData[this.selectedTab]).indexOf('hasData')
      if (idx > -1) {
        subDomains.splice(idx, 1)
      }

      return subDomains
    }
    return []
  }

  subDomainClicked(subDomain: string) {
    // this.loggerSvc.log('subdomain clicked', subDomain)
    this.selectedSubDomain = subDomain
    if (
      this.industriesData[this.selectedTab][this.selectedSubDomain][this.selectedPillar] &&
      this.industriesData[this.selectedTab][this.selectedSubDomain][this.selectedPillar].length
    ) {
      this.selectedTheme = this.industriesData[this.selectedTab][this.selectedSubDomain][
        this.selectedPillar
][0].themeName
    }
    // this.loggerSvc.log('selectedtheme', this.selectedTheme)
    // this.selectMegaTrend()
    this.updateContent()
  }

  trackClicked(track: string) {
    this.selectedPillar = track
    if (
      this.industriesData[this.selectedTab][this.selectedSubDomain][this.selectedPillar] &&
      this.industriesData[this.selectedTab][this.selectedSubDomain][this.selectedPillar].length
    ) {
      this.selectedTheme = this.industriesData[this.selectedTab][this.selectedSubDomain][
        this.selectedPillar
][0].themeName
    }
    this.updateContent()
    // this.selectedTheme = dummyData[this.selectedTab][track][0]["themeName"];
  }

  updateContent() {
    this.fetchingContentData = true
    this.contentStripsHash = {
      narratives: [],
      clientStories: [],
      techSkills: [],
      reference: [],
      megatrends: [],
    }
    this.updateContentStrip()
  }

  megaTrendModeClicked() {
    this.selectedType = this.displayTypes[0]
    this.selectMegaTrend()
  }

  navigateToAnalytics() {
    this.router.navigate(['/app/infy/navigator/analytics', this.anaylticsTab])
  }

  selectMegaTrend() {
    try {
      this.updateMegaTrends(
        this.industriesData[this.selectedTab][this.selectedSubDomain].megatrends[0],
      )
    } catch (e) {
      // //console.log(e);
    }
  }

  updateMegaTrends(trend: IMegaTrends) {
    const ids = trend.content
    this.selectedTrend = trend.trendName
    this.fetchingContentData = false
    this.megaTrendSelected = true
    this.megaTrendwidgetResolverData.widgetData.strips.forEach(strip => {
      if (strip.key === 'megaTrends-strip' && strip.request) {
        strip.request.ids = ids
      }
    })
    this.megaTrendwidgetResolverData = { ...this.megaTrendwidgetResolverData }

    // this.loggerSvc.log('widgetdata', this.megaTrendwidgetResolverData)
  }

  updateContentStrip() {
    const strips = ['narratives', 'clientStories', 'techSkills', 'reference']
    strips.forEach(stripName => {
      const idObjects: IIndustriesIdentifiers[] = this.industriesData[this.selectedTab][
        this.selectedSubDomain
][this.selectedPillar].find((themes: IIndustriesDataTheme) => {
        return themes.themeName === this.selectedTheme
      })[stripName]

      const ids = idObjects.map(id => id.identifier)
      // this.contentStripsHash[stripName] = ids

      this.navigatorwidgetResolverData.widgetData.strips.forEach(strip => {
        if (strip.key === 'narratives-strip' && strip.request && stripName === 'narratives') {
          strip.request.ids = ids
        } else if (strip.key === 'references-strip' && strip.request && stripName === 'reference') {
          strip.request.ids = ids
        } else if (
          strip.key === 'clientStories-strip' &&
          strip.request &&
          stripName === 'clientStories'
        ) {
          strip.request.ids = ids
          // //console.log("Ids assigned to client Stories", ids);
        } else if (
          strip.key === 'techSkills-strip' &&
          strip.request &&
          stripName === 'techSkills'
        ) {
          strip.request.ids = ids
          // //console.log("Ids assigned to tech", ids);
        }
      })
    })

    this.navigatorwidgetResolverData = { ...this.navigatorwidgetResolverData }
  }

  getStripMeta(stripName: string) {
    return {
      ctitle: stripName,
    }
  }

  roleClicked(role: string) {
    this.selectedTheme = role
    this.updateContent()
  }

  getSelectedIndex() {
    return this.tabs.indexOf(this.selectedTab)
  }

  navigate(event: MatTabChangeEvent) {
    // this.loggerSvc.log(event.tab.textLabel)
    this.router.navigateByUrl(this.baseIndustriesUrl + event.tab.textLabel.split(' ').join('-'))
  }
}
