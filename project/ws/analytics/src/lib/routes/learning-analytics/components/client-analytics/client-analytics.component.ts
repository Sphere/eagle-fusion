import { Component, OnDestroy, OnInit } from '@angular/core'
import { FormBuilder, FormControl, FormGroup } from '@angular/forms'
import { ActivatedRoute, ParamMap, Router } from '@angular/router'
import { GraphGeneralService } from '@ws-widget/collection'
import { ConfigurationsService, NsPage, ValueService, TFetchStatus } from '@ws-widget/utils'
import { Subscription } from 'rxjs'
import { map } from 'rxjs/operators'
import { NsAnalytics } from '../../models/learning-analytics.model'
import { AnalyticsResolver } from '../../resolvers/learning-analytics-filters.resolver'
import { LearningAnalyticsService } from '../../services/learning-analytics.service'

@Component({
  selector: 'ws-analytics-client-analytics',
  templateUrl: './client-analytics.component.html',
  styleUrls: ['./client-analytics.component.scss'],
})
export class ClientAnalyticsComponent implements OnInit, OnDestroy {
  errorMessageCode: 'API_FAILURE' | 'NO_DATA' | 'INVALID_DATA' | 'NONE' = 'NONE'
  sideNavBarOpened = true
  isMarketingFeature = true
  isLtMedium$ = this.valueSvc.isLtMedium$
  pageNavbar: Partial<NsPage.INavBackground> = this.configSvc.pageNavBar
  private defaultSideNavBarOpenedSubscription: Subscription | null = null
  mode$ = this.isLtMedium$.pipe(map(isMedium => (isMedium ? 'over' : 'side')))
  screenSizeIsLtMedium = false
  currentTab = ''
  tabs = ['home', 'content']
  dates = {
    start: '',
    end: '',
    count: 0,
  }
  endDate = ''
  startDate = ''
  searchQuery = ''
  currentTabName = ''
  contentType = 'Course'
  contentData: any
  showFilter = false
  visible = true
  selectable = true
  removable = true
  addOnBlur = true
  showHome = false
  showContent = false
  showReport = false
  title = 'Manager\'s Dashboard'
  fetchStatus: TFetchStatus = 'none'
  filterArray: NsAnalytics.IFilterObj[] = []
  filterData: NsAnalytics.IFilter[] = []
  searchControl = new FormControl()
  analytics = this.route.snapshot.data.pageData.data.analytics.subFeatures.learningAnalytics
  private filterEventSubscription: Subscription | null = null
  private searchEventSubscription: Subscription | null = null
  private defaultSearchSubscription: Subscription | null = null
  paramSubscription: Subscription | null = null
  searchForm: FormGroup
  constructor(
    private route: ActivatedRoute,
    private valueSvc: ValueService,
    private configSvc: ConfigurationsService,
    private resolver: AnalyticsResolver,
    private form: FormBuilder,
    private graphGeneralSvc: GraphGeneralService,
    private router: Router,
    private analyticsSvc: LearningAnalyticsService,
  ) {
    this.searchForm = this.form.group({
      searchControl: [''],
    })
  }
  ngOnInit() {
    this.defaultSideNavBarOpenedSubscription = this.isLtMedium$.subscribe((isLtMedium: boolean) => {
      this.sideNavBarOpened = !isLtMedium
      this.screenSizeIsLtMedium = isLtMedium
    })
    const tabName = this.router.url.split('/')[2]
    this.currentTabName = tabName
    this.paramSubscription = this.route.paramMap.subscribe((params: ParamMap) => {
      let tab = params.get('tab')
      if (tab) {
        if (this.tabs.indexOf(tab) === -1) {
          tab = 'home'
        }
        this.currentTab = tab
      }
    })
    this.filterEventSubscription = this.graphGeneralSvc.filterEventChangeSubject.subscribe((filterEvent: any) => {
      const filter: NsAnalytics.IFilter = {
        filterName: filterEvent.filterName,
        filterType: filterEvent.filterType,
      }
      this.add(filter)
      this.showFilter = true

    })
    this.searchEventSubscription = this.resolver.searchEventChangeSubject.subscribe((searchEvent: any) => {
      const filter: NsAnalytics.IFilter = {
        filterName: searchEvent.searchQuery,
        filterType: 'searchQuery',
      }
      this.add(filter)
      this.showFilter = true
    })
  }
  onPress(event: any) {
    if (event.keyCode === 13) {
      this.search(this.searchControl.value)
    }
  }
  search(search: string) {
    this.resolver.setSearchFilterEvent({ searchQuery: search })
  }

  add(filter: NsAnalytics.IFilter): void {
    if (this.filterData.findIndex(v => v.filterName.toLowerCase() === filter.filterName.toLowerCase()) === -1) {
      this.filterData.push(filter)
    }
  }
  remove(filter: NsAnalytics.IFilter): void {
    if (this.filterData.length === 0) {
      this.showFilter = false
    } else {
      const index = this.filterData.indexOf(filter)
      if (index >= 0) {
        this.filterData.splice(index, 1)
      }
      this.resolver.removeFilterEvent(this.filterData)
    }
  }
  ngOnDestroy() {
    if (this.defaultSideNavBarOpenedSubscription) {
      this.defaultSideNavBarOpenedSubscription.unsubscribe()
    }
    if (this.defaultSearchSubscription) {
      this.defaultSearchSubscription.unsubscribe()
    }
    if (this.filterEventSubscription) {
      this.filterEventSubscription.unsubscribe()
    }

    if (this.searchEventSubscription) {
      this.searchEventSubscription.unsubscribe()
    }
  }

  sideNavOnClick(tab: string) {
    this.currentTabName = tab
    if (this.screenSizeIsLtMedium) {
      this.sideNavBarOpened = !this.sideNavBarOpened
    }
  }

  callFilteredGet(event: string) {
    const date = JSON.parse(event)
    this.dates.start = date.from.replace(/' '/g, '')
    this.dates.end = date.to.replace(/' '/g, '')
    this.dates.count = date.count
    this.endDate = this.dates.end
    this.startDate = this.dates.start
    this.resolver.setDateFilterEvent({ startDate: this.startDate, endDate: this.endDate })
    this.getData(this.endDate, this.startDate, this.contentType, this.searchQuery, this.filterArray)
  }
  getData(endDate: string, startDate: string, contentType: string, searchQuery: string, filterArray: NsAnalytics.IFilterObj[]) {
    this.fetchStatus = 'fetching'
    this.analyticsSvc.timeSpent(endDate, startDate, contentType, filterArray, searchQuery).subscribe(
      (timeSpentData: any) => {
        this.contentData = timeSpentData
        this.fetchStatus = 'done'
      },
      // tslint:disable-next-line:align
      () => {
        this.contentData = null
        this.fetchStatus = 'error'
      },
    )
  }
}
