import { Component, OnInit } from '@angular/core'
import { Observable } from 'rxjs'
import { ConfigurationsService, TFetchStatus, ValueService } from '../../../../../../../../../../../library/ws-widget/utils/src/public-api'
import { SocialForum } from '../../models/SocialForumposts.model'
import { ForumHandlerService } from '../../service/EmitterService/forum-handler.service'
import { ForumService } from '../../service/forum.service'

@Component({
  selector: 'ws-app-admin-timeline',
  templateUrl: './admin-timeline.component.html',
  styleUrls: ['./admin-timeline.component.scss'],
})
export class AdminTimelineComponent implements OnInit {
  adminFlaggedTimelineReq: SocialForum.IAdminTimelineRequest = {
    pgNo: -1,
    pgSize: 20,
    postKind: [],
    sessionId: Date.now(),
    type: SocialForum.ETimelineType.ADMIN_TIMELINE,

  }
  adminDeletedTimelineReq: SocialForum.IAdminTimelineRequest = {
    pgNo: -1,
    pgSize: 20,
    postKind: [],
    sessionId: Date.now(),
    type: SocialForum.ETimelineType.ADMIN_DELETED_TIMELINE,

  }
  adminTimelineFlaggedResponse: SocialForum.IAdminTimeline = {
    hits: 0,
    result: [],
  }

  adminTimelineDeletedResponse: SocialForum.IAdminTimeline = {
    hits: 0,
    result: [],
  }

  pageNavbar: Partial<SocialForum.INavBackground> = this.configSvc.pageNavBar
  timelineFetchStatus: TFetchStatus = 'none'
  postIdUpdate = ''
  postStatus = ''
  isXSmall$: Observable<boolean>
  activeTab: 'FLaggedTab' | 'DeletedTab' = 'FLaggedTab'
  postIdToBeRemoved = ''
  constructor(
    private _eventEmiter: ForumHandlerService, private forumSvc: ForumService,
    private configSvc: ConfigurationsService, private valueSvc: ValueService) {
    this.isXSmall$ = this.valueSvc.isXSmall$
    // if (this.configSvc.userProfile) {
    //   this.moderatorTimelineRequest.userId = this.configSvc.userProfile.userId || ''
    // }
    // console.log('Moderator timeline postcomop loaded')
    this._eventEmiter.sendFilterStatus(false)
    this._eventEmiter.sendStatusOfPredefinedFilter(false)
  }

  ngOnInit() {
    this._eventEmiter.setActiveComponent('AdminTimelineComponent')
    // this.activeTab = "FLaggedTab"
    this.timelineFetchStatus = 'fetching'
    this._eventEmiter.predefinedAdminFilterSelected.subscribe(data => {
      this.adminFlaggedTimelineReq.pgNo = -1
      this.adminDeletedTimelineReq.pgNo = -1
      this.timelineFetchStatus = 'fetching'
      this.adminFlaggedTimelineReq.postKind = [SocialForum.EPostKind.FORUM]
      //  console.log('====*/*/*/*ADMIN TS/*/*/*//*/*/==')
      // console.log('The data revcd from service class is' + data)
      if (data !== this.adminFlaggedTimelineReq.postKind) {
        this.adminFlaggedTimelineReq.postKind = [...[], ...data]
      }
      if (data !== this.adminDeletedTimelineReq.postKind) {
        this.adminDeletedTimelineReq.postKind = [...[], ...data]
      }
      //  console.log('The value of req postkind is' + this.AdminFlaggedTimelineReq.postKind)
      if (this.activeTab === 'FLaggedTab') {
        this.fetchTimelineData()
      } else {
        this.getAdminDeletedPosts()
      }

    })
    this.adminFlaggedTimelineReq.pgNo = -1
    this.adminDeletedTimelineReq.pgNo = -1

    // this.AdminDeletedTimelineReq.postKind = [SocialForum.EPostKind.FORUM]
    if (this.activeTab === 'FLaggedTab') {
      this.fetchTimelineData()
    } else if (this.activeTab === 'DeletedTab') {
      this.getAdminDeletedPosts()
    }
  }
  tabClick(tab: any) {
    if (tab.index === 1) {
      this.activeTab = 'DeletedTab'

      // this.getAdminDeletedPosts()
    } else {
      this.activeTab = 'FLaggedTab'
      // this.fetchTimelineData()
    }
    this.ngOnInit()
  }
  getAdminDeletedPosts() {
    //   console.log('The deleted posts are successfully called')
    if (this.timelineFetchStatus === 'done') {
      return
    }
    this.timelineFetchStatus = 'fetching'
    this.adminDeletedTimelineReq.pgNo += 1

    // console.log('THE FILTERS00000000000000000000  is' + this.filtersRecFromRoute)

    // this.moderatorTimelineRequest.source.id = ["fce535c0-642c-11ea-b61d-2966651fe75e"]
    this.forumSvc.fetchAdminTimelineData(this.adminDeletedTimelineReq).subscribe(
      data => {
        // this.timelineData.filters = [...[], ...data.filters]

        if (data.hits && data.result) {
          // console.log('DATA: ', data.filters)

          this.adminTimelineDeletedResponse.hits = data.hits

          this.adminTimelineDeletedResponse.result = [...[], ...data.result]
          // this.timelineData.filters = data.filters
          // console.log('In Moderator timeline THE FILTER RECEIVED IS' + JSON.stringify(this.timelineData.filters))

          // this.AdminTimelineFlaggedResponse.result.forEach(post => {
          //   if (post.id === this.posttoBeHidden) {
          //     post.hidden = true
          //   } else {
          //     post.hidden = false
          //   }
          // })

          // handling filter starts

          // handling filter ends
          //   this._eventEmiter.sendMessage(this.timelineData.filters)

          //  console.log('Filters from moderator are' + JSON.stringify(this.timelineData.filters))
          if (data.hits > this.adminTimelineDeletedResponse.result.length) {
            this.timelineFetchStatus = 'hasMore'
          } else {
            this.timelineFetchStatus = 'done'
          }
        } else {

          this.adminTimelineDeletedResponse.result = []
          //    this._eventEmiter.sendMessage(this.timelineData.filters)
          this.timelineFetchStatus = 'none'
        }
      },
      () => {
        this.timelineFetchStatus = 'error'
      },
    )
  }
  receiveMessage($event: string) {
    this.postIdToBeRemoved = $event
    //   console.log('The POst received from child tio be removed is' + this.postIdToBeRemoved)
    this.adminTimelineFlaggedResponse.result.forEach(post => {
      if (post.id === this.postIdToBeRemoved) {
        post.hidden = true
      }
    })
  }

  updateDletedPost(event: string) {
    this.adminTimelineDeletedResponse.result.forEach(post => {
      if (post.id === event) {
        post.hidden = true
      }
    })
  }
  fetchTimelineData() {
    //  console.log('The FETCH TIMELINE IS CALLED')
    if (this.timelineFetchStatus === 'done') {
      return
    }
    this.timelineFetchStatus = 'fetching'
    this.adminFlaggedTimelineReq.pgNo += 1

    // console.log('THE FILTERS00000000000000000000  is' + this.filtersRecFromRoute)

    // this.moderatorTimelineRequest.source.id = ["fce535c0-642c-11ea-b61d-2966651fe75e"]
    this.forumSvc.fetchAdminTimelineData(this.adminFlaggedTimelineReq).subscribe(
      data => {
        // this.timelineData.filters = [...[], ...data.filters]

        if (data.hits && data.result) {
          // console.log('DATA: ', data.filters)

          this.adminTimelineFlaggedResponse.hits = data.hits

          this.adminTimelineFlaggedResponse.result = [...[], ...data.result]
          // this.timelineData.filters = data.filters
          // console.log('In Moderator timeline THE FILTER RECEIVED IS' + JSON.stringify(this.timelineData.filters))

          // this.AdminTimelineFlaggedResponse.result.forEach(post => {
          //   if (post.id === this.posttoBeHidden) {
          //     post.hidden = true
          //   } else {
          //     post.hidden = false
          //   }
          // })

          // handling filter starts

          // handling filter ends
          //   this._eventEmiter.sendMessage(this.timelineData.filters)

          //  console.log('Filters from moderator are' + JSON.stringify(this.timelineData.filters))
          if (data.hits > this.adminTimelineFlaggedResponse.result.length) {
            this.timelineFetchStatus = 'hasMore'
          } else {
            this.timelineFetchStatus = 'done'
          }
        } else {

          this.adminTimelineFlaggedResponse.result = []
          //    this._eventEmiter.sendMessage(this.timelineData.filters)
          this.timelineFetchStatus = 'none'
        }
      },
      () => {
        this.timelineFetchStatus = 'error'
      },
    )
  }
}
