  import { Component, OnDestroy, OnInit } from '@angular/core'
  import {
    GraphGeneralService,
    IGraphWidget,
    NsError,
    ROOT_WIDGET_CONFIG,
  } from '@ws-widget/collection'
  import { NsWidgetResolver } from '@ws-widget/resolver'
  import { ConfigurationsService, TFetchStatus } from '@ws-widget/utils'
  import { Subscription } from 'rxjs'
  import { NsAnalytics } from '../../models/learning-analytics.model'
  import { AnalyticsResolver } from '../../resolvers/learning-analytics-filters.resolver'
  import { LearningAnalyticsService } from '../../services/learning-analytics.service'
  import { FormControl } from '@angular/forms'
  @Component({
    selector: 'ws-analytics-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
  })
  export class HomeComponent implements OnInit, OnDestroy {
    fetchStatus: TFetchStatus = 'none'
    contentData: any
    isCustomizableColor = false
    isCustomizableType = false
    contentUsers = 0
    contentUsersDescription = 'Total number of users who are accessing the content'
    hits = 0
    hitsDescription = 'Total number of clicks to any page or content'
    selectedTabIndex = 0
    contentAccessed = 0
    contentAccessedDescription = 'Number of access to contents'
    totalUsers = 0
    totalUsersDescription = 'Total number of users'
    searchQuery = ''
    startDate = ''
    endDate = ''
    dailyDate = ''
    contentType = 'Course'
    enableCategoryType = false
    enableSourceName = false
    enableLearningMode = false
    enableLanguage = false
    enableContentType = false
    onExpand = false
    months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    enabledChartDataIds: string[] = []
    filterArray: NsAnalytics.IFilterObj[] = []
    prefChangeSubscription: Subscription | null = null
    barChartExpandData: IGraphWidget = {} as IGraphWidget
    barChartCityData: IGraphWidget = {} as IGraphWidget
    barChartSourceData: IGraphWidget = {} as IGraphWidget
    barChartGuildData: IGraphWidget = {} as IGraphWidget
    barChartRoleData: IGraphWidget = {} as IGraphWidget
    barChartCountryData: IGraphWidget = {} as IGraphWidget
    barChartRegionData: IGraphWidget = {} as IGraphWidget
    barChartDepartmentData: IGraphWidget = {} as IGraphWidget
    barChartDealerData: IGraphWidget = {} as IGraphWidget
    barChartSubDepartmentData: IGraphWidget = {} as IGraphWidget
    barChartDailyUsersData: IGraphWidget = {} as IGraphWidget
    barChartHourlyUsersData: IGraphWidget = {} as IGraphWidget
    barChartDailyUsageData: IGraphWidget = {} as IGraphWidget
    barChartDeviceData: IGraphWidget = {} as IGraphWidget
    pieChartDeviceCategoryData: IGraphWidget = {} as IGraphWidget
    barChartDailyNewUsersData: IGraphWidget = {} as IGraphWidget
    barChartWeeklyNewUsersData: IGraphWidget = {} as IGraphWidget
    barChartMonthlyNewUsersData: IGraphWidget = {} as IGraphWidget
    errorWidget: NsWidgetResolver.IRenderConfigWithTypedData<NsError.IWidgetErrorResolver> = {
      widgetType: ROOT_WIDGET_CONFIG.errorResolver._type,
      widgetSubType: ROOT_WIDGET_CONFIG.errorResolver.errorResolver,
      widgetData: {
        errorType: 'internalServer',
      },
    }
    showCategory = false
    filterControl = new FormControl()
    filterList = [
      { filterName: 'All', key: 'all' },
      { filterName: 'Sunday', key: '0' },
      { filterName: 'Monday', key: '1' },
      { filterName: 'Tuesday', key: '2' },
      { filterName: 'Wednesday', key: '3' },
      { filterName: 'Thursday', key: '4' },
      { filterName: 'Friday', key: '5' },
      { filterName: 'Saturday', key: '6' },
    ]
    selected = 'All'
    hourlyData: any
    filterFetchStatus: TFetchStatus = 'none'
    private filterEventSubscription: Subscription | null = null
    private removeEventSubscription: Subscription | null = null
    private dateEventSubscription: Subscription | null = null
    private searchEventSubscription: Subscription | null = null
    // tslint:disable-next-line: max-line-length
    graphColors = [
      'rgb(240, 179, 35)',
      'rgb(188, 189, 34)',
      'rgb(199, 199, 199)',
      'rgb(127, 127, 127)',
      'rgb(247, 182, 210)',
      'rgb(174, 199, 232)',
      'rgb(227, 119, 194)',
      'rgb(196, 156, 148)',
      'rgb(140, 86, 75)',
      'rgb(197, 176, 213)',
      'rgb(148, 103, 189)',
      'rgb(255, 152, 150)',
      'rgb(214, 39, 40)',
      'rgb(152, 223, 138)',
      'rgb(44, 160, 44)',
      'rgb(255, 187, 120)',
      'rgb(255, 127, 14)',
      'rgb(174, 199, 232)',
      'rgb(31, 119, 180)',
      'rgb(240, 179, 35)',
      'rgb(188, 189, 34)',
      'rgb(199, 199, 199)',
      'rgb(127, 127, 127)',
      'rgb(247, 182, 210)',
      'rgb(174, 199, 232)',
      'rgb(227, 119, 194)',
      'rgb(196, 156, 148)',
      'rgb(140, 86, 75)',
      'rgb(197, 176, 213)',
      'rgb(148, 103, 189)',
      'rgb(255, 152, 150)',
      'rgb(214, 39, 40)',
      'rgb(152, 223, 138)',
      'rgb(44, 160, 44)',
      'rgb(255, 187, 120)',
      'rgb(255, 127, 14)',
      'rgb(174, 199, 232)',
      'rgb(31, 119, 180)',
      'rgb(240, 179, 35)',
      'rgb(188, 189, 34)',
      'rgb(199, 199, 199)',
      'rgb(127, 127, 127)',
      'rgb(247, 182, 210)',
      'rgb(174, 199, 232)',
      'rgb(227, 119, 194)',
      'rgb(196, 156, 148)',
      'rgb(140, 86, 75)',
      'rgb(197, 176, 213)',
      'rgb(148, 103, 189)',
      'rgb(255, 152, 150)',
      'rgb(214, 39, 40)',
      'rgb(152, 223, 138)',
      'rgb(44, 160, 44)',
      'rgb(255, 187, 120)',
      'rgb(255, 127, 14)',
      'rgb(174, 199, 232)',
      'rgb(31, 119, 180)',
      'rgb(240, 179, 35)',
      'rgb(188, 189, 34)',
      'rgb(199, 199, 199)',
      'rgb(127, 127, 127)',
      'rgb(247, 182, 210)',
      'rgb(174, 199, 232)',
      'rgb(227, 119, 194)',
      'rgb(196, 156, 148)',
      'rgb(140, 86, 75)',
      'rgb(197, 176, 213)',
      'rgb(148, 103, 189)',
      'rgb(255, 152, 150)',
      'rgb(214, 39, 40)',
      'rgb(152, 223, 138)',
      'rgb(44, 160, 44)',
      'rgb(255, 187, 120)',
      'rgb(255, 127, 14)',
      'rgb(174, 199, 232)',
      'rgb(31, 119, 180)',
      'rgb(240, 179, 35)',
      'rgb(188, 189, 34)',
      'rgb(199, 199, 199)',
      'rgb(127, 127, 127)',
      'rgb(247, 182, 210)',
      'rgb(174, 199, 232)',
      'rgb(227, 119, 194)',
      'rgb(196, 156, 148)',
      'rgb(140, 86, 75)',
      'rgb(197, 176, 213)',
      'rgb(148, 103, 189)',
      'rgb(255, 152, 150)',
      'rgb(214, 39, 40)',
      'rgb(152, 223, 138)',
      'rgb(44, 160, 44)',
      'rgb(255, 187, 120)',
      'rgb(255, 127, 14)',
      'rgb(174, 199, 232)',
      'rgb(31, 119, 180)',
      'rgb(240, 179, 35)',
      'rgb(188, 189, 34)',
      'rgb(199, 199, 199)',
      'rgb(127, 127, 127)',
      'rgb(247, 182, 210)',
      'rgb(174, 199, 232)',
      'rgb(227, 119, 194)',
      'rgb(196, 156, 148)',
      'rgb(140, 86, 75)',
      'rgb(197, 176, 213)',
      'rgb(148, 103, 189)',
      'rgb(255, 152, 150)',
      'rgb(214, 39, 40)',
      'rgb(152, 223, 138)',
      'rgb(44, 160, 44)',
      'rgb(255, 187, 120)',
      'rgb(255, 127, 14)',
      'rgb(174, 199, 232)',
      'rgb(31, 119, 180)',
      'rgb(240, 179, 35)',
      'rgb(188, 189, 34)',
      'rgb(199, 199, 199)',
      'rgb(127, 127, 127)',
      'rgb(247, 182, 210)',
      'rgb(174, 199, 232)',
      'rgb(227, 119, 194)',
      'rgb(196, 156, 148)',
      'rgb(140, 86, 75)',
      'rgb(197, 176, 213)',
      'rgb(148, 103, 189)',
      'rgb(255, 152, 150)',
      'rgb(214, 39, 40)',
      'rgb(152, 223, 138)',
      'rgb(44, 160, 44)',
      'rgb(255, 187, 120)',
      'rgb(255, 127, 14)',
      'rgb(174, 199, 232)',
      'rgb(31, 119, 180)',
      'rgb(240, 179, 35)',
      'rgb(188, 189, 34)',
      'rgb(199, 199, 199)',
      'rgb(127, 127, 127)',
      'rgb(247, 182, 210)',
      'rgb(174, 199, 232)',
      'rgb(227, 119, 194)',
      'rgb(196, 156, 148)',
      'rgb(140, 86, 75)',
      'rgb(197, 176, 213)',
      'rgb(148, 103, 189)',
      'rgb(255, 152, 150)',
      'rgb(214, 39, 40)',
      'rgb(152, 223, 138)',
      'rgb(44, 160, 44)',
      'rgb(255, 187, 120)',
      'rgb(255, 127, 14)',
      'rgb(174, 199, 232)',
      'rgb(31, 119, 180)',
      'rgb(240, 179, 35)',
      'rgb(188, 189, 34)',
      'rgb(199, 199, 199)',
      'rgb(127, 127, 127)',
      'rgb(247, 182, 210)',
      'rgb(174, 199, 232)',
      'rgb(227, 119, 194)',
      'rgb(196, 156, 148)',
      'rgb(140, 86, 75)',
      'rgb(197, 176, 213)',
      'rgb(148, 103, 189)',
      'rgb(255, 152, 150)',
      'rgb(214, 39, 40)',
      'rgb(152, 223, 138)',
      'rgb(44, 160, 44)',
      'rgb(255, 187, 120)',
      'rgb(255, 127, 14)',
      'rgb(174, 199, 232)',
      'rgb(31, 119, 180)',
      'rgb(240, 179, 35)',
      'rgb(188, 189, 34)',
      'rgb(199, 199, 199)',
      'rgb(127, 127, 127)',
      'rgb(247, 182, 210)',
      'rgb(174, 199, 232)',
      'rgb(227, 119, 194)',
      'rgb(196, 156, 148)',
      'rgb(140, 86, 75)',
      'rgb(197, 176, 213)',
      'rgb(148, 103, 189)',
      'rgb(255, 152, 150)',
      'rgb(214, 39, 40)',
      'rgb(152, 223, 138)',
      'rgb(44, 160, 44)',
      'rgb(255, 187, 120)',
      'rgb(255, 127, 14)',
      'rgb(174, 199, 232)',
      'rgb(31, 119, 180)',
      'rgb(240, 179, 35)',
      'rgb(188, 189, 34)',
      'rgb(199, 199, 199)',
      'rgb(127, 127, 127)',
      'rgb(247, 182, 210)',
      'rgb(174, 199, 232)',
      'rgb(227, 119, 194)',
      'rgb(196, 156, 148)',
      'rgb(140, 86, 75)',
      'rgb(197, 176, 213)',
      'rgb(148, 103, 189)',
      'rgb(255, 152, 150)',
      'rgb(214, 39, 40)',
      'rgb(152, 223, 138)',
      'rgb(44, 160, 44)',
      'rgb(255, 187, 120)',
      'rgb(255, 127, 14)',
      'rgb(174, 199, 232)',
      'rgb(31, 119, 180)',
      'rgb(240, 179, 35)',
      'rgb(188, 189, 34)',
      'rgb(199, 199, 199)',
      'rgb(127, 127, 127)',
      'rgb(247, 182, 210)',
      'rgb(174, 199, 232)',
      'rgb(227, 119, 194)',
      'rgb(196, 156, 148)',
      'rgb(140, 86, 75)',
      'rgb(197, 176, 213)',
      'rgb(148, 103, 189)',
      'rgb(255, 152, 150)',
      'rgb(214, 39, 40)',
      'rgb(152, 223, 138)',
      'rgb(44, 160, 44)',
      'rgb(255, 187, 120)',
      'rgb(255, 127, 14)',
      'rgb(174, 199, 232)',
      'rgb(31, 119, 180)',
    ]
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
      private analyticsSrv: LearningAnalyticsService,
      private configSvc: ConfigurationsService,
      private graphGeneralSvc: GraphGeneralService,
      private resolver: AnalyticsResolver,
    ) { }

    ngOnInit() {
      this.filterEventSubscription = this.graphGeneralSvc.filterEventChangeSubject.subscribe(
        (filterEvent: any) => {
          const filter = {
            key: filterEvent.filterType,
            value: filterEvent.filterName,
          }
          this.filterArray.push(filter)
          this.initData(
            this.endDate,
            this.startDate,
            this.contentType,
            this.searchQuery,
            this.filterArray,
          )
          this.getHourlyGraphData(
            'all',
            this.endDate,
            this.startDate,
            this.contentType,
            this.searchQuery,
            this.filterArray,
          )
          this.onExpand = false
        },
      )
      this.removeEventSubscription = this.resolver.removeFilterEventChangeSubject.subscribe(
        (removeEvent: any) => {
          this.showCategory = false
          this.filterArray = []
          if (removeEvent.length === 0) {
            this.filterArray = []
            this.searchQuery = ''
          } else {
            removeEvent.forEach((event: NsAnalytics.IFilter) => {
              if (event.filterType === 'searchQuery') {
                this.searchQuery = event.filterName
              } else {
                const filter = {
                  key: event.filterType,
                  value: event.filterName,
                }
                this.filterArray.push(filter)
              }
            })
          }
          this.initData(
            this.endDate,
            this.startDate,
            this.contentType,
            this.searchQuery,
            this.filterArray,
          )
          this.getHourlyGraphData(
            'all',
            this.endDate,
            this.startDate,
            this.contentType,
            this.searchQuery,
            this.filterArray,
          )
        },
      )
      this.dateEventSubscription = this.resolver.dateEventChangeSubject.subscribe(
        (dateEvent: any) => {
          this.startDate = dateEvent.startDate.trim()
          this.endDate = dateEvent.endDate.trim()
          this.initData(
            this.endDate,
            this.startDate,
            this.contentType,
            this.searchQuery,
            this.filterArray,
          )
          this.getHourlyGraphData(
            'all',
            this.endDate,
            this.startDate,
            this.contentType,
            this.searchQuery,
            this.filterArray,
          )
        },
      )

      this.searchEventSubscription = this.resolver.searchEventChangeSubject.subscribe(
        (searchEvent: any) => {
          this.searchQuery = searchEvent.searchQuery
          this.initData(
            this.endDate,
            this.startDate,
            this.contentType,
            this.searchQuery,
            this.filterArray,
          )
          this.getHourlyGraphData(
            'all',
            this.endDate,
            this.startDate,
            this.contentType,
            this.searchQuery,
            this.filterArray,
          )
        },
      )
      this.prefChangeSubscription = this.configSvc.prefChangeNotifier.subscribe(() => {
        this.populateChartData()
      })
      // this.initData(this.endDate, this.startDate, this.contentType, this.searchQuery, this.filterArray)
    }

    applyFilter(filter: string) {
      this.getHourlyGraphData(
        filter,
        this.endDate,
        this.startDate,
        this.contentType,
        this.searchQuery,
        this.filterArray,
      )
    }
    onStatusChange() {
      this.showCategory = !this.showCategory
    }
    getHourlyGraphData(
      filterKey: string,
      endDate: string,
      startDate: string,
      contentType: string,
      searchQuery: string,
      filterArray: NsAnalytics.IFilterObj[],
    ) {
      this.filterFetchStatus = 'fetching'
      this.analyticsSrv
        .hourlyFilterData(filterKey, endDate, startDate, contentType, filterArray, searchQuery)
        .subscribe(
          (hourData: any) => {
            this.hourlyData = hourData
            this.hourlyChartData()
            this.filterFetchStatus = 'done'
          },
          // tslint:disable-next-line:align
          () => {
            this.hourlyData = null
            this.filterFetchStatus = 'error'
          },
        )
    }
    ngOnDestroy() {
      if (this.prefChangeSubscription) {
        this.prefChangeSubscription.unsubscribe()
      }
      if (this.filterEventSubscription) {
        this.filterEventSubscription.unsubscribe()
      }
      if (this.dateEventSubscription) {
        this.dateEventSubscription.unsubscribe()
      }
      if (this.searchEventSubscription) {
        this.searchEventSubscription.unsubscribe()
      }
      if (this.removeEventSubscription) {
        this.removeEventSubscription.unsubscribe()
      }
    }

    initData(
      endDate: string,
      startDate: string,
      contentType: string,
      searchQuery: string,
      filterArray: NsAnalytics.IFilterObj[],
    ) {
      this.fetchStatus = 'fetching'
      this.analyticsSrv
        .timeSpent(endDate, startDate, contentType, filterArray, searchQuery)
        .subscribe(
          (timeSpentData: any) => {
            this.contentData = timeSpentData
            this.populateChartData()
            this.hourlyChartData()
            this.fetchStatus = 'done'
          },
          // tslint:disable-next-line:align
          () => {
            this.contentData = null
            this.fetchStatus = 'error'
          },
        )
    }

    onClose() {
      this.initData(
        this.endDate,
        this.startDate,
        this.contentType,
        this.searchQuery,
        this.filterArray,
      )
      this.getHourlyGraphData(
        'all',
        this.endDate,
        this.startDate,
        this.contentType,
        this.searchQuery,
        this.filterArray,
      )
      this.onExpand = false
    }
    onExpandChart(type: string, filterType: string) {
      const barChartExpandLabel: string[] = []
      const expandData: number[] = []
      this.contentData[type].forEach((expand: any) => {
        if (barChartExpandLabel.length <= 100) {
          barChartExpandLabel.push(expand.key)
        }
        if (expandData.length <= 100) {
          expandData.push(expand.doc_count)
        }
      })
      this.barChartExpandData = {
        widgetType: ROOT_WIDGET_CONFIG.graph._type,
        widgetSubType: ROOT_WIDGET_CONFIG.graph.graphGeneral,
        widgetData: {
          graphId: 'expandChart',
          graphType: 'horizontalBar',
          graphHeight: '1500px',
          graphWidth: '100%',
          graphLegend: false,
          graphLegendPosition: 'top',
          graphLegendFontSize: 11,
          graphTicksFontSize: 11,
          graphTicksXAxisDisplay: true,
          graphTicksYAxisDisplay: true,
          graphGridLinesDisplay: false,
          graphDefaultPalette: 'default',
          graphOnClick: true,
          graphFilterType: filterType,
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
      this.onExpand = true
    }

    hourlyChartData() {
      if (this.hourlyData) {
        // Hourly users BarChart Data
        const barChartHourlyLabel: string[] = []
        const hourlyData: number[] = []
        this.hourlyData.hourly_usage.forEach((hour: any) => {
          barChartHourlyLabel.push(hour.key)
          hourlyData.push(hour.doc_count)
        })
        this.barChartHourlyUsersData = {
          widgetType: ROOT_WIDGET_CONFIG.graph._type,
          widgetSubType: ROOT_WIDGET_CONFIG.graph.graphGeneral,
          widgetData: {
            graphId: 'hourlyUsersChart',
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
            graphXAxisMaxLimit: 24,
            graphIsXAxisAutoSkip: false,
            graphDefaultPalette: 'default',
            graphYAxisLabel: '# Users',
            graphXAxisLabel: 'Hour in GMT',
            graphIsXAxisLabel: true,
            graphIsYAxisLabel: true,
            graphOnClick: false,
            graphData: {
              labels: barChartHourlyLabel,
              datasets: [
                {
                  label: '',
                  backgroundColor: 'rgb(32, 150, 205)',
                  borderWidth: 1,
                  data: hourlyData,
                },
              ],
            },
          },
        }
      }
    }
    populateChartData() {
      try {
        if (this.contentData) {
          // all contents count
          this.contentUsers = this.contentData.content_users
          this.totalUsers = this.contentData.totalUsers
          this.hits = this.contentData.num_of_hits
          this.contentAccessed = this.contentData.all_content_accessed

          // users by City BarChart Data
          const barChartCityLabel: string[] = []
          const cityData: number[] = []
          if (this.contentData.organizationLocationCity) {
            this.contentData.organizationLocationCity.forEach((city: any) => {
              if (barChartCityLabel.length < 20) {
                barChartCityLabel.push(city.key)
              }
              if (cityData.length < 20) {
                cityData.push(city.doc_count)
              }
            })
          }

          this.barChartCityData = {
            widgetType: ROOT_WIDGET_CONFIG.graph._type,
            widgetSubType: ROOT_WIDGET_CONFIG.graph.graphGeneral,
            widgetData: {
              graphId: 'cityChart',
              graphType: 'horizontalBar',
              graphHeight: '300px',
              graphWidth: '100%',
              graphLegend: false,
              graphLegendPosition: 'top',
              graphLegendFontSize: 11,
              graphTicksFontSize: 11,
              graphTicksXAxisDisplay: true,
              graphTicksYAxisDisplay: true,
              graphGridLinesDisplay: false,
              graphDefaultPalette: 'default',
              graphFilterType: 'City',
              graphXAxisLabel: '# Users',
              graphYAxisLabel: 'City',
              graphIsXAxisLabel: true,
              graphIsYAxisLabel: true,
              graphOnClick: true,
              graphData: {
                labels: barChartCityLabel,
                datasets: [
                  {
                    label: '',
                    backgroundColor: this.chartColors,
                    borderWidth: 1,
                    data: cityData,
                  },
                ],
              },
            },
          }

          // users by Source BarChart Data
          const barChartSourceLabel: string[] = []
          const sourceData: number[] = []
          this.contentData.content_source.forEach((source: any) => {
            if (barChartSourceLabel.length < 20) {
              barChartSourceLabel.push(source.key)
            }
            if (sourceData.length < 20) {
              sourceData.push(source.doc_count)
            }
          })
          this.barChartSourceData = {
            widgetType: ROOT_WIDGET_CONFIG.graph._type,
            widgetSubType: ROOT_WIDGET_CONFIG.graph.graphGeneral,
            widgetData: {
              graphId: 'sourceChart',
              graphType: 'horizontalBar',
              graphHeight: '300px',
              graphWidth: '100%',
              graphLegend: false,
              graphLegendPosition: 'top',
              graphLegendFontSize: 11,
              graphTicksFontSize: 11,
              graphTicksXAxisDisplay: true,
              graphTicksYAxisDisplay: true,
              graphGridLinesDisplay: false,
              graphDefaultPalette: 'default',
              graphFilterType: 'Source',
              graphXAxisLabel: '# Users',
              graphYAxisLabel: 'Source',
              graphIsXAxisLabel: true,
              graphIsYAxisLabel: true,
              graphOnClick: true,
              graphData: {
                labels: barChartSourceLabel,
                datasets: [
                  {
                    label: '',
                    backgroundColor: this.graphColors,
                    borderWidth: 1,
                    data: sourceData,
                  },
                ],
              },
            },
          }

          // users by Guild BarChart Data
          const barChartGuildTypeLabel: string[] = []
          const guildData: number[] = []
          if (this.contentData.guild_group
            && this.contentData.guild_group.length > 0) {
            this.contentData.guild_group.forEach((source: any) => {
              if (barChartGuildTypeLabel.length < 20) {
                barChartGuildTypeLabel.push(source.key)
              }
              if (guildData.length < 20) {
                guildData.push(source.doc_count)
              }
            })
          }
          this.barChartGuildData = {
            widgetType: ROOT_WIDGET_CONFIG.graph._type,
            widgetSubType: ROOT_WIDGET_CONFIG.graph.graphGeneral,
            widgetData: {
              graphId: 'guildChart',
              graphType: 'horizontalBar',
              graphHeight: '300px',
              graphWidth: '100%',
              graphLegend: false,
              graphLegendPosition: 'top',
              graphLegendFontSize: 11,
              graphTicksFontSize: 11,
              graphTicksXAxisDisplay: true,
              graphTicksYAxisDisplay: true,
              graphGridLinesDisplay: false,
              graphDefaultPalette: 'default',
              graphFilterType: 'GuildGroup',
              graphXAxisLabel: '# Users',
              graphYAxisLabel: 'Guild Group',
              graphIsXAxisLabel: true,
              graphIsYAxisLabel: true,
              graphOnClick: true,
              graphData: {
                labels: barChartGuildTypeLabel,
                datasets: [
                  {
                    label: '',
                    backgroundColor: this.chartColors,
                    borderWidth: 1,
                    data: guildData,
                  },
                ],
              },
            },
          }
          // users by Roles BarChart Data
          const barChartRolesLabel: string[] = []
          const rolesData: number[] = []
          if (this.contentData.role) {
            this.contentData.role.forEach((source: any) => {
              if (barChartRolesLabel.length < 20) {
                barChartRolesLabel.push(source.key)
              }
              if (rolesData.length < 20) {
                rolesData.push(source.doc_count)
              }
            })
          }

          this.barChartRoleData = {
            widgetType: ROOT_WIDGET_CONFIG.graph._type,
            widgetSubType: ROOT_WIDGET_CONFIG.graph.graphGeneral,
            widgetData: {
              graphId: 'rolesChart',
              graphType: 'horizontalBar',
              graphHeight: '300px',
              graphWidth: '100%',
              graphLegend: false,
              graphLegendPosition: 'top',
              graphLegendFontSize: 11,
              graphTicksFontSize: 11,
              graphTicksXAxisDisplay: true,
              graphTicksYAxisDisplay: true,
              graphGridLinesDisplay: false,
              graphDefaultPalette: 'default',
              graphFilterType: 'Role',
              graphXAxisLabel: '# Users',
              graphYAxisLabel: 'Role',
              graphIsXAxisLabel: true,
              graphIsYAxisLabel: true,
              graphOnClick: true,
              graphData: {
                labels: barChartRolesLabel,
                datasets: [
                  {
                    label: '',
                    backgroundColor: this.chartColors,
                    borderWidth: 1,
                    data: rolesData,
                  },
                ],
              },
            },
          }
          // users by Country BarChart Data
          const barChartCountryLabel: string[] = []
          const countryData: number[] = []
          this.contentData.organizationLocationCountry.forEach((country: any) => {
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
              graphTicksXAxisDisplay: true,
              graphTicksYAxisDisplay: true,
              graphGridLinesDisplay: false,
              graphDefaultPalette: 'default',
              graphFilterType: 'Country',
              graphXAxisLabel: '# Users',
              graphYAxisLabel: 'Country',
              graphIsXAxisLabel: true,
              graphIsYAxisLabel: true,
              graphOnClick: true,
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
          // users by Region BarChart Data
          const barChartRegionLabel: string[] = []
          const regionData: number[] = []
          this.contentData.region.forEach((region: any) => {
            if (barChartRegionLabel.length < 20) {
              barChartRegionLabel.push(region.key)
            }
            if (regionData.length < 20) {
              regionData.push(region.doc_count)
            }
          })
          this.barChartRegionData = {
            widgetType: ROOT_WIDGET_CONFIG.graph._type,
            widgetSubType: ROOT_WIDGET_CONFIG.graph.graphGeneral,
            widgetData: {
              graphId: 'regionChart',
              graphType: 'horizontalBar',
              graphHeight: '300px',
              graphWidth: '100%',
              graphLegend: false,
              graphLegendPosition: 'top',
              graphLegendFontSize: 11,
              graphTicksFontSize: 11,
              graphTicksXAxisDisplay: true,
              graphTicksYAxisDisplay: true,
              graphGridLinesDisplay: false,
              graphDefaultPalette: 'default',
              graphFilterType: 'Region',
              graphXAxisLabel: '# Users',
              graphYAxisLabel: 'Region',
              graphIsXAxisLabel: true,
              graphIsYAxisLabel: true,
              graphOnClick: true,
              graphData: {
                labels: barChartRegionLabel,
                datasets: [
                  {
                    label: '',
                    backgroundColor: this.chartColors,
                    borderWidth: 1,
                    data: regionData,
                  },
                ],
              },
            },
          }
          // users by Department BarChart Data
          const barChartDepartmentLabel: string[] = []
          const departmentData: number[] = []
          this.contentData.department.forEach((dept: any) => {
            if (barChartDepartmentLabel.length < 20) {
              barChartDepartmentLabel.push(dept.key)
            }
            if (departmentData.length < 20) {
              departmentData.push(dept.doc_count)
            }
          })
          this.barChartDepartmentData = {
            widgetType: ROOT_WIDGET_CONFIG.graph._type,
            widgetSubType: ROOT_WIDGET_CONFIG.graph.graphGeneral,
            widgetData: {
              graphId: 'departmentChart',
              graphType: 'horizontalBar',
              graphHeight: '300px',
              graphWidth: '100%',
              graphLegend: false,
              graphLegendPosition: 'top',
              graphLegendFontSize: 11,
              graphTicksFontSize: 11,
              graphTicksXAxisDisplay: true,
              graphTicksYAxisDisplay: true,
              graphGridLinesDisplay: false,
              graphDefaultPalette: 'default',
              graphFilterType: 'Department',
              graphXAxisLabel: '# Users',
              graphYAxisLabel: 'Department',
              graphIsXAxisLabel: true,
              graphIsYAxisLabel: true,
              graphOnClick: true,
              graphData: {
                labels: barChartDepartmentLabel,
                datasets: [
                  {
                    label: '',
                    backgroundColor: this.graphColors,
                    borderWidth: 1,
                    data: departmentData,
                  },
                ],
              },
            },
          }

          // users by Dealer BarChart Data
          const barChartDealerLabel: string[] = []
          const dealerData: number[] = []
          this.contentData.dealer.forEach((deal: any) => {
            if (barChartDealerLabel.length < 20) {
              barChartDealerLabel.push(deal.key)
            }
            if (dealerData.length < 20) {
              dealerData.push(deal.doc_count)
            }
          })
          this.barChartDealerData = {
            widgetType: ROOT_WIDGET_CONFIG.graph._type,
            widgetSubType: ROOT_WIDGET_CONFIG.graph.graphGeneral,
            widgetData: {
              graphId: 'dealerChart',
              graphType: 'horizontalBar',
              graphHeight: '300px',
              graphWidth: '100%',
              graphLegend: false,
              graphLegendPosition: 'top',
              graphLegendFontSize: 11,
              graphTicksFontSize: 11,
              graphTicksXAxisDisplay: true,
              graphTicksYAxisDisplay: true,
              graphGridLinesDisplay: false,
              graphDefaultPalette: 'default',
              graphFilterType: 'Dealer',
              graphXAxisLabel: '# Users',
              graphYAxisLabel: 'Dealer',
              graphIsXAxisLabel: true,
              graphIsYAxisLabel: true,
              graphOnClick: true,
              graphData: {
                labels: barChartDealerLabel,
                datasets: [
                  {
                    label: '',
                    backgroundColor: this.chartColors,
                    borderWidth: 1,
                    data: dealerData,
                  },
                ],
              },
            },
          }

          // users by Sub-Department BarChart Data
          const barChartSubDepartmentLabel: string[] = []
          const subDepartmentData: number[] = []
          this.contentData.department.forEach((sub: any) => {
            if (barChartSubDepartmentLabel.length < 20) {
              barChartSubDepartmentLabel.push(sub.key)
            }
            if (subDepartmentData.length < 20) {
              subDepartmentData.push(sub.doc_count)
            }
          })
          this.barChartSubDepartmentData = {
            widgetType: ROOT_WIDGET_CONFIG.graph._type,
            widgetSubType: ROOT_WIDGET_CONFIG.graph.graphGeneral,
            widgetData: {
              graphId: 'subDepartmentChart',
              graphType: 'horizontalBar',
              graphHeight: '300px',
              graphWidth: '100%',
              graphLegend: false,
              graphLegendPosition: 'top',
              graphLegendFontSize: 11,
              graphTicksFontSize: 11,
              graphTicksXAxisDisplay: true,
              graphTicksYAxisDisplay: true,
              graphGridLinesDisplay: false,
              graphDefaultPalette: 'default',
              graphFilterType: 'SubDepartment',
              graphXAxisLabel: '# Users',
              graphYAxisLabel: 'sub-Department',
              graphIsXAxisLabel: true,
              graphIsYAxisLabel: true,
              graphOnClick: true,
              graphData: {
                labels: barChartSubDepartmentLabel,
                datasets: [
                  {
                    label: '',
                    backgroundColor: this.graphColors,
                    borderWidth: 1,
                    data: subDepartmentData,
                  },
                ],
              },
            },
          }

          // users by Device BarChart Data
          const barChartDeviceLabel: string[] = []
          const deviceData: number[] = []
          this.contentData.devices.forEach((city: any) => {
            if (barChartDeviceLabel.length < 20) {
              barChartDeviceLabel.push(city.key)
            }
            if (deviceData.length < 20) {
              deviceData.push(city.doc_count)
            }
          })
          this.barChartDeviceData = {
            widgetType: ROOT_WIDGET_CONFIG.graph._type,
            widgetSubType: ROOT_WIDGET_CONFIG.graph.graphGeneral,
            widgetData: {
              graphId: 'deviceChart',
              graphType: 'bar',
              graphHeight: '300px',
              graphWidth: '100%',
              graphLegend: false,
              graphLegendPosition: 'left',
              graphLegendFontSize: 11,
              graphTicksFontSize: 11,
              graphTicksXAxisDisplay: true,
              graphTicksYAxisDisplay: true,
              graphGridLinesDisplay: false,
              graphDefaultPalette: 'default',
              graphFilterType: 'Device',
              graphYAxisLabel: '# Users',
              graphXAxisLabel: 'Device',
              graphIsXAxisLabel: true,
              graphIsYAxisLabel: true,
              graphOnClick: true,
              graphData: {
                labels: barChartDeviceLabel,
                datasets: [
                  {
                    label: '',
                    backgroundColor: this.chartColors,
                    borderWidth: 1,
                    data: deviceData,
                  },
                ],
              },
            },
          }

          // users by Device Category PieChart Data
          const pieChartDeviceCategoryLabel: string[] = []
          const deviceCategoryData: number[] = []
          if (this.contentData.device_category) {
            this.contentData.device_category.forEach((city: any) => {
              if (pieChartDeviceCategoryLabel.length < 20) {
                pieChartDeviceCategoryLabel.push(city.key)
              }
              if (deviceCategoryData.length < 20) {
                deviceCategoryData.push(city.doc_count)
              }
            })
          }

          this.pieChartDeviceCategoryData = {
            widgetType: ROOT_WIDGET_CONFIG.graph._type,
            widgetSubType: ROOT_WIDGET_CONFIG.graph.graphGeneral,
            widgetData: {
              graphId: 'deviceCategoryChart',
              graphType: 'pie',
              graphHeight: '200px',
              graphWidth: '100%',
              graphLegend: true,
              graphLegendPosition: 'left',
              graphLegendFontSize: 11,
              graphTicksFontSize: 11,
              graphTicksXAxisDisplay: true,
              graphTicksYAxisDisplay: true,
              graphGridLinesDisplay: false,
              graphDefaultPalette: 'default',
              graphFilterType: 'DeviceCategory',
              graphYAxisLabel: '# Users',
              graphXAxisLabel: 'Device',
              graphIsXAxisLabel: true,
              graphIsYAxisLabel: true,
              graphOnClick: true,
              graphData: {
                labels: pieChartDeviceCategoryLabel,
                datasets: [
                  {
                    label: '',
                    backgroundColor: this.chartColors,
                    borderWidth: 1,
                    data: deviceCategoryData,
                  },
                ],
              },
            },
          }

          // daily users content accessed BarChart Data
          const barChartDailyUsersLabel: string[] = []
          const dailyUsersData: number[] = []
          this.contentData.dailyContentUsers.forEach((users: any) => {
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
              graphYAxisLabel: '# Users',
              graphXAxisLabel: 'Date',
              graphIsXAxisLabel: true,
              graphIsYAxisLabel: true,
              graphOnClick: false,
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
          // daily users BarChart Data
          const barChartDailyUsageLabel: string[] = []
          const dailyUsageData: number[] = []
          this.contentData.daily_users.forEach((daily: any) => {
            this.dailyDate = daily.key_as_string
            this.dailyDate = this.dailyDate.split('T')[0]
            const month = this.months[new Date(this.dailyDate).getMonth()]
            const date = this.dailyDate.split('-')[2]
            this.dailyDate = `${date}-${month}`
            barChartDailyUsageLabel.push(this.dailyDate)
            dailyUsageData.push(daily.doc_count)
          })
          this.barChartDailyUsageData = {
            widgetType: ROOT_WIDGET_CONFIG.graph._type,
            widgetSubType: ROOT_WIDGET_CONFIG.graph.graphGeneral,
            widgetData: {
              graphId: 'dailyUsageChart',
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
              graphYAxisLabel: '# Users',
              graphXAxisLabel: 'Date',
              graphIsXAxisLabel: true,
              graphIsYAxisLabel: true,
              graphOnClick: false,
              graphData: {
                labels: barChartDailyUsageLabel,
                datasets: [
                  {
                    label: '',
                    backgroundColor: 'rgb(32, 150, 205)',
                    borderWidth: 1,
                    data: dailyUsageData,
                  },
                ],
              },
            },
          }
          // daily users content accessed BarChart Data
          const barChartDailyNewUsersLabel: string[] = []
          const dailyNewUsersData: number[] = []
          this.contentData.dailyNewUsers.forEach((users: any) => {
            this.dailyDate = users.key_as_string
            this.dailyDate = this.dailyDate.split('T')[0]
            const month = this.months[new Date(this.dailyDate).getMonth()]
            const date = this.dailyDate.split('-')[2]
            this.dailyDate = `${date}-${month}`
            barChartDailyNewUsersLabel.push(this.dailyDate)
            dailyNewUsersData.push(users.doc_count)
          })
          this.barChartDailyNewUsersData = {
            widgetType: ROOT_WIDGET_CONFIG.graph._type,
            widgetSubType: ROOT_WIDGET_CONFIG.graph.graphGeneral,
            widgetData: {
              graphId: 'dailyNewUsersChart',
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
              graphYAxisLabel: '# Users',
              graphXAxisLabel: 'Date',
              graphIsXAxisLabel: true,
              graphIsYAxisLabel: true,
              graphOnClick: false,
              graphData: {
                labels: barChartDailyNewUsersLabel,
                datasets: [
                  {
                    label: '',
                    backgroundColor: 'rgb(32, 150, 205)',
                    borderWidth: 1,
                    data: dailyNewUsersData,
                  },
                ],
              },
            },
          }

          // daily users content accessed BarChart Data
          const barChartWeeklyUsersLabel: string[] = []
          const weeklyUsersData: number[] = []
          this.contentData.weeklyNewUsers.forEach((users: any) => {
            this.dailyDate = users.key_as_string
            this.dailyDate = this.dailyDate.split('T')[0]
            const month = this.months[new Date(this.dailyDate).getMonth()]
            const date = this.dailyDate.split('-')[2]
            this.dailyDate = `${date}-${month}`
            barChartWeeklyUsersLabel.push(this.dailyDate)
            weeklyUsersData.push(users.doc_count)
          })
          this.barChartWeeklyNewUsersData = {
            widgetType: ROOT_WIDGET_CONFIG.graph._type,
            widgetSubType: ROOT_WIDGET_CONFIG.graph.graphGeneral,
            widgetData: {
              graphId: 'weeklyUsersChart',
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
              graphYAxisLabel: '# Users',
              graphXAxisLabel: 'Date',
              graphIsXAxisLabel: true,
              graphIsYAxisLabel: true,
              graphOnClick: false,
              graphData: {
                labels: barChartWeeklyUsersLabel,
                datasets: [
                  {
                    label: '',
                    backgroundColor: 'rgb(32, 150, 205)',
                    borderWidth: 1,
                    data: weeklyUsersData,
                  },
                ],
              },
            },
          }

          // Monthly users BarChart Data
          const barChartMonthlyUsersLabel: string[] = []
          const monthlyUsersData: number[] = []
          this.contentData.monthlyNewUsers.forEach((users: any) => {
            this.dailyDate = users.key_as_string
            this.dailyDate = this.dailyDate.split('T')[0]
            const month = this.months[new Date(this.dailyDate).getMonth()]
            const date = this.dailyDate.split('-')[2]
            this.dailyDate = `${date}-${month}`
            barChartMonthlyUsersLabel.push(this.dailyDate)
            monthlyUsersData.push(users.doc_count)
          })
          this.barChartMonthlyNewUsersData = {
            widgetType: ROOT_WIDGET_CONFIG.graph._type,
            widgetSubType: ROOT_WIDGET_CONFIG.graph.graphGeneral,
            widgetData: {
              graphId: 'monthlyUsersChart',
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
              graphYAxisLabel: '# Users',
              graphXAxisLabel: 'Date',
              graphIsXAxisLabel: true,
              graphIsYAxisLabel: true,
              graphOnClick: false,
              graphData: {
                labels: barChartMonthlyUsersLabel,
                datasets: [
                  {
                    label: '',
                    backgroundColor: 'rgb(32, 150, 205)',
                    borderWidth: 1,
                    data: monthlyUsersData,
                  },
                ],
              },
            },
          }
        }

    } catch (e) {
      // tslint:disable-next-line: no-console
      console.log(e)
    }

    }
  }
