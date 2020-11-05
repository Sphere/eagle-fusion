import { Component, OnDestroy, OnInit } from '@angular/core'
import { MatDialog } from '@angular/material'
import { ActivatedRoute } from '@angular/router'
import { Observable, Subscription } from 'rxjs'
import { ConfigurationsService, TFetchStatus, ValueService } from '../../../../../../../../../../../library/ws-widget/utils/src/public-api'
import { SocialForum } from '../../models/SocialForumposts.model'
import { ForumHandlerService } from '../../service/EmitterService/forum-handler.service'
import { ForumService } from '../../service/forum.service'

@Component({
  selector: 'ws-app-recent-forum-post',
  templateUrl: './recent-forum-post.component.html',
  styleUrls: ['./recent-forum-post.component.scss'],
})
export class RecentForumPostComponent implements OnInit, OnDestroy {

  timelineData: SocialForum.ITimeline = {
    hits: 0,
    result: [

    ],
    filters: [],

  }
  searchRequest: {
    filters: { [key: string]: string[] }
  } = {
      filters: {},
    }
  searchRequestObject: SocialForum.ISearchRequest = {
    filters: {},
    postKind: [],
    pgNo: -1,
    pgSize: 10,
    type: SocialForum.ETimelineType.ALL,

  }

  pageNavbar: Partial<SocialForum.INavBackground> = this.configSvc.pageNavBar
  timelineRequest: SocialForum.ITimelineRequest = {
    pgNo: -1,
    pgSize: 10,
    postKind: [SocialForum.EPostKind.FORUM],
    sessionId: Date.now(),
    type: SocialForum.ETimelineType.ALL,
    userId: '',
    filters: {},
  }

  timelineFetchStatus: TFetchStatus = 'none'
  sub: Subscription = new Subscription
  isXSmall$: Observable<boolean>
  constructor(

    private activated: ActivatedRoute,
    private _eventEmiter: ForumHandlerService,
    private forumSvc: ForumService,
    private configSvc: ConfigurationsService, private valueSvc: ValueService,
    public dialog: MatDialog,
  ) {
    this.isXSmall$ = this.valueSvc.isXSmall$
    if (this.configSvc.userProfile) {
      this.timelineRequest.userId = this.configSvc.userProfile.userId || ''
    }
    // console.log('Recent forum postcomop loaded')
    this._eventEmiter.sendFilterStatus(true)
    this._eventEmiter.sendStatusOfPredefinedFilter(false)
  }

  ngOnInit() {

    // data to be sent through service.ts
    this._eventEmiter.setActiveComponent('RecentForumPostComponent')
    // Filters
    this.activated.queryParamMap.subscribe(queryMap => {
      if (queryMap.has('f')) {
        const filters = JSON.parse(queryMap.get('f') || '{}')
        // console.log("The filters in recent forum is" + filters)
        this.searchRequest.filters = filters
        // console.log("The filters in recent forum in search request is" + JSON.stringify(this.searchRequest.filters))
        this.timelineRequest.filters = this.searchRequest.filters

      } else {
        this.timelineRequest.filters = {}
      }
      this.timelineFetchStatus = 'fetching'
      this.fetchTimelineData('firstCall')
    })

  }
  ngOnDestroy() {
    this.sub.unsubscribe()
  }
  fetchTimelineData(type: String) {
    if (type === 'firstCall') {
      this.timelineRequest.pgNo = 0
    } else {
      (this.timelineRequest.pgNo as number) += 1
    }
    if (this.timelineFetchStatus === 'done') {
      return
    }

    this.timelineFetchStatus = 'fetching'
    // console.log("The data received when the object is" + callStatus)

    // (this.timelineRequest.pgNo as number) += 1
    //  this.timelineRequest.pgNo = 0
    this.forumSvc.fetchTimelineData(this.timelineRequest).subscribe(
      data => {
        if (data.hits && data.result) {
          // console.log('DATA: ', data)
          // trial to make view more work properly

          // console.log("The page number is set to " + this.timelineRequest.pgNo)
          //  this.timelineData.result = [...this.timelineData.result, ...data.result]
          this.timelineData.result = data.result
          // Trial ends here
          this.timelineData.hits = data.hits

          this.timelineData.filters = [...[], ...data.filters]
          // console.log("filters are" + JSON.stringify(this.timelineData.filters))
          // console.log("The filters that are checked in recent forum in search request is" + JSON.stringify(this.searchRequest.filters))
          // check if the filter is checked

          // second attempt
          this.timelineData.filters.forEach(receivedFilter => {
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
                  // console.log("The sub tags are" + JSON.stringify(subtag))
                  // console.log("The value of temp is" + temp.toString())
                  temp.forEach(tempElement => {
                    if (subtag.type === tempElement.toString()) {
                      subtag.checked = true

                    }
                  })

                })
              }

            })

          })

          // checking filter ends
          // console.log("The filters sentb finally are" + JSON.stringify(this.timelineData.filters))
          this._eventEmiter.sendMessage(this.timelineData.filters)
          // console.log("results are" + this.timelineData.result)
          // console.log("the tuimeline data length is" + this.timelineData.result.length)
          // console.log("The data hits are" + data.hits)
          if (data.hits > this.timelineData.result.length) {
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

}
