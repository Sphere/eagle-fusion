import { Component, OnInit, OnDestroy } from '@angular/core'
import { Subscription } from 'rxjs'
import { TFetchStatus, ConfigurationsService, NsPage } from '@ws-widget/utils'
import { ActivatedRoute } from '@angular/router'
import { NavigatorService } from '../../services/navigator.service'
import { NsContent, ROOT_WIDGET_CONFIG, IGraphWidget, NsError } from '@ws-widget/collection'
import { NsWidgetResolver } from '@ws-widget/resolver'
import {
  IAnalyticsResponse,
  IActivityObj,
  IOnsiteOffshoreObj,
  IParticipantObj,
  IObjPair,
} from '../../models/industry-analytics.model'

@Component({
  selector: 'ws-app-industry-analytics',
  templateUrl: './industry-analytics.component.html',
  styleUrls: ['./industry-analytics.component.scss'],
})
export class IndustryAnalyticsComponent implements OnInit, OnDestroy {

  content: NsContent.IContent | null = null
  routeParentSubscription: Subscription | null = null
  analyticsData: IAnalyticsResponse | null = null
  pageNavbar: Partial<NsPage.INavBackground> = this.configSvc.pageNavBar
  uniqueUsers = 0
  tagName = ''
  tag = ''
  isCustomizableColor = false
  isCustomizableType = false
  isExpandTrue = false
  barChartUnitData: IGraphWidget = {} as IGraphWidget
  barChartAccountData: IGraphWidget = {} as IGraphWidget
  barChartLocationData: IGraphWidget = {} as IGraphWidget
  barChartPuData: IGraphWidget = {} as IGraphWidget
  barChartDuData: IGraphWidget = {} as IGraphWidget
  barChartJLData: IGraphWidget = {} as IGraphWidget
  barChartOnExpandData: IGraphWidget = {} as IGraphWidget
  fetchStatus: TFetchStatus = 'none'
  prefChangeSubscription: Subscription | null = null
  onsiteOffshoreData: IGraphWidget = {} as IGraphWidget

  errorWidget: NsWidgetResolver.IRenderConfigWithTypedData<NsError.IWidgetErrorResolver> = {
    widgetType: ROOT_WIDGET_CONFIG.errorResolver._type,
    widgetSubType: ROOT_WIDGET_CONFIG.errorResolver.errorResolver,
    widgetData: {
      errorType: 'internalServer',
    },
  }
  constructor(
    private route: ActivatedRoute,
    private analyticsSrv: NavigatorService,
    private configSvc: ConfigurationsService,
  ) {
    this.route.params.subscribe(queryParameters => {
      if (queryParameters) {
        if (queryParameters['tag']) {
          this.tag = queryParameters['tag'].split('-').join(' ')
          const tempTag = queryParameters['tag'].split('-').join('_')
          this.tagName = `IND_NAV_${tempTag}`
        }
      }
    })
  }

  async ngOnInit() {
    this.prefChangeSubscription = this.configSvc.prefChangeNotifier.subscribe(() => {
      this.populateChartData()
    })
    this.initData(this.tagName)
  }

  ngOnDestroy() {
    if (this.routeParentSubscription) {
      this.routeParentSubscription.unsubscribe()
    }
    if (this.prefChangeSubscription) {
      this.prefChangeSubscription.unsubscribe()
    }
  }

  initData(tagName: string) {
    if (this.tagName) {
      this.fetchStatus = 'fetching'
      this.analyticsSrv.getContentAnalytics(tagName).subscribe(
        (result: IAnalyticsResponse) => {
          this.analyticsData = result
          this.fetchStatus = 'done'
          this.populateChartData()
        },
        () => {
          this.analyticsData = null
          this.fetchStatus = 'error'
        },
      )
    } else {
      this.fetchStatus = 'none'
      this.analyticsData = null
    }
  }

  populateChartData() {
    if (this.analyticsData) {
      // unique users count
      this.analyticsData.uniqueParticipants.forEach((count: IActivityObj) => {
        if (count.key === 'Wingspan') {
          this.uniqueUsers = count.uniqueCount
        }
      })

      // Onsite-Offshore PieChart Data
      const pieChartData: number[] = []
      const pieChartLabel: string[] = []
      this.analyticsData.participants.onsiteOffshoreIndicator.forEach(
        (onsiteOffshore: IOnsiteOffshoreObj) => {
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
        (a: IParticipantObj, b: IParticipantObj) => (a.count > b.count ? -1 : a.count < b.count ? 1 : 0),
      )
      this.analyticsData.participants.ibu.forEach((unit: IParticipantObj) => {
        if (barChartUnitLabel.length < 20) {
          barChartUnitLabel.push(unit.key)
        }
        unit.value.forEach((val: IObjPair) => {
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
        (a: IParticipantObj, b: IParticipantObj) => (a.count > b.count ? -1 : a.count < b.count ? 1 : 0),
      )
      this.analyticsData.participants.pu.forEach((pu: IParticipantObj) => {
        if (barChartPULabel.length < 20) {
          barChartPULabel.push(pu.key)
        }
        pu.value.forEach((val: IObjPair) => {
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

      // Participants by DU BarChart Data
      const barChartDULabel: string[] = []
      const offshoreDuData: number[] = []
      const onsiteDuData: number[] = []
      this.analyticsData.participants.du = this.analyticsData.participants.du.sort(
        (a: IParticipantObj, b: IParticipantObj) => (a.count > b.count ? -1 : a.count < b.count ? 1 : 0),
      )
      this.analyticsData.participants.du.forEach((du: IParticipantObj) => {
        if (barChartDULabel.length < 20) {
          barChartDULabel.push(du.key)
        }
        du.value.forEach((val: IObjPair) => {
          if (val.key.toLowerCase() === 'offshore') {
            offshoreDuData.push(val.value)
          }
          if (val.key.toLowerCase() === 'onsite') {
            onsiteDuData.push(val.value)
          }
        })
      })
      this.barChartDuData = {
        widgetType: ROOT_WIDGET_CONFIG.graph._type,
        widgetSubType: ROOT_WIDGET_CONFIG.graph.graphGeneral,
        widgetData: {
          graphId: 'duChart',
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
            labels: barChartDULabel,
            datasets: [
              {
                label: 'Offshore',
                backgroundColor: this.configSvc.activeThemeObject
                  ? this.configSvc.activeThemeObject.color.primary
                  : '',
                borderWidth: 1,
                data: offshoreDuData,
              },
              {
                label: 'Onsite',
                backgroundColor: this.configSvc.activeThemeObject
                  ? this.configSvc.activeThemeObject.color.accent
                  : '',
                borderWidth: 1,
                data: onsiteDuData,
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
        (a: IParticipantObj, b: IParticipantObj) => (a.count > b.count ? -1 : a.count < b.count ? 1 : 0),
      )
      this.analyticsData.participants.jl.forEach((jl: IParticipantObj) => {
        if (barChartJLLabel.length < 20) {
          barChartJLLabel.push(jl.key)
        }
        jl.value.forEach((val: IObjPair) => {
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
        (a: IParticipantObj, b: IParticipantObj) => (a.count > b.count ? -1 : a.count < b.count ? 1 : 0),
      )
      this.analyticsData.participants.location.forEach((location: IParticipantObj) => {
        if (barChartLocationLabel.length < 20) {
          barChartLocationLabel.push(location.key)
        }
        location.value.forEach((val: IObjPair) => {
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
        (a: IParticipantObj, b: IParticipantObj) => (a.count > b.count ? -1 : a.count < b.count ? 1 : 0),
      )
      this.analyticsData.participants.account.forEach((account: IParticipantObj) => {
        if (barChartAccountLabel.length < 20) {
          barChartAccountLabel.push(account.key)
        }
        account.value.forEach((val: IObjPair) => {
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

      // Participants by Topics BarChart Data
      // const barChartTopicsLabel: string[] = []
      // const offshoreTopicsData: number[] = []
      // const onsiteTopicsData: number[] = []
      // const data: any = []
      // this.analyticsData.refiners.forEach(element => {
      //   if (Object.keys(element)[0] === 'topics') {

      //   }
      // })

      // this.analyticsData.participants.account.forEach((account: IParticipantObj) => {
      //   if (barChartAccountLabel.length < 20) {
      //     barChartAccountLabel.push(account.key)
      //   }
      //   account.value.forEach((val: IObjPair) => {
      //     if (val.key.toLowerCase() === 'offshore') {
      //       offshoreAccountData.push(val.value)
      //     }
      //     if (val.key.toLowerCase() === 'onsite') {
      //       onsiteAccountData.push(val.value)
      //     }
      //   })
      // })
      // this.barChartAccountData = {
      //   widgetType: ROOT_WIDGET_CONFIG.graph._type,
      //   widgetSubType: ROOT_WIDGET_CONFIG.graph.graphGeneral,
      //   widgetData: {
      //     graphId: 'accountChart',
      //     graphType: 'horizontalBar',
      //     graphHeight: '300px',
      //     graphWidth: '100%',
      //     graphLegend: true,
      //     graphLegendPosition: 'top',
      //     graphLegendFontSize: 11,
      //     graphTicksFontSize: 11,
      //     graphTicksXAxisDisplay: false,
      //     graphTicksYAxisDisplay: true,
      //     graphGridLinesDisplay: false,
      //     graphIsCustomizableColor: this.isCustomizableColor,
      //     graphIsCustomizableType: this.isCustomizableType,
      //     graphDefaultPalette: 'default',
      //     graphData: {
      //       labels: barChartAccountLabel,
      //       datasets: [
      //         {
      //           label: 'Offshore',
      //           backgroundColor: this.configSvc.activeThemeObject
      //             ? this.configSvc.activeThemeObject.color.primary
      //             : '',
      //           borderWidth: 1,
      //           data: offshoreAccountData,
      //         },
      //         {
      //           label: 'Onsite',
      //           backgroundColor: this.configSvc.activeThemeObject
      //             ? this.configSvc.activeThemeObject.color.accent
      //             : '',
      //           borderWidth: 1,
      //           data: onsiteAccountData,
      //         },
      //       ],
      //     },
      //   },
      // }
    }
  }

  onExpand(field: string) {
    const barChartOnExpandLabel: string[] = []
    const offshoreOnExpandData: number[] = []
    const onsiteOnExpandData: number[] = []
    if (this.analyticsData) {
      this.analyticsData.participants[field].forEach((expandData: IParticipantObj) => {
        barChartOnExpandLabel.push(expandData.key)
        expandData.value.forEach((val: IObjPair) => {
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

  onClose() {
    this.isExpandTrue = false
  }
}
