import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core'
import { PageEvent } from '@angular/material'
import { LearningAnalyticsService } from '../../services/learning-analytics.service'
import { MatPaginator } from '@angular/material/paginator'
import { NsAnalytics } from '../../models/learning-analytics.model'
import { TFetchStatus, ValueService } from '@ws-widget/utils'
import { Subscription } from 'rxjs'
import { AnalyticsResolver } from '../../resolvers/learning-analytics-filters.resolver'
import { ActivatedRoute } from '@angular/router'
import { GraphGeneralService, IGraphWidget, ROOT_WIDGET_CONFIG } from '@ws-widget/collection'

@Component({
  selector: 'ws-analytics-content',
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.scss'],
})
export class ContentComponent implements OnInit, OnDestroy {
  searchQuery = ''
  startDate = ''
  endDate = ''
  contentType = 'Course'
  isCompleted = 0
  userFetchStatus: TFetchStatus = 'fetching'
  courseFetchStatus: TFetchStatus = 'fetching'
  modulesFetchStatus: TFetchStatus = 'fetching'
  resourceFetchStatus: TFetchStatus = 'fetching'
  getUserLearning = true
  error = false
  filterArray: NsAnalytics.IFilterObj[] = []
  loader: any
  myProgress: any
  othersProgress: any
  progressData: any
  page = {
    p1: 0,
    p2: 0,
  }
  onExpand = false
  progressData1 = [
    { status: false, data: [] },
    { status: false, data: [] },
    { status: false, data: [] },
  ]
  userProgressData: any
  displayedColumns: string[] = ['name', 'users']
  dataSource: any
  coursesDescription = 'Total number of courses'
  modulesDescription = 'Total number of modules'
  resourcesDescription = 'Total number of resources'
  isLtMedium$ = this.valueSvc.isLtMedium$
  screenSizeIsLtMedium = false
  analytics = this.route.snapshot.data.pageData.data.analytics.subFeatures.learningAnalytics.tabs
    .content
  private filterEventSubscription: Subscription | null = null
  private removeEventSubscription: Subscription | null = null
  private dateEventSubscription: Subscription | null = null
  private searchEventSubscription: Subscription | null = null
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
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator | null = null
  pieContentTypeChartData: IGraphWidget = {} as IGraphWidget
  barChartExpandData: IGraphWidget = {} as IGraphWidget
  barChartResourceTypeData: IGraphWidget = {} as IGraphWidget
  barChartResourceTypeViewData: IGraphWidget = {} as IGraphWidget
  barChartMimeTypeData: IGraphWidget = {} as IGraphWidget
  barChartMimeTypeViewData: IGraphWidget = {} as IGraphWidget
  showViews = false
  showTime = false

  constructor(
    private analyticsSrv: LearningAnalyticsService,
    private graphGeneralSvc: GraphGeneralService,
    private resolver: AnalyticsResolver,
    private route: ActivatedRoute,
    private valueSvc: ValueService,
  ) { }

  ngOnInit() {
    this.isLtMedium$.subscribe((isLtMedium: boolean) => {
      this.screenSizeIsLtMedium = isLtMedium
    })
    this.filterEventSubscription = this.graphGeneralSvc.filterEventChangeSubject.subscribe(
      (filterEvent: any) => {
        const filter = {
          key: filterEvent.filterType,
          value: filterEvent.filterName,
        }
        this.filterArray.push(filter)
        this.getFilteredCourse(0, this.endDate, this.startDate, this.searchQuery, this.filterArray)
      },
    )
    this.removeEventSubscription = this.resolver.removeFilterEventChangeSubject.subscribe(
      (removeEvent: any) => {
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
        this.getFilteredCourse(0, this.endDate, this.startDate, this.searchQuery, this.filterArray)
      },
    )
    this.dateEventSubscription = this.resolver.dateEventChangeSubject.subscribe(
      (dateEvent: any) => {
        this.startDate = dateEvent.startDate
        this.endDate = dateEvent.endDate
        this.getFilteredCourse(0, this.endDate, this.startDate, this.searchQuery, this.filterArray)
      },
    )

    this.searchEventSubscription = this.resolver.searchEventChangeSubject.subscribe(
      (searchEvent: any) => {
        this.searchQuery = searchEvent.searchQuery
        this.getFilteredCourse(0, this.endDate, this.startDate, this.searchQuery, this.filterArray)
      },
    )
  }

  // tslint:disable-next-line:max-line-length
  getChartData(
    selectedEndDate: string,
    selectedStartDate: string,
    contentType: string,
    filterArray: NsAnalytics.IFilterObj[],
    searchQuery: string,
  ) {
    this.analyticsSrv
      .content(selectedEndDate, selectedStartDate, contentType, filterArray, searchQuery)
      .subscribe((timeSpentData: any) => {
        this.userProgressData = timeSpentData
        this.othersProgress = timeSpentData.learning_history_progress_range
        this.myProgress = timeSpentData.learning_history
        this.getFilteredCourse(0, this.endDate, this.startDate, this.searchQuery, this.filterArray)
      })
  }
  onTabChangeClient(selectedIndex: number) {
    this.getFilteredCourse(
      selectedIndex,
      this.endDate,
      this.startDate,
      this.searchQuery,
      this.filterArray,
    )
  }

  chartData() {
    // users by Content type pieChart Data
    const pieChartContentTypeLabel: string[] = []
    const contentTypeData: number[] = []
    this.userProgressData.content_type.forEach((content: any) => {
      if (pieChartContentTypeLabel.length < 20) {
        pieChartContentTypeLabel.push(content.key)
      }
      if (contentTypeData.length < 20) {
        contentTypeData.push(content.doc_count)
      }
    })
    this.pieContentTypeChartData = {
      widgetType: ROOT_WIDGET_CONFIG.graph._type,
      widgetSubType: ROOT_WIDGET_CONFIG.graph.graphGeneral,
      widgetData: {
        graphId: 'contentTypeChart',
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
        graphFilterType: 'ContentType',
        graphYAxisLabel: '# Users',
        graphXAxisLabel: 'Content Type',
        graphIsXAxisLabel: true,
        graphIsYAxisLabel: true,
        graphOnClick: true,
        graphData: {
          labels: pieChartContentTypeLabel,
          datasets: [
            {
              label: '',
              backgroundColor: this.chartColors,
              borderWidth: 1,
              data: contentTypeData,
            },
          ],
        },
      },
    }

    // users by Resource Type BarChart Data
    const barChartResourceTypeLabel: string[] = []
    const resourceTypeData: number[] = []
    this.userProgressData.resource_type.forEach((resource: any) => {
      if (barChartResourceTypeLabel.length < 20) {
        barChartResourceTypeLabel.push(resource.key)
      }
      if (resourceTypeData.length < 20) {
        resourceTypeData.push(resource.doc_count)
      }
    })
    this.barChartResourceTypeData = {
      widgetType: ROOT_WIDGET_CONFIG.graph._type,
      widgetSubType: ROOT_WIDGET_CONFIG.graph.graphGeneral,
      widgetData: {
        graphId: 'resourceTypeChart',
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
        graphFilterType: 'ResourceType',
        graphXAxisLabel: '# Users',
        graphYAxisLabel: 'Content Category',
        graphIsXAxisLabel: true,
        graphIsYAxisLabel: true,
        graphOnClick: true,
        graphData: {
          labels: barChartResourceTypeLabel,
          datasets: [
            {
              label: '',
              backgroundColor: this.chartColors,
              borderWidth: 1,
              data: resourceTypeData,
            },
          ],
        },
      },
    }

    // views by Resource Type BarChart Data
    const barChartResourceTypeViewLabel: string[] = []
    const resourceTypeViewData: number[] = []
    this.userProgressData.resource_type = this.userProgressData.resource_type.sort(
      (a: any, b: any) => (a.total_hits > b.total_hits ? -1 : a.total_hits < b.total_hits ? 1 : 0),
    )
    this.userProgressData.resource_type.forEach((resource: any) => {
      if (barChartResourceTypeViewLabel.length < 20) {
        barChartResourceTypeViewLabel.push(resource.key)
      }
      if (resourceTypeViewData.length < 20) {
        resourceTypeViewData.push(resource.total_hits)
      }
    })
    this.barChartResourceTypeViewData = {
      widgetType: ROOT_WIDGET_CONFIG.graph._type,
      widgetSubType: ROOT_WIDGET_CONFIG.graph.graphGeneral,
      widgetData: {
        graphId: 'resourceTypeViewChart',
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
        graphFilterType: 'ResourceType',
        graphXAxisLabel: '# Views',
        graphYAxisLabel: 'Content Category',
        graphIsXAxisLabel: true,
        graphIsYAxisLabel: true,
        graphOnClick: true,
        graphData: {
          labels: barChartResourceTypeViewLabel,
          datasets: [
            {
              label: '',
              backgroundColor: this.chartColors,
              borderWidth: 1,
              data: resourceTypeViewData,
            },
          ],
        },
      },
    }
    // users by MimeType BarChart Data
    const barChartMimeTypeLabel: string[] = []
    const mimeTypeData: number[] = []
    this.userProgressData.mime_type.forEach((source: any) => {
      if (barChartMimeTypeLabel.length < 20) {
        barChartMimeTypeLabel.push(source.key)
      }
      if (mimeTypeData.length < 20) {
        mimeTypeData.push(source.doc_count)
      }
    })
    this.barChartMimeTypeData = {
      widgetType: ROOT_WIDGET_CONFIG.graph._type,
      widgetSubType: ROOT_WIDGET_CONFIG.graph.graphGeneral,
      widgetData: {
        graphId: 'mimeTypeChart',
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
        graphFilterType: 'MimeType',
        graphXAxisLabel: '# Users',
        graphYAxisLabel: 'Mime Type',
        graphIsXAxisLabel: true,
        graphIsYAxisLabel: true,
        graphOnClick: true,
        graphData: {
          labels: barChartMimeTypeLabel,
          datasets: [
            {
              label: '',
              backgroundColor: this.chartColors,
              borderWidth: 1,
              data: mimeTypeData,
            },
          ],
        },
      },
    }
    // users by MimeType View BarChart Data
    const barChartMimeTypeViewLabel: string[] = []
    const mimeTypeViewData: number[] = []
    this.userProgressData.mime_type = this.userProgressData.mime_type.sort(
      (a: any, b: any) => (a.total_hits > b.total_hits ? -1 : a.total_hits < b.total_hits ? 1 : 0),
    )
    this.userProgressData.mime_type.forEach((source: any) => {
      if (barChartMimeTypeViewLabel.length < 20) {
        barChartMimeTypeViewLabel.push(source.key)
      }
      if (mimeTypeViewData.length < 20) {
        mimeTypeViewData.push(source.total_hits)
      }
    })
    this.barChartMimeTypeViewData = {
      widgetType: ROOT_WIDGET_CONFIG.graph._type,
      widgetSubType: ROOT_WIDGET_CONFIG.graph.graphGeneral,
      widgetData: {
        graphId: 'mimeTypeViewChart',
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
        graphFilterType: 'MimeType',
        graphXAxisLabel: '# Views',
        graphYAxisLabel: 'Mime Type',
        graphIsXAxisLabel: true,
        graphIsYAxisLabel: true,
        graphOnClick: true,
        graphData: {
          labels: barChartMimeTypeViewLabel,
          datasets: [
            {
              label: '',
              backgroundColor: this.chartColors,
              borderWidth: 1,
              data: mimeTypeViewData,
            },
          ],
        },
      },
    }
  }
  onClose() {
    this.getFilteredCourse(0, this.endDate, this.startDate, this.searchQuery, this.filterArray)
    this.onExpand = false
  }
  onExpandChart(type: string, filterType: string, yAxisType: string) {
    const barChartExpandLabel: string[] = []
    const expandData: number[] = []
    this.userProgressData[type] = this.userProgressData[type].sort(
      (a: any, b: any) => (a.total_hits > b.total_hits ? -1 : a.total_hits < b.total_hits ? 1 : 0),
    )
    this.userProgressData[type].forEach((expand: any) => {
      if (barChartExpandLabel.length <= 100) {
        barChartExpandLabel.push(expand.key)
      }
      if (yAxisType === 'users') {
        if (expandData.length <= 100) {
          expandData.push(expand.doc_count)
        }
      }
      if (yAxisType === 'views') {
        if (expandData.length <= 100) {
          expandData.push(expand.total_hits)
        }
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

  getFilteredCourse(
    index: number,
    endDate: string,
    startDate: string,
    searchQuery: string,
    filterArray: NsAnalytics.IFilterObj[],
  ) {
    this.getUserLearning = true
    let contentType = ''
    if (index === 0 && this.analytics.subTabs.courses) {
      contentType = 'Course'
      this.courseFetchStatus = 'fetching'
    } else if (index === 1 && this.analytics.subTabs.modules) {
      contentType = 'Module'
      this.modulesFetchStatus = 'fetching'
    } else if (index === 1 && !this.analytics.subTabs.modules && this.analytics.subTabs.resources) {
      contentType = 'Resource'
      this.resourceFetchStatus = 'fetching'
    } else if (index === 2 && this.analytics.subTabs.modules && this.analytics.subTabs.resources) {
      contentType = 'Resource'
      this.resourceFetchStatus = 'fetching'
    }
    this.analyticsSrv
      .content(endDate, startDate, contentType, filterArray, searchQuery)
      .subscribe(
        (history: any) => {
          this.userProgressData = history
          this.progressData = []
          if (history.learning_history[0].total_view) {
            this.showViews = true
          }
          if (history.learning_history[0].avg_time) {
            this.showTime = true
          }
          this.myProgress = history.learning_history
          this.othersProgress = history.learning_history_progress_range
          this.myProgress.map((cur: any, i: any) => {
            const others = this.othersProgress[cur.content_id]
            if (others && others.length === 4) {
              const obj: any = {
                screenSizeIsLtMedium: this.screenSizeIsLtMedium,
                name: cur.content_name,
                id: cur.content_id,
                progress: cur.progress,
                source: cur.source_name,
                isExternal: cur.is_external,
                avgTime: cur.avg_time / 60,
                totalViews: cur.total_view,
                completed: cur.num_of_users || 0,
                legend: i === 0 ? true : false,
                contentUrl: cur.is_external
                  ? cur.content_url
                  : `https://${history.domain}/app/toc/${cur.content_id}`,
                data: [
                  {
                    key: '0.0-0.25',
                    y: others['0'].doc_count || 0,
                    color: 'rgb(179, 55, 113)',
                  },
                  {
                    key: '0.25-0.5',
                    y: others['1'].doc_count || 0,
                    color: 'rgb(250, 130, 49)',
                  },
                  {
                    key: '0.5-0.75',
                    y: others['2'].doc_count || 0,
                    color: 'rgb(247, 183, 49)',
                  },
                  {
                    key: '0.75-1.1',
                    y: others['3'].doc_count || 0,
                    color: 'rgb(106, 176, 76)',
                  },
                ],
              }
              this.progressData.push(obj)
            }
          })
          this.chartData()
          setTimeout(
            () => {
              if (contentType === 'Course') {
                this.courseFetchStatus = 'done'
              } else if (contentType === 'Module') {
                this.modulesFetchStatus = 'done'
              } else if (contentType === 'Resource') {
                this.resourceFetchStatus = 'done'
              }
            },
            // tslint:disable-next-line:align
            1000,
          )
          this.loader = setInterval(
            () => {
              this.userFetchStatus = 'done'
            },
            // tslint:disable-next-line:align
            1000,
          )
        },
        () => {
          this.error = true
          this.loader = true
          if (contentType === 'Course') {
            this.courseFetchStatus = 'error'
          } else if (contentType === 'Module') {
            this.modulesFetchStatus = 'error'
          } else if (contentType === 'Resource') {
            this.resourceFetchStatus = 'error'
          }
          this.userFetchStatus = 'error'
        },
      )
  }
  changePage(event: PageEvent, num: number) {
    if (num === 1) {
      this.page.p1 = event.pageIndex * 10
    } else if (num === 2) {
      this.page.p2 = event.pageIndex * 10
    }
  }
  ngOnDestroy() {
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
}
