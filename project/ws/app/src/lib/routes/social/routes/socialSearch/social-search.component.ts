import { Component, OnInit } from '@angular/core'
import { NsPage, ConfigurationsService, ValueService, TFetchStatus } from '../../../../../../../../../library/ws-widget/utils/src/public-api'
import { Subscription, Observable } from 'rxjs'
import { map } from 'rxjs/operators'

import { ActivatedRoute } from '@angular/router'

import { SocialForum } from '../forums/models/SocialForumposts.model'
import { ForumHandlerService } from '../forums/service/EmitterService/forum-handler.service'
import { SocialSearchService } from './api/social-search.service'

@Component({
  selector: 'ws-app-social-search',
  templateUrl: './social-search.component.html',
  styleUrls: ['./social-search.component.scss'],
})
export class SocialSearchComponent implements OnInit {

  // borrowed code eneds
  constructor(
    private _eventEmiter: ForumHandlerService,
    private configSvc: ConfigurationsService,
    private valueSvc: ValueService,
    private activated: ActivatedRoute,

    private socialServ: SocialSearchService,

  ) {
    this.isXSmall$ = this.valueSvc.isXSmall$
  }
  opened = true
  searchResult: SocialForum.ISocialSearchTimeline = {
    total: 0,
    result: []

    ,
    filters: [],

  }

  filtersResponse: SocialForum.IFilterUnitResponse[] = []
  searchRequest: {
    filters: { [key: string]: any[] }
  } = {
      filters: {},
    }
  socialSearchReq: SocialForum.ISocialSearchRequest =
    {

      query: 'all',												// The search text
      pageNo: 0,
      pageSize: 10,
      postKind: SocialForum.EPostKind.BLOG,										// The postKind on which search to be done, Possible Values: Query, Blog, Forum
      sessionId: Date.now(),
      filters: {},
    }
  timelineFetchStatus: TFetchStatus = 'none'
  queryEntered: String = 'all'
  favoriteSeason = 'Published'
  seasons: string[] = ['In Review', 'Published', 'Rejected', 'Drafts']
  // borrowed code from forum-hime starts
  screenSizeIsLtMedium = false
  showText = true
  showFilter = true
  navbarMode = false
  filterEnabled = true
  pageNavbar: Partial<NsPage.INavBackground> = this.configSvc.pageNavBar
  defaultSideNavBarOpenedSubscription: Subscription | null = null
  isLtMedium$ = this.valueSvc.isLtMedium$
  sideNavBarOpened = true
  isXSmall$: Observable<boolean>
  mode$ = this.isLtMedium$.pipe(
    map((isMedium: boolean) => (isMedium ? 'over' : 'side')),
  )

  panelOpenState = true
  defaultColorTab = true

  predefinedFiltersExist = false
  predefinedAdminFiltersExist = false

  // borrowed code ends

  // borrowed from search input
  // queryControl = new FormControl(this.activated.snapshot.queryParams.q || 'all')
  placeHolder: String = 'Enter your search here'

  setDataStr() {

    this._eventEmiter.dataStr.subscribe(data => this.filtersResponse = data
    )
    // console.log('the filter data is' + this.filtersResponse)
  }
  truncateHTML(text: string): string {

    const charlimit = 160
    if (!text || text.length <= charlimit) {
      return text
    }

    const withouthtml = text.replace(/<(?:.|\n)*?>/gm, '')
    const shortened = `${withouthtml.substring(0, charlimit)} ,'...'`
    return shortened
  }
  getSearchResults(type: String) {
    if (type === 'firstCall') {
      this.socialSearchReq.pageNo = 0
    } else {
      (this.socialSearchReq.pageNo as number) += 1
    }
    // if (this.timelineFetchStatus === 'done') {
    //   return
    // }
    this.socialSearchReq.query = this.queryEntered
    this.timelineFetchStatus = 'fetching'
    // console.log('The data received when the object is' + type)

    // (this.timelineRequest.pgNo as number) += 1
    //  this.timelineRequest.pgNo = 0
    this.socialServ.fetchSearchTimelineData(this.socialSearchReq).subscribe(
      data => {
        if (data.result) {
          //  console.log('DATA: ')
          // trial to make view more work properly

          // console.log("The page number is set to " + this.timelineRequest.pgNo)
          //  this.timelineData.result = [...this.timelineData.result, ...data.result]
          this.searchResult.result = data.result
          // Trial ends here
          this.searchResult.total = data.total

          this.searchResult.filters = [...[], ...data.filters]
          //       console.log("filters are" + JSON.stringify(this.searchResult.filters))
          //      console.log("Search result is are" + JSON.stringify(this.searchResult.result))
          // console.log("The filters that are checked in recent forum in search request is" + JSON.stringify(this.searchRequest.filters))
          // check if the filter is checked

          // second attempt
          this.searchResult.filters.forEach(receivedFilter => {
            // console.log("Tag name from timelinedata 2nd attempt is" + JSON.stringify(receivedFilter.displayName))
            Object.keys(this.searchRequest.filters).forEach(appliedfiltertype => {
              // console.log("The matched data type is " + appliedfiltertype)
              if (receivedFilter.type === appliedfiltertype) {
                // console.log("The matched data type is " + appliedfiltertype)
                // console.log("The corresponding key value is" + this.searchRequest.filters[appliedfiltertype])
                const temp = this.searchRequest.filters[appliedfiltertype]
                // console.log("The filter to be operated is" + JSON.stringify(receivedFilter))
                receivedFilter.checked = true
                receivedFilter.content.forEach(subtag => {
                  //     console.log("The sub tags are" + JSON.stringify(subtag))
                  //  console.log("The value of temp is" + subtag.toString())
                  temp.forEach(tempElement => {
                    //  console.log("The value of temp is" + JSON.stringify(tempElement))
                    if (subtag.type === tempElement.toString() || subtag.type === tempElement.type) {
                      subtag.checked = true

                    }
                  })

                })
              }

            })

          })

          // checking filter ends
          //  console.log("The filters sentb finally are" + JSON.stringify(this.searchResult.filters))
          //  this.filtersResponse= this.socialSearchReq
          //    this.setDataStr()
          this._eventEmiter.sendMessage(this.searchResult.filters)
          // console.log("results are" + this.timelineData.result)
          // console.log("the tuimeline data length is" + this.timelineData.result.length)
          // console.log("The data hits are" + data.hits)
          if (data.total > this.searchResult.result.length) {

            this.timelineFetchStatus = 'hasMore'
          } else {
            this.timelineFetchStatus = 'done'
          }
        } else {
          this.timelineFetchStatus = 'none'
        }
      },
      () => {
        this.timelineFetchStatus = 'error'
      },
    )
  }
  closeFilter(value: boolean) {
    this.showFilter = value
    this.sideNavBarOpened = value

  }
  ngOnInit() {
    this.defaultSideNavBarOpenedSubscription = this.isLtMedium$.subscribe(
      (isLtMedium: boolean) => {
        this.screenSizeIsLtMedium = isLtMedium
      },
    )
    if (this.screenSizeIsLtMedium) {
      this.sideNavBarOpened = false
      this.showFilter = false
    }

    this.activated.queryParamMap.subscribe(queryMap => {
      if (queryMap.has('search')) {
        const queryReceived = queryMap.get('search')
        if (queryReceived !== '' || queryReceived !== null) {
          this.queryEntered = queryReceived || 'all'
          // console.log("Query Received is ACCEPTED" + this.queryEntered)
        }
      }
      if (queryMap.has('f')) {
        const filters = JSON.parse(queryMap.get('f') || '{}')
        // console.log('The filters in recent forum is' + JSON.stringify(filters))
        this.searchRequest.filters = filters
        // console.log("The filters in recent forum in search request is" + JSON.stringify(this.searchRequest.filters))
        this.socialSearchReq.filters = this.searchRequest.filters

      } else {
        this.socialSearchReq.filters = {}
      }
      this.timelineFetchStatus = 'fetching'
      this.getSearchResults('firstCall')
    })
    this.setDataStr()
  }

}
