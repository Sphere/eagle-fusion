import { Component, OnInit, OnDestroy } from '@angular/core'
import { Event, NavigationEnd, Router, ActivatedRoute, Data } from '@angular/router'
import { Observable, Subscription } from 'rxjs'
import { ConfigurationsService, NsPage, ValueService } from '../../../../../../../../../library/ws-widget/utils/src/public-api'
import { SocialForum } from './models/SocialForumposts.model'
import { ForumHandlerService } from './service/EmitterService/forum-handler.service'
import { map } from 'rxjs/operators'

// import { ActivatedRoute } from '@angular/router'

@Component({
  selector: 'ws-app-forum-home',
  templateUrl: './forum-home.component.html',
  styleUrls: ['./forum-home.component.scss'],
})
export class ForumHomeComponent implements OnInit, OnDestroy {

  // filter code ends here
  constructor(

    private _eventEmiter: ForumHandlerService,
    private configSvc: ConfigurationsService,
    private valueSvc: ValueService,
    private router: Router,
    private route: ActivatedRoute,

  ) {
    this.isXSmall$ = this.valueSvc.isXSmall$

  }

  screenSizeIsLtMedium = false
  showText = true
  showFilter = true
  navbarMode = false
  filterEnabled = false
  forumCreation = false
  pageNavbar: Partial<NsPage.INavBackground> = this.configSvc.pageNavBar
  defaultSideNavBarOpenedSubscription: Subscription | null = null
  isLtMedium$ = this.valueSvc.isLtMedium$
  sideNavBarOpened = true
  isXSmall$: Observable<boolean>
  mode$ = this.isLtMedium$.pipe(
    map((isMedium: boolean) => (isMedium ? 'over' : 'side')),
  )

  panelOpenState = false
  defaultColorTab = true
  opened = true
  predefinedFiltersExist = false
  predefinedAdminFiltersExist = false
  // filter starts here
  searchResults: SocialForum.ISearchV6ApiResult = {
    totalHits: 0,
    result: [],
    filters: [],
    filtersUsed: [],
    notVisibleFilters: [],
  }
  routeComp = ''
  showModerateTab = false

  filtersResetAble = false

  filtersResponse: SocialForum.IFilterUnitResponse[] = []
  searchRequestObject: SocialForum.ISearchRequest = {
    filters: {},
    type: SocialForum.ETimelineType.ALL,
    pgNo: 0,
    pgSize: 10,
    postKind: [SocialForum.EPostKind.BLOG],

  }
  // predefined filter
  favoriteSeason = 'Published'
  seasons: string[] = ['In Review', 'Published', 'Rejected', 'Drafts']
  // Admin filter
  query = false
  forumPosts = true
  blogPosts = false
  adminFilter: SocialForum.EPostKind[] = []
  setDataStr() {

    this._eventEmiter.dataStr.subscribe(data => this.filtersResponse = data
    )
    // console.log('the filter data is' + this.filtersResponse)
  }

  changeAdminQueryFilter() {

    // console.log('The admin query filter function is called and the status of variable is' + this.query)
    if (this.query) {
      if (!this.adminFilter.includes(SocialForum.EPostKind.QUERY)) {
        //    console.log('Query variable absent in list')
        this.adminFilter.push(SocialForum.EPostKind.QUERY)
        //   console.log('The latest admin filter list is' + this.adminFilter)
      }
    } else {

      if (this.adminFilter.includes(SocialForum.EPostKind.QUERY)) {
        //   console.log('Query variable is being removed in list')
        const index = this.adminFilter.indexOf(SocialForum.EPostKind.QUERY)
        if (index > -1) {
          //   console.log('The Query is alraedy present in filter and index is' + index)
          this.adminFilter.splice(index, 1)
          //   console.log('The latest admin filter list is' + this.adminFilter)
        }

      }

    }
    this._eventEmiter.sendPredefinedAdminFilterSelected(this.adminFilter)
    //   console.log('THE ULTIMATE VALUE IN FILTER LIST' + this.adminFilter)

  }
  changeAdminBlogFilter() {

    // console.log('The admin Blog filter function is called and the status of variable is' + this.blogPosts)
    if (this.blogPosts) {
      if (!this.adminFilter.includes(SocialForum.EPostKind.BLOG)) {
        // console.log('Blog variable absent in list')
        this.adminFilter.push(SocialForum.EPostKind.BLOG)
        // console.log('The latest admin filter list is' + this.adminFilter)
      }
    } else {

      if (this.adminFilter.includes(SocialForum.EPostKind.BLOG)) {
        //   console.log('Blog variable is being removed in list')
        const index = this.adminFilter.indexOf(SocialForum.EPostKind.BLOG)
        if (index > -1) {
          //    console.log('The Blog is alraedy present in filter and index is' + index)
          this.adminFilter.splice(index, 1)
          //    console.log('The latest admin filter list is' + this.adminFilter)
        }

      }

    }
    this._eventEmiter.sendPredefinedAdminFilterSelected(this.adminFilter)
    //   console.log('THE ULTIMATE VALUE IN FILTER LIST' + this.adminFilter)
  }
  changeAdminForumFilter() {

    //    console.log('The admin Forum filter function is called and the status of variable is' + this.forumPosts)
    if (!this.adminFilter.includes(SocialForum.EPostKind.FORUM)) {
      //   console.log('Forum variable absent in list')
      this.adminFilter.push((SocialForum.EPostKind.FORUM))
      // console.log('The latest admin filter list is' + this.adminFilter)
      this._eventEmiter.sendPredefinedAdminFilterSelected(this.adminFilter)
    } else {

      if (this.adminFilter.includes(SocialForum.EPostKind.FORUM)) {
        //  console.log('Forum variable is being removed in list')
        const index = this.adminFilter.indexOf((SocialForum.EPostKind.FORUM))
        if (index > -1) {
          //  console.log('The Forum is alraedy present in filter and index is' + index)
          this.adminFilter.splice(index, 1)
          // console.log('The latest admin filter list is' + this.adminFilter)
        }

      }
      this._eventEmiter.sendPredefinedAdminFilterSelected(this.adminFilter)
    }
    //   console.log('THE ULTIMATE VALUE IN FILTER LIST' + this.adminFilter)
    this._eventEmiter.sendPredefinedAdminFilterSelected(this.adminFilter)
  }
  // Admin filter ends
  ngOnInit() {
    this.changeAdminForumFilter()
    this.route.data.subscribe((result: Data) => {
      const data = result.content.data
      if (data && data.result && data.result.length) {
        this.showModerateTab = true
      }
    })

    // this.forumCreation = this.configSvc.restrictedFeatures && !this.configSvc.restrictedFeatures.has('forum_create') || false

    this._eventEmiter.componentActive.subscribe(data => {
      if (data === 'MyforumPostComponent') {
        this.defaultColorTab = false
        this.filtersResponse = []
        this.filterEnabled = true
        this.predefinedFiltersExist = true
        this.predefinedAdminFiltersExist = false
      } else if (data === 'ForumViewComponent') {
        this.defaultColorTab = true
        this.filterEnabled = false
        this.predefinedAdminFiltersExist = false
      } else if (data === 'RecentForumPostComponent') {
        this.defaultColorTab = false
        // this.filterEnabled = false
        this.predefinedAdminFiltersExist = false
        this.predefinedFiltersExist = false
      } else if (data === 'AdminTimelineComponent') {
        this.defaultColorTab = false
        this.filtersResponse = []
        this.filterEnabled = true
        this.predefinedFiltersExist = false
        this.predefinedAdminFiltersExist = true

        if (this.forumPosts) {
          if (!this.adminFilter.includes(SocialForum.EPostKind.FORUM)) {
            this.adminFilter.push(SocialForum.EPostKind.FORUM)
          }
        }

      } else {
        this.defaultColorTab = false
        this.filterEnabled = true
        this.predefinedFiltersExist = false
        this.predefinedAdminFiltersExist = false

      }

    })
    this.router.events.subscribe((e: Event) => {
      if (e instanceof NavigationEnd) {
        // console.log('================')
        // console.log(e.url)
        // console.log("The url in stringf is" + e.url)
        if (e.url.includes('view-forum')) {
          this.filterEnabled = false
          this.predefinedFiltersExist = false
        } else if (e.url.includes('recent-forumpost')) {
          this.filterEnabled = true
          this.predefinedFiltersExist = false
        } else if (e.url.includes('moderator-timeline')) {
          this.filterEnabled = true
          this.predefinedFiltersExist = false
        } else if (e.url.includes('my-forum-post')) {
          this.filterEnabled = true
          this.predefinedFiltersExist = true

          this._eventEmiter.sendStatusOfPredefinedFilter(true)
          // console.log('++++++++++++_________________+++++++++++++++')
          //  this.favoriteSeason = this._eventEmiter.predefinedFilterSelected

          // console.log('The predefined filter selected is' + this._eventEmiter.predefinedFilterSelected)
          this._eventEmiter.sendPredinedFilterSelected(SocialForum.ETimelineType.MY_PUBLISHED)

        }

      }
    })
    this.defaultSideNavBarOpenedSubscription = this.isLtMedium$.subscribe(
      (isLtMedium: boolean) => {
        this.screenSizeIsLtMedium = isLtMedium
      },
    )
    this.setDataStr()
  }

  ngOnDestroy() {
    if (this.defaultSideNavBarOpenedSubscription) {
      this.defaultSideNavBarOpenedSubscription.unsubscribe()
    }
  }

  closeFilter(value: boolean) {
    this.showFilter = value
  }
  emitCurrentPreFilter(selectedeFilter: string) {
    // console.log('shhdhjkshdjkhdjkh')
    if (selectedeFilter === 'In Review') {
      this._eventEmiter.sendPredinedFilterSelected(SocialForum.ETimelineType.MY_IN_REVIEW)
    } else if (selectedeFilter === 'Published') {
      this._eventEmiter.sendPredinedFilterSelected(SocialForum.ETimelineType.MY_PUBLISHED)
    } else if (selectedeFilter === 'Rejected') {
      this._eventEmiter.sendPredinedFilterSelected(SocialForum.ETimelineType.MY_REJECTED)
    } else if (selectedeFilter === 'Drafts') {
      this._eventEmiter.sendPredinedFilterSelected(SocialForum.ETimelineType.MY_DRAFTS)
    }
  }
}
