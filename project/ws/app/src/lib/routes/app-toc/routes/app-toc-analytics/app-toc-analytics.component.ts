import { Component, OnInit, OnDestroy } from '@angular/core'
import { Subscription } from 'rxjs'
import { TFetchStatus, ConfigurationsService } from '@ws-widget/utils'
import { ActivatedRoute, Data } from '@angular/router'
import { AppTocService } from '../../services/app-toc.service'
import { NsContent, ROOT_WIDGET_CONFIG, IGraphWidget, NsError } from '@ws-widget/collection'
import { NsWidgetResolver } from '@ws-widget/resolver'
import { NsAnalytics, NsCourseAnalytics } from '../../models/app-toc-analytics.model'

@Component({
  selector: 'ws-app-app-toc-analytics',
  templateUrl: './app-toc-analytics.component.html',
  styleUrls: ['./app-toc-analytics.component.scss'],
})
export class AppTocAnalyticsComponent implements OnInit, OnDestroy {
  content: NsContent.IContent | null = null
  routeParentSubscription: Subscription | null = null
  analyticsData: NsAnalytics.IAnalyticsResponse | null = null
  analyticsSubscription: Subscription | null = null
  analyticsDataClient: NsCourseAnalytics.ICourseAnalyticsData | null = null
  uniqueUsers = 0
  isCustomizableColor = false
  isCustomizableType = false
  isExpandTrue = false
  barChartUnitData: IGraphWidget = {} as IGraphWidget
  barChartAccountData: IGraphWidget = {} as IGraphWidget
  barChartLocationData: IGraphWidget = {} as IGraphWidget
  barChartPuData: IGraphWidget = {} as IGraphWidget
  barChartJLData: IGraphWidget = {} as IGraphWidget
  barChartOnExpandData: IGraphWidget = {} as IGraphWidget
  uniqueUsersDescription = 'How many unique users have visited the contents of this page?'
  hits = 0
  hitsDescription =
    'How many views were recorded for the contents of this page? A view is recorded every time a user accesses a content'
  avgTimeSpent = 0.0
  dailyDate = ''
  months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  timeSpentDescription =
    'How much time was spent per user on the contents of this page in average in minutes?'
  barChartDeptData: IGraphWidget = {} as IGraphWidget
  barChartCountryData: IGraphWidget = {} as IGraphWidget
  pieChartDeviceData: IGraphWidget = {} as IGraphWidget
  pieChartDeviceHitsData: IGraphWidget = {} as IGraphWidget
  barChartDeptHitsData: IGraphWidget = {} as IGraphWidget
  barChartCountryHitsData: IGraphWidget = {} as IGraphWidget
  barChartExpandClientData: IGraphWidget = {} as IGraphWidget
  barChartDailyUsersData: IGraphWidget = {} as IGraphWidget
  barChartDailyHitsData: IGraphWidget = {} as IGraphWidget
  fetchStatus: TFetchStatus = 'none'
  prefChangeSubscription: Subscription | null = null
  onsiteOffshoreData: IGraphWidget = {} as IGraphWidget
  apiLinkAccess = this.route.snapshot.data.pageData.data.analytics
  errorWidget: NsWidgetResolver.IRenderConfigWithTypedData<NsError.IWidgetErrorResolver> = {
    widgetType: ROOT_WIDGET_CONFIG.errorResolver._type,
    widgetSubType: ROOT_WIDGET_CONFIG.errorResolver.errorResolver,
    widgetData: {
      errorType: 'internalServer',
    },
  }
  // tslint:disable-next-line: max-line-length
  chartColors = [
    'rgb(240, 179, 35)',
    'rgb(255, 82, 61)',
    'rgb(120, 157, 74)',
    'rgb(160, 94, 181)',
    'rgb(32, 150, 205)',
    'rgb(104, 210, 223)',
    'rgb(240, 179, 35)',
    'rgb(255, 82, 61)',
    'rgb(120, 157, 74)',
    'rgb(160, 94, 181)',
    'rgb(32, 150, 205)',
    'rgb(104, 210, 223)',
    'rgb(240, 179, 35)',
    'rgb(255, 82, 61)',
    'rgb(120, 157, 74)',
    'rgb(160, 94, 181)',
    'rgb(32, 150, 205)',
    'rgb(104, 210, 223)',
    'rgb(240, 179, 35)',
    'rgb(255, 82, 61)',
    'rgb(120, 157, 74)',
    'rgb(160, 94, 181)',
    'rgb(32, 150, 205)',
    'rgb(104, 210, 223)',
    'rgb(240, 179, 35)',
    'rgb(255, 82, 61)',
    'rgb(120, 157, 74)',
    'rgb(160, 94, 181)',
    'rgb(32, 150, 205)',
    'rgb(104, 210, 223)',
    'rgb(240, 179, 35)',
    'rgb(255, 82, 61)',
    'rgb(120, 157, 74)',
    'rgb(160, 94, 181)',
    'rgb(32, 150, 205)',
    'rgb(104, 210, 223)',
    'rgb(240, 179, 35)',
    'rgb(255, 82, 61)',
    'rgb(120, 157, 74)',
    'rgb(160, 94, 181)',
    'rgb(32, 150, 205)',
    'rgb(104, 210, 223)',
    'rgb(240, 179, 35)',
    'rgb(255, 82, 61)',
    'rgb(120, 157, 74)',
    'rgb(160, 94, 181)',
    'rgb(32, 150, 205)',
    'rgb(104, 210, 223)',
    'rgb(240, 179, 35)',
    'rgb(255, 82, 61)',
    'rgb(120, 157, 74)',
    'rgb(160, 94, 181)',
    'rgb(32, 150, 205)',
    'rgb(104, 210, 223)',
    'rgb(240, 179, 35)',
    'rgb(255, 82, 61)',
    'rgb(120, 157, 74)',
    'rgb(160, 94, 181)',
    'rgb(32, 150, 205)',
    'rgb(104, 210, 223)',
    'rgb(240, 179, 35)',
    'rgb(255, 82, 61)',
    'rgb(120, 157, 74)',
    'rgb(160, 94, 181)',
    'rgb(32, 150, 205)',
    'rgb(104, 210, 223)',
    'rgb(240, 179, 35)',
    'rgb(255, 82, 61)',
    'rgb(120, 157, 74)',
    'rgb(160, 94, 181)',
    'rgb(32, 150, 205)',
    'rgb(104, 210, 223)',
    'rgb(240, 179, 35)',
    'rgb(255, 82, 61)',
    'rgb(120, 157, 74)',
    'rgb(160, 94, 181)',
    'rgb(32, 150, 205)',
    'rgb(104, 210, 223)',
    'rgb(240, 179, 35)',
    'rgb(255, 82, 61)',
    'rgb(120, 157, 74)',
    'rgb(160, 94, 181)',
    'rgb(32, 150, 205)',
    'rgb(104, 210, 223)',
    'rgb(240, 179, 35)',
    'rgb(255, 82, 61)',
    'rgb(120, 157, 74)',
    'rgb(160, 94, 181)',
    'rgb(32, 150, 205)',
    'rgb(104, 210, 223)',
    'rgb(240, 179, 35)',
    'rgb(255, 82, 61)',
    'rgb(120, 157, 74)',
    'rgb(160, 94, 181)',
    'rgb(32, 150, 205)',
    'rgb(104, 210, 223)',
    'rgb(240, 179, 35)',
    'rgb(255, 82, 61)',
    'rgb(120, 157, 74)',
    'rgb(160, 94, 181)',
    'rgb(32, 150, 205)',
    'rgb(104, 210, 223)',
    'rgb(240, 179, 35)',
    'rgb(255, 82, 61)',
    'rgb(120, 157, 74)',
    'rgb(160, 94, 181)',
    'rgb(32, 150, 205)',
    'rgb(104, 210, 223)',
    'rgb(240, 179, 35)',
    'rgb(255, 82, 61)',
    'rgb(120, 157, 74)',
    'rgb(160, 94, 181)',
    'rgb(32, 150, 205)',
    'rgb(104, 210, 223)',
    'rgb(240, 179, 35)',
    'rgb(255, 82, 61)',
    'rgb(120, 157, 74)',
    'rgb(160, 94, 181)',
    'rgb(32, 150, 205)',
    'rgb(104, 210, 223)',
    'rgb(240, 179, 35)',
    'rgb(255, 82, 61)',
    'rgb(120, 157, 74)',
    'rgb(160, 94, 181)',
    'rgb(32, 150, 205)',
    'rgb(104, 210, 223)',
    'rgb(240, 179, 35)',
    'rgb(255, 82, 61)',
    'rgb(120, 157, 74)',
    'rgb(160, 94, 181)',
    'rgb(32, 150, 205)',
    'rgb(104, 210, 223)',
    'rgb(240, 179, 35)',
    'rgb(255, 82, 61)',
    'rgb(120, 157, 74)',
    'rgb(160, 94, 181)',
    'rgb(32, 150, 205)',
    'rgb(104, 210, 223)',
    'rgb(240, 179, 35)',
    'rgb(255, 82, 61)',
    'rgb(120, 157, 74)',
    'rgb(160, 94, 181)',
    'rgb(32, 150, 205)',
    'rgb(104, 210, 223)',
    'rgb(240, 179, 35)',
    'rgb(255, 82, 61)',
    'rgb(120, 157, 74)',
    'rgb(160, 94, 181)',
    'rgb(32, 150, 205)',
    'rgb(104, 210, 223)',
    'rgb(240, 179, 35)',
    'rgb(255, 82, 61)',
    'rgb(120, 157, 74)',
    'rgb(160, 94, 181)',
    'rgb(32, 150, 205)',
    'rgb(104, 210, 223)',
    'rgb(240, 179, 35)',
    'rgb(255, 82, 61)',
    'rgb(120, 157, 74)',
    'rgb(160, 94, 181)',
    'rgb(32, 150, 205)',
    'rgb(104, 210, 223)',
    'rgb(240, 179, 35)',
    'rgb(255, 82, 61)',
    'rgb(120, 157, 74)',
    'rgb(160, 94, 181)',
    'rgb(32, 150, 205)',
    'rgb(104, 210, 223)',
    'rgb(240, 179, 35)',
    'rgb(255, 82, 61)',
    'rgb(120, 157, 74)',
    'rgb(160, 94, 181)',
    'rgb(32, 150, 205)',
    'rgb(104, 210, 223)',
    'rgb(240, 179, 35)',
    'rgb(255, 82, 61)',
    'rgb(120, 157, 74)',
    'rgb(160, 94, 181)',
    'rgb(32, 150, 205)',
    'rgb(104, 210, 223)',
    'rgb(240, 179, 35)',
    'rgb(255, 82, 61)',
    'rgb(120, 157, 74)',
    'rgb(160, 94, 181)',
    'rgb(32, 150, 205)',
    'rgb(104, 210, 223)',
    'rgb(240, 179, 35)',
    'rgb(255, 82, 61)',
    'rgb(120, 157, 74)',
    'rgb(160, 94, 181)',
    'rgb(32, 150, 205)',
    'rgb(104, 210, 223)',
    'rgb(240, 179, 35)',
    'rgb(255, 82, 61)',
    'rgb(120, 157, 74)',
    'rgb(160, 94, 181)',
    'rgb(32, 150, 205)',
    'rgb(104, 210, 223)',
    'rgb(240, 179, 35)',
    'rgb(255, 82, 61)',
    'rgb(120, 157, 74)',
    'rgb(160, 94, 181)',
    'rgb(32, 150, 205)',
    'rgb(104, 210, 223)',
    'rgb(240, 179, 35)',
    'rgb(255, 82, 61)',
    'rgb(120, 157, 74)',
    'rgb(160, 94, 181)',
    'rgb(32, 150, 205)',
    'rgb(104, 210, 223)',
    'rgb(240, 179, 35)',
    'rgb(255, 82, 61)',
    'rgb(120, 157, 74)',
    'rgb(160, 94, 181)',
    'rgb(32, 150, 205)',
    'rgb(104, 210, 223)',
    'rgb(240, 179, 35)',
    'rgb(255, 82, 61)',
    'rgb(120, 157, 74)',
    'rgb(160, 94, 181)',
    'rgb(32, 150, 205)',
    'rgb(104, 210, 223)',
    'rgb(240, 179, 35)',
    'rgb(255, 82, 61)',
    'rgb(120, 157, 74)',
    'rgb(160, 94, 181)',
    'rgb(32, 150, 205)',
    'rgb(104, 210, 223)',
    'rgb(240, 179, 35)',
    'rgb(255, 82, 61)',
    'rgb(120, 157, 74)',
    'rgb(160, 94, 181)',
    'rgb(32, 150, 205)',
    'rgb(104, 210, 223)',
  ]
  constructor(
    private route: ActivatedRoute,
    private tocSharedSvc: AppTocService,
    private configSvc: ConfigurationsService,
  ) { }

  async ngOnInit() {
    this.prefChangeSubscription = this.configSvc.prefChangeNotifier.subscribe(() => {
      this.populateChartData()
    })
    if (this.route && this.route.parent) {
      const parentRoute = this.route.parent
      this.routeParentSubscription = parentRoute.data.subscribe((data: Data) => {
        this.initData(data)
      })
    }
  }

  ngOnDestroy() {
    this.tocSharedSvc.analyticsFetchStatus = 'none'
    if (this.routeParentSubscription) {
      this.routeParentSubscription.unsubscribe()
    }
    if (this.prefChangeSubscription) {
      this.prefChangeSubscription.unsubscribe()
    }
  }

  private initData(data: Data) {
    const initData = this.tocSharedSvc.initData(data)
    this.content = initData.content
    if (this.content) {
      this.fetchStatus = 'fetching'
      if (this.apiLinkAccess.courseAnalytics) {
        this.tocSharedSvc.fetchContentAnalyticsData(this.content.identifier)
        this.analyticsSubscription = this.tocSharedSvc.analyticsReplaySubject.subscribe(
          (result: NsAnalytics.IAnalyticsResponse) => {
            this.analyticsData = result
            this.fetchStatus = 'done'
            this.populateChartData()
          },
          () => {
            this.analyticsData = null
            this.fetchStatus = 'error'
          },
        )
      } else if (this.apiLinkAccess.courseAnalyticsClient) {
        this.tocSharedSvc.fetchContentAnalyticsClientData(this.content.identifier)
        this.analyticsSubscription = this.tocSharedSvc.analyticsReplaySubject.subscribe(
          (result: any) => {
            this.analyticsDataClient = result
            this.fetchStatus = 'done'
            this.chartData()
          },
          () => {
            this.analyticsDataClient = null
            this.fetchStatus = 'error'
          },
        )
      }
    } else {
      this.fetchStatus = 'none'
      this.analyticsData = null
    }
  }

  populateChartData() {
    if (this.analyticsData) {
      // unique users count
      this.analyticsData.uniqueParticipants.forEach((count: NsAnalytics.IActivityObj) => {
        if (count.key === 'Wingspan') {
          this.uniqueUsers = count.uniqueCount
        }
      })

      // Onsite-Offshore PieChart Data
      const pieChartData: number[] = []
      const pieChartLabel: string[] = []
      this.analyticsData.participants.onsiteOffshoreIndicator.forEach(
        (onsiteOffshore: NsAnalytics.IOnsiteOffshoreObj) => {
          if (onsiteOffshore.key !== 'NA') {
            pieChartData.push(onsiteOffshore.count)
            pieChartLabel.push(onsiteOffshore.key)
          }
          this.onsiteOffshoreData = {
            widgetType: ROOT_WIDGET_CONFIG.graph._type,
            widgetSubType: ROOT_WIDGET_CONFIG.graph.graphGeneral,
            widgetData: {
              graphId: 'onsiteOffshoreChart',
              graphType: 'pie',
              graphHeight: '250px',
              graphWidth: '90%',
              graphLegend: true,
              graphLegendPosition: 'top',
              graphLegendFontSize: 11,
              graphTicksFontSize: 11,
              graphGridLinesDisplay: false,
              graphIsCustomizableColor: this.isCustomizableColor,
              graphIsCustomizableType: this.isCustomizableType,
              graphDefaultPalette: 'default',
              graphData: {
                labels: pieChartLabel,
                datasets: [
                  {
                    label: '',
                    data: pieChartData,
                    backgroundColor: [
                      this.configSvc.activeThemeObject
                        ? this.configSvc.activeThemeObject.color.primary
                        : '',
                      this.configSvc.activeThemeObject
                        ? this.configSvc.activeThemeObject.color.accent
                        : '',
                    ],
                    borderWidth: 1,
                  },
                ],
              },
            },
          }
        },
      )

      // Participants by Unit BarChart Data
      const barChartUnitLabel: string[] = []
      const offshoreUnitData: number[] = []
      const onsiteUnitData: number[] = []
      this.analyticsData.participants.ibu = this.analyticsData.participants.ibu.sort(
        (a: NsAnalytics.IParticipantObj, b: NsAnalytics.IParticipantObj) =>
          a.count > b.count ? -1 : a.count < b.count ? 1 : 0,
      )
      this.analyticsData.participants.ibu.forEach((unit: NsAnalytics.IParticipantObj) => {
        if (barChartUnitLabel.length < 20) {
          barChartUnitLabel.push(unit.key)
        }
        unit.value.forEach((val: NsAnalytics.IObjPair) => {
          if (val.key.toLowerCase() === 'offshore') {
            offshoreUnitData.push(val.value)
          }
          if (val.key.toLowerCase() === 'onsite') {
            onsiteUnitData.push(val.value)
          }
        })
      })
      this.barChartUnitData = {
        widgetType: ROOT_WIDGET_CONFIG.graph._type,
        widgetSubType: ROOT_WIDGET_CONFIG.graph.graphGeneral,
        widgetData: {
          graphId: 'unitChart',
          graphType: 'horizontalBar',
          graphHeight: '300px',
          graphWidth: '100%',
          graphLegend: true,
          graphLegendPosition: 'top',
          graphLegendFontSize: 11,
          graphTicksFontSize: 11,
          graphGridLinesDisplay: false,
          graphTicksXAxisDisplay: false,
          graphTicksYAxisDisplay: true,
          graphIsCustomizableColor: this.isCustomizableColor,
          graphIsCustomizableType: this.isCustomizableType,
          graphDefaultPalette: 'default',
          graphData: {
            labels: barChartUnitLabel,
            datasets: [
              {
                label: 'Offshore',
                backgroundColor: this.configSvc.activeThemeObject
                  ? this.configSvc.activeThemeObject.color.primary
                  : '',
                borderWidth: 1,
                data: offshoreUnitData,
              },
              {
                label: 'Onsite',
                backgroundColor: this.configSvc.activeThemeObject
                  ? this.configSvc.activeThemeObject.color.accent
                  : '',
                borderWidth: 1,
                data: onsiteUnitData,
              },
            ],
          },
        },
      }

      // Participants by PU BarChart Data
      const barChartPULabel: string[] = []
      const offshorePuData: number[] = []
      const onsitePuData: number[] = []
      this.analyticsData.participants.pu = this.analyticsData.participants.pu.sort(
        (a: NsAnalytics.IParticipantObj, b: NsAnalytics.IParticipantObj) =>
          a.count > b.count ? -1 : a.count < b.count ? 1 : 0,
      )
      this.analyticsData.participants.pu.forEach((pu: NsAnalytics.IParticipantObj) => {
        if (barChartPULabel.length < 20) {
          barChartPULabel.push(pu.key)
        }
        pu.value.forEach((val: NsAnalytics.IObjPair) => {
          if (val.key.toLowerCase() === 'offshore') {
            offshorePuData.push(val.value)
          }
          if (val.key.toLowerCase() === 'onsite') {
            onsitePuData.push(val.value)
          }
        })
      })
      this.barChartPuData = {
        widgetType: ROOT_WIDGET_CONFIG.graph._type,
        widgetSubType: ROOT_WIDGET_CONFIG.graph.graphGeneral,
        widgetData: {
          graphId: 'puChart',
          graphType: 'horizontalBar',
          graphHeight: '300px',
          graphWidth: '100%',
          graphLegend: true,
          graphLegendPosition: 'top',
          graphLegendFontSize: 11,
          graphTicksFontSize: 11,
          graphTicksXAxisDisplay: false,
          graphTicksYAxisDisplay: true,
          graphGridLinesDisplay: false,
          graphIsCustomizableColor: this.isCustomizableColor,
          graphIsCustomizableType: this.isCustomizableType,
          graphDefaultPalette: 'default',
          graphData: {
            labels: barChartPULabel,
            datasets: [
              {
                label: 'Offshore',
                backgroundColor: this.configSvc.activeThemeObject
                  ? this.configSvc.activeThemeObject.color.primary
                  : '',
                borderWidth: 1,
                data: offshorePuData,
              },
              {
                label: 'Onsite',
                backgroundColor: this.configSvc.activeThemeObject
                  ? this.configSvc.activeThemeObject.color.accent
                  : '',
                borderWidth: 1,
                data: onsitePuData,
              },
            ],
          },
        },
      }

      // Participants by JL BarChart Data
      const barChartJLLabel: string[] = []
      const offshoreJLData: number[] = []
      const onsiteJLData: number[] = []
      this.analyticsData.participants.jl = this.analyticsData.participants.jl.sort(
        (a: NsAnalytics.IParticipantObj, b: NsAnalytics.IParticipantObj) =>
          a.count > b.count ? -1 : a.count < b.count ? 1 : 0,
      )
      this.analyticsData.participants.jl.forEach((jl: NsAnalytics.IParticipantObj) => {
        if (barChartJLLabel.length < 20) {
          barChartJLLabel.push(jl.key)
        }
        jl.value.forEach((val: NsAnalytics.IObjPair) => {
          if (val.key.toLowerCase() === 'offshore') {
            offshoreJLData.push(val.value)
          }
          if (val.key.toLowerCase() === 'onsite') {
            onsiteJLData.push(val.value)
          }
        })
      })
      this.barChartJLData = {
        widgetType: ROOT_WIDGET_CONFIG.graph._type,
        widgetSubType: ROOT_WIDGET_CONFIG.graph.graphGeneral,
        widgetData: {
          graphId: 'jlChart',
          graphType: 'horizontalBar',
          graphHeight: '300px',
          graphWidth: '100%',
          graphLegend: true,
          graphLegendPosition: 'top',
          graphLegendFontSize: 11,
          graphTicksFontSize: 11,
          graphTicksXAxisDisplay: false,
          graphTicksYAxisDisplay: true,
          graphGridLinesDisplay: false,
          graphIsCustomizableColor: this.isCustomizableColor,
          graphIsCustomizableType: this.isCustomizableType,
          graphDefaultPalette: 'default',
          graphData: {
            labels: barChartJLLabel,
            datasets: [
              {
                label: 'Offshore',
                backgroundColor: this.configSvc.activeThemeObject
                  ? this.configSvc.activeThemeObject.color.primary
                  : '',
                borderWidth: 1,
                data: offshoreJLData,
              },
              {
                label: 'Onsite',
                backgroundColor: this.configSvc.activeThemeObject
                  ? this.configSvc.activeThemeObject.color.accent
                  : '',
                borderWidth: 1,
                data: onsiteJLData,
              },
            ],
          },
        },
      }

      // Participants by Location BarChart Data
      const barChartLocationLabel: string[] = []
      const offshoreLocationData: number[] = []
      const onsiteLocationData: number[] = []
      this.analyticsData.participants.location = this.analyticsData.participants.location.sort(
        (a: NsAnalytics.IParticipantObj, b: NsAnalytics.IParticipantObj) =>
          a.count > b.count ? -1 : a.count < b.count ? 1 : 0,
      )
      this.analyticsData.participants.location.forEach((location: NsAnalytics.IParticipantObj) => {
        if (barChartLocationLabel.length < 20) {
          barChartLocationLabel.push(location.key)
        }
        location.value.forEach((val: NsAnalytics.IObjPair) => {
          if (val.key.toLowerCase() === 'offshore') {
            offshoreLocationData.push(val.value)
          }
          if (val.key.toLowerCase() === 'onsite') {
            onsiteLocationData.push(val.value)
          }
        })
      })
      this.barChartLocationData = {
        widgetType: ROOT_WIDGET_CONFIG.graph._type,
        widgetSubType: ROOT_WIDGET_CONFIG.graph.graphGeneral,
        widgetData: {
          graphId: 'locationChart',
          graphType: 'horizontalBar',
          graphHeight: '300px',
          graphWidth: '100%',
          graphLegend: true,
          graphLegendPosition: 'top',
          graphLegendFontSize: 11,
          graphTicksFontSize: 11,
          graphTicksXAxisDisplay: false,
          graphTicksYAxisDisplay: true,
          graphGridLinesDisplay: false,
          graphIsCustomizableColor: this.isCustomizableColor,
          graphIsCustomizableType: this.isCustomizableType,
          graphDefaultPalette: 'default',
          graphData: {
            labels: barChartLocationLabel,
            datasets: [
              {
                label: 'Offshore',
                backgroundColor: this.configSvc.activeThemeObject
                  ? this.configSvc.activeThemeObject.color.primary
                  : '',
                borderWidth: 1,
                data: offshoreLocationData,
              },
              {
                label: 'Onsite',
                backgroundColor: this.configSvc.activeThemeObject
                  ? this.configSvc.activeThemeObject.color.accent
                  : '',
                borderWidth: 1,
                data: onsiteLocationData,
              },
            ],
          },
        },
      }

      // Participants by Account BarChart Data
      const barChartAccountLabel: string[] = []
      const offshoreAccountData: number[] = []
      const onsiteAccountData: number[] = []
      this.analyticsData.participants.account = this.analyticsData.participants.account.sort(
        (a: NsAnalytics.IParticipantObj, b: NsAnalytics.IParticipantObj) =>
          a.count > b.count ? -1 : a.count < b.count ? 1 : 0,
      )
      this.analyticsData.participants.account.forEach((account: NsAnalytics.IParticipantObj) => {
        if (barChartAccountLabel.length < 20) {
          barChartAccountLabel.push(account.key)
        }
        account.value.forEach((val: NsAnalytics.IObjPair) => {
          if (val.key.toLowerCase() === 'offshore') {
            offshoreAccountData.push(val.value)
          }
          if (val.key.toLowerCase() === 'onsite') {
            onsiteAccountData.push(val.value)
          }
        })
      })
      this.barChartAccountData = {
        widgetType: ROOT_WIDGET_CONFIG.graph._type,
        widgetSubType: ROOT_WIDGET_CONFIG.graph.graphGeneral,
        widgetData: {
          graphId: 'accountChart',
          graphType: 'horizontalBar',
          graphHeight: '300px',
          graphWidth: '100%',
          graphLegend: true,
          graphLegendPosition: 'top',
          graphLegendFontSize: 11,
          graphTicksFontSize: 11,
          graphTicksXAxisDisplay: false,
          graphTicksYAxisDisplay: true,
          graphGridLinesDisplay: false,
          graphIsCustomizableColor: this.isCustomizableColor,
          graphIsCustomizableType: this.isCustomizableType,
          graphDefaultPalette: 'default',
          graphData: {
            labels: barChartAccountLabel,
            datasets: [
              {
                label: 'Offshore',
                backgroundColor: this.configSvc.activeThemeObject
                  ? this.configSvc.activeThemeObject.color.primary
                  : '',
                borderWidth: 1,
                data: offshoreAccountData,
              },
              {
                label: 'Onsite',
                backgroundColor: this.configSvc.activeThemeObject
                  ? this.configSvc.activeThemeObject.color.accent
                  : '',
                borderWidth: 1,
                data: onsiteAccountData,
              },
            ],
          },
        },
      }
    }
  }

  chartData() {
    if (this.analyticsDataClient) {
      // unique users count
      this.uniqueUsers = this.analyticsDataClient.userCount
      this.hits = this.analyticsDataClient.hits
      this.avgTimeSpent = parseFloat((this.analyticsDataClient.avg_time_spent / 60).toFixed(1))
      // users by Dept BarChart Data
      const barChartDeptLabel: string[] = []
      const deptData: number[] = []
      this.analyticsDataClient.department.forEach((dept: any) => {
        if (barChartDeptLabel.length < 20) {
          barChartDeptLabel.push(dept.key)
        }
        if (deptData.length < 20) {
          deptData.push(dept.doc_count)
        }
      })
      this.barChartDeptData = {
        widgetType: ROOT_WIDGET_CONFIG.graph._type,
        widgetSubType: ROOT_WIDGET_CONFIG.graph.graphGeneral,
        widgetData: {
          graphId: 'deptChart',
          graphType: 'horizontalBar',
          graphHeight: '300px',
          graphWidth: '100%',
          graphLegend: false,
          graphLegendPosition: 'top',
          graphLegendFontSize: 11,
          graphTicksFontSize: 11,
          graphGridLinesDisplay: false,
          graphTicksXAxisDisplay: false,
          graphTicksYAxisDisplay: true,
          graphDefaultPalette: 'default',
          graphData: {
            labels: barChartDeptLabel,
            datasets: [
              {
                label: '',
                backgroundColor: this.chartColors,
                borderWidth: 1,
                data: deptData,
              },
            ],
          },
        },
      }

      // users by Country BarChart Data
      const barChartCountryLabel: string[] = []
      const countryData: number[] = []
      this.analyticsDataClient.country.forEach((country: NsCourseAnalytics.IChartData) => {
        if (barChartCountryLabel.length < 20) {
          barChartCountryLabel.push(country.key)
        }
        if (countryData.length < 20) {
          countryData.push(country.doc_count)
        }
      })
      this.barChartCountryData = {
        widgetType: ROOT_WIDGET_CONFIG.graph._type,
        widgetSubType: ROOT_WIDGET_CONFIG.graph.graphGeneral,
        widgetData: {
          graphId: 'countryChart',
          graphType: 'horizontalBar',
          graphHeight: '300px',
          graphWidth: '100%',
          graphLegend: false,
          graphLegendPosition: 'top',
          graphLegendFontSize: 11,
          graphTicksFontSize: 11,
          graphTicksXAxisDisplay: false,
          graphTicksYAxisDisplay: true,
          graphGridLinesDisplay: false,
          graphDefaultPalette: 'default',
          graphData: {
            labels: barChartCountryLabel,
            datasets: [
              {
                label: '',
                backgroundColor: this.chartColors,
                borderWidth: 1,
                data: countryData,
              },
            ],
          },
        },
      }

      // daily users BarChart Data
      const barChartDailyUsersLabel: string[] = []
      const dailyUsersData: number[] = []
      this.analyticsDataClient.day_wise_users.forEach((users: NsCourseAnalytics.IBarChartData) => {
        this.dailyDate = users.key_as_string
        this.dailyDate = this.dailyDate.split('T')[0]
        const month = this.months[new Date(this.dailyDate).getMonth()]
        const date = this.dailyDate.split('-')[2]
        this.dailyDate = `${date}-${month}`
        barChartDailyUsersLabel.push(this.dailyDate)
        dailyUsersData.push(users.doc_count)
      })
      this.barChartDailyUsersData = {
        widgetType: ROOT_WIDGET_CONFIG.graph._type,
        widgetSubType: ROOT_WIDGET_CONFIG.graph.graphGeneral,
        widgetData: {
          graphId: 'dailyUsersChart',
          graphType: 'bar',
          graphHeight: '250px',
          graphWidth: '100%',
          graphLegend: false,
          graphLegendPosition: 'top',
          graphLegendFontSize: 11,
          graphTicksFontSize: 11,
          graphTicksXAxisDisplay: true,
          graphTicksYAxisDisplay: true,
          graphGridLinesDisplay: false,
          graphXAxisMaxLimit: 20,
          graphIsXAxisAutoSkip: true,
          graphDefaultPalette: 'default',
          graphData: {
            labels: barChartDailyUsersLabel,
            datasets: [
              {
                label: '',
                backgroundColor: 'rgb(32, 150, 205)',
                borderWidth: 1,
                data: dailyUsersData,
              },
            ],
          },
        },
      }

      // daily hits BarChart Data
      const barChartDailyHitsLabel: string[] = []
      const dailyHitsData: number[] = []
      this.analyticsDataClient.day_wise_users.forEach((hits: NsCourseAnalytics.IBarChartData) => {
        this.dailyDate = hits.key_as_string
        this.dailyDate = this.dailyDate.split('T')[0]
        const month = this.months[new Date(this.dailyDate).getMonth()]
        const date = this.dailyDate.split('-')[2]
        this.dailyDate = `${date}-${month}`
        barChartDailyHitsLabel.push(this.dailyDate)
        dailyHitsData.push(hits.hits_count)
      })
      this.barChartDailyHitsData = {
        widgetType: ROOT_WIDGET_CONFIG.graph._type,
        widgetSubType: ROOT_WIDGET_CONFIG.graph.graphGeneral,
        widgetData: {
          graphId: 'dailyHitsChart',
          graphType: 'bar',
          graphHeight: '250px',
          graphWidth: '100%',
          graphLegend: false,
          graphLegendPosition: 'top',
          graphLegendFontSize: 11,
          graphTicksFontSize: 11,
          graphTicksXAxisDisplay: true,
          graphTicksYAxisDisplay: true,
          graphGridLinesDisplay: false,
          graphXAxisMaxLimit: 20,
          graphIsXAxisAutoSkip: true,
          graphDefaultPalette: 'default',
          graphData: {
            labels: barChartDailyHitsLabel,
            datasets: [
              {
                label: '',
                backgroundColor: 'rgb(32, 150, 205)',
                borderWidth: 1,
                data: dailyHitsData,
              },
            ],
          },
        },
      }

      // users by device Data
      const deviceData: number[] = []
      const deviceLabel: string[] = []
      this.analyticsDataClient.device.forEach((device: NsCourseAnalytics.IChartData) => {
        if (deviceLabel.length < 20) {
          deviceLabel.push(device.key)
        }
        if (deviceData.length < 20) {
          deviceData.push(device.doc_count)
        }
        this.pieChartDeviceData = {
          widgetType: ROOT_WIDGET_CONFIG.graph._type,
          widgetSubType: ROOT_WIDGET_CONFIG.graph.graphGeneral,
          widgetData: {
            graphId: 'deviceChart',
            graphType: 'pie',
            graphHeight: '250px',
            graphWidth: '90%',
            graphLegend: true,
            graphLegendPosition: 'left',
            graphLegendFontSize: 11,
            graphTicksFontSize: 11,
            graphGridLinesDisplay: false,
            graphDefaultPalette: 'default',
            graphData: {
              labels: deviceLabel,
              datasets: [
                {
                  label: '',
                  data: deviceData,
                  backgroundColor: this.chartColors,
                  borderWidth: 1,
                },
              ],
            },
          },
        }
      })

      // hits by device Data
      const deviceHitsData: number[] = []
      const deviceHitsLabel: string[] = []
      this.analyticsDataClient.device = this.analyticsDataClient.device.sort((a: any, b: any) =>
        a.total_hits > b.total_hits ? -1 : a.total_hits < b.total_hits ? 1 : 0,
      )
      this.analyticsDataClient.device.forEach((device: NsCourseAnalytics.IChartData) => {
        if (deviceHitsLabel.length < 20) {
          deviceHitsLabel.push(device.key)
        }
        if (deviceHitsData.length < 20) {
          deviceHitsData.push(device.total_hits)
        }
        this.pieChartDeviceHitsData = {
          widgetType: ROOT_WIDGET_CONFIG.graph._type,
          widgetSubType: ROOT_WIDGET_CONFIG.graph.graphGeneral,
          widgetData: {
            graphId: 'deviceHitsChart',
            graphType: 'pie',
            graphHeight: '250px',
            graphWidth: '90%',
            graphLegend: true,
            graphLegendPosition: 'left',
            graphLegendFontSize: 11,
            graphTicksFontSize: 11,
            graphGridLinesDisplay: false,
            graphDefaultPalette: 'default',
            graphData: {
              labels: deviceHitsLabel,
              datasets: [
                {
                  label: '',
                  data: deviceHitsData,
                  backgroundColor: this.chartColors,
                  borderWidth: 1,
                },
              ],
            },
          },
        }
      })

      // hits by Dept BarChart Data
      const barChartDeptHitsLabel: string[] = []
      const deptHitsData: number[] = []
      this.analyticsDataClient.department = this.analyticsDataClient.department.sort(
        (a: any, b: any) =>
          a.total_hits > b.total_hits ? -1 : a.total_hits < b.total_hits ? 1 : 0,
      )
      this.analyticsDataClient.department.forEach((deptHits: NsCourseAnalytics.IChartData) => {
        if (barChartDeptHitsLabel.length < 20) {
          barChartDeptHitsLabel.push(deptHits.key)
        }
        if (deptHitsData.length < 20) {
          deptHitsData.push(deptHits.total_hits)
        }
      })
      this.barChartDeptHitsData = {
        widgetType: ROOT_WIDGET_CONFIG.graph._type,
        widgetSubType: ROOT_WIDGET_CONFIG.graph.graphGeneral,
        widgetData: {
          graphId: 'deptHitsChart',
          graphType: 'horizontalBar',
          graphHeight: '300px',
          graphWidth: '100%',
          graphLegend: false,
          graphLegendPosition: 'top',
          graphLegendFontSize: 11,
          graphTicksFontSize: 11,
          graphGridLinesDisplay: false,
          graphTicksXAxisDisplay: false,
          graphTicksYAxisDisplay: true,
          graphDefaultPalette: 'default',
          graphData: {
            labels: barChartDeptHitsLabel,
            datasets: [
              {
                label: '',
                backgroundColor: this.chartColors,
                borderWidth: 1,
                data: deptHitsData,
              },
            ],
          },
        },
      }

      // hits by Country BarChart Data
      const barChartCountryHitsLabel: string[] = []
      const countryHitsData: number[] = []
      this.analyticsDataClient.country = this.analyticsDataClient.country.sort((a: any, b: any) =>
        a.total_hits > b.total_hits ? -1 : a.total_hits < b.total_hits ? 1 : 0,
      )
      this.analyticsDataClient.country.forEach((countryHits: any) => {
        if (barChartCountryHitsLabel.length < 20) {
          barChartCountryHitsLabel.push(countryHits.key)
        }
        if (countryHitsData.length < 20) {
          countryHitsData.push(countryHits.total_hits)
        }
      })
      this.barChartCountryHitsData = {
        widgetType: ROOT_WIDGET_CONFIG.graph._type,
        widgetSubType: ROOT_WIDGET_CONFIG.graph.graphGeneral,
        widgetData: {
          graphId: 'countryHitsChart',
          graphType: 'horizontalBar',
          graphHeight: '300px',
          graphWidth: '100%',
          graphLegend: false,
          graphLegendPosition: 'top',
          graphLegendFontSize: 11,
          graphTicksFontSize: 11,
          graphTicksXAxisDisplay: false,
          graphTicksYAxisDisplay: true,
          graphGridLinesDisplay: false,
          graphDefaultPalette: 'default',
          graphData: {
            labels: barChartCountryHitsLabel,
            datasets: [
              {
                label: '',
                backgroundColor: this.chartColors,
                borderWidth: 1,
                data: countryHitsData,
              },
            ],
          },
        },
      }
    }
  }

  onClose() {
    this.isExpandTrue = false
    this.populateChartData()
  }

  onCloseClient() {
    this.isExpandTrue = false
    this.chartData()
  }
  onClick(event: string) {
    const departments = document.getElementById('departments')
    const countries = document.getElementById('countries')
    const devices = document.getElementById('devices')
    if (departments && event === 'departments') {
      departments.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }
    if (countries && event === 'countries') {
      countries.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }
    if (devices && event === 'devices') {
      devices.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }
  }
  onExpand(field: string) {
    const barChartOnExpandLabel: string[] = []
    const offshoreOnExpandData: number[] = []
    const onsiteOnExpandData: number[] = []
    if (this.analyticsData) {
      this.analyticsData.participants[field].forEach((expandData: NsAnalytics.IParticipantObj) => {
        barChartOnExpandLabel.push(expandData.key)
        expandData.value.forEach((val: NsAnalytics.IObjPair) => {
          if (val.key.toLowerCase() === 'offshore') {
            offshoreOnExpandData.push(val.value)
          }
          if (val.key.toLowerCase() === 'onsite') {
            onsiteOnExpandData.push(val.value)
          }
        })
      })
    }

    this.barChartOnExpandData = {
      widgetType: ROOT_WIDGET_CONFIG.graph._type,
      widgetSubType: ROOT_WIDGET_CONFIG.graph.graphGeneral,
      widgetData: {
        graphId: 'expandChart',
        graphType: 'horizontalBar',
        graphHeight: '4000px',
        graphWidth: '100%',
        graphLegend: true,
        graphLegendPosition: 'top',
        graphLegendFontSize: 11,
        graphTicksFontSize: 11,
        graphTicksXAxisDisplay: false,
        graphTicksYAxisDisplay: true,
        graphGridLinesDisplay: false,
        graphIsCustomizableColor: this.isCustomizableColor,
        graphIsCustomizableType: this.isCustomizableType,
        graphDefaultPalette: 'default',
        graphData: {
          labels: barChartOnExpandLabel,
          datasets: [
            {
              label: 'Offshore',
              backgroundColor: this.configSvc.activeThemeObject
                ? this.configSvc.activeThemeObject.color.primary
                : '',
              borderWidth: 1,
              data: offshoreOnExpandData,
            },
            {
              label: 'Onsite',
              backgroundColor: this.configSvc.activeThemeObject
                ? this.configSvc.activeThemeObject.color.accent
                : '',
              borderWidth: 1,
              data: onsiteOnExpandData,
            },
          ],
        },
      },
    }
    this.isExpandTrue = true
  }

  onExpandClient(field: string, type: string) {
    if (this.analyticsDataClient) {
      const barChartExpandLabel: string[] = []
      const expandData: number[] = []
      this.analyticsDataClient[field].forEach((expand: any) => {
        if (barChartExpandLabel.length <= 100) {
          barChartExpandLabel.push(expand.key)
        }
        if (expandData.length <= 100 && type === 'users') {
          expandData.push(expand.doc_count)
        }
        if (expandData.length <= 100 && type === 'hits') {
          expandData.push(expand.total_hits)
        }
      })
      this.barChartExpandClientData = {
        widgetType: ROOT_WIDGET_CONFIG.graph._type,
        widgetSubType: ROOT_WIDGET_CONFIG.graph.graphGeneral,
        widgetData: {
          graphId: 'expandChart',
          graphType: 'horizontalBar',
          graphHeight: '1000px',
          graphWidth: '100%',
          graphLegend: false,
          graphLegendPosition: 'top',
          graphLegendFontSize: 11,
          graphTicksFontSize: 11,
          graphTicksXAxisDisplay: false,
          graphTicksYAxisDisplay: true,
          graphGridLinesDisplay: false,
          graphDefaultPalette: 'default',
          graphData: {
            labels: barChartExpandLabel,
            datasets: [
              {
                label: '',
                backgroundColor: this.chartColors,
                borderWidth: 1,
                data: expandData,
              },
            ],
          },
        },
      }
      this.isExpandTrue = true
    }
  }
}
