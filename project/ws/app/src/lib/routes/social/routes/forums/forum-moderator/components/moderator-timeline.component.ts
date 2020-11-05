import { Component, OnInit } from '@angular/core'
import { MatDialog } from '@angular/material'
import { ActivatedRoute } from '@angular/router'
import { Observable } from 'rxjs'
import {
  ConfigurationsService,
  TFetchStatus,
  ValueService,
} from '../../../../../../../../../../../library/ws-widget/utils/src/public-api'
import { SocialForum } from '../../models/SocialForumposts.model'
import { ForumHandlerService } from '../../service/EmitterService/forum-handler.service'
// import { ForumHandlerService } from '../../service/EmitterService/eventemitter.service'
import { ForumService } from '../../service/forum.service'
// import { DialogBoxModeratorComponent } from '../../widgets/Dialog-Box/dialog-box-moderator/dialog-box-moderator.component'

@Component({
  selector: 'ws-app-moderator-timeline',
  templateUrl: './moderator-timeline.component.html',
  styleUrls: ['./moderator-timeline.component.scss'],
})
export class ModeratorTimelineComponent implements OnInit {
  postAccepted = false // to be used for temporary deletion from list
  postRejected = false // to be used for temporary deletion from list
  posttoBeHidden = '' // to be used for temporary deletion from list
  filtersRecFromRoute: string[] = [] // to be used to get raw data from the route
  timelineData: SocialForum.IModeratorTimeline = {
    hits: 0,
    result: [],
    filters: [],
  }
  moderatorTimelineRequest: SocialForum.IModeratorTimelineRequest = {
    pgNo: 0,
    pgSize: 7,
    postKind: [SocialForum.EPostKind.BLOG],
    sessionId: Date.now(),
    type: SocialForum.ETimelineType.MODERATOR_TIMELINE,
    source: {
      id: [],
      name: SocialForum.EDiscussionType.SOCIAL,
    },
  }

  pageNavbar: Partial<SocialForum.INavBackground> = this.configSvc.pageNavBar
  // timelineRequest: SocialForum.ITimelineRequest = {
  //   pgNo: -1,
  //   pgSize: 20,
  //   postKind: [SocialForum.EPostKind.BLOG],
  //   sessionId: Date.now(),
  //   type: SocialForum.ETimelineType.MODERATOR_TIMELINE,
  //   userId: '',
  // }
  timelineFetchStatus: TFetchStatus = 'none'
  postIdUpdate = ''
  postStatus = ''
  isXSmall$: Observable<boolean>
  constructor(
    private activated: ActivatedRoute,
    private _eventEmiter: ForumHandlerService,
    private forumSvc: ForumService,
    private configSvc: ConfigurationsService,
    private valueSvc: ValueService,
    public dialog: MatDialog,
  ) {
    this.isXSmall$ = this.valueSvc.isXSmall$
    // if (this.configSvc.userProfile) {
    //   this.moderatorTimelineRequest.userId = this.configSvc.userProfile.userId || ''
    // }
    // console.log('Moderator timeline postcomop loaded')
    this._eventEmiter.sendFilterStatus(false)
    this._eventEmiter.sendStatusOfPredefinedFilter(false)
  }

  ngOnInit() {
    // console.log('THE MODERATOR INIT IS RUNNING')
    this._eventEmiter.setActiveComponent('ModeratorTimelineComponent')
    // this.moderatorTimelineRequest.pgNo = 0
    // filterstarts
    if (
      this._eventEmiter.componentActive.subscribe(data => {
        if (data === 'ModeratorTimelineComponent') {
          this.activated.queryParamMap.subscribe((queryMap: any) => {
            if (queryMap.has('f')) {
              this.moderatorTimelineRequest.source.id = []
              this.filtersRecFromRoute = []
              const filters = JSON.parse(queryMap.get('f') || '{}')
              //  console.log('The filters in Moderator isvvvvvvvvvvvvvvvvvvvvv' + JSON.stringify(filters.Forum))

              // console.log('THE FINAL FILTERS ARE' + this.filtersRecFromRoute)
              // let trial = JSON.parse(queryMap.get('threadContributors') || '{}')
              // console.log("The TRIAL VALUE IS" + JSON.stringify(trial))
              if (filters.Forum) {
                filters.Forum.forEach((element: any) => {
                  // console.log('THE VALUE IS' + element)
                  if (!this.moderatorTimelineRequest.source.id.includes(element)) {
                    this.moderatorTimelineRequest.source.id.push(element)
                  }
                  if (!this.filtersRecFromRoute.includes(element)) {
                    this.filtersRecFromRoute.push(element)
                  }
                })
              }

              // this.moderatorTimelineRequest.source.id = [...this.moderatorTimelineRequest.source.id, ...filters.Forum]
              // console.log('**---------------------**-*-*-')
              //  console.log('THE FINAL FILTER INJ MODERATOR REQUEST' + JSON.stringify(this.moderatorTimelineRequest.source))

              // console.log("The filters in recent forum in search request is" + JSON.stringify(this.searchRequest.filters))
            } else {
              this.moderatorTimelineRequest.source.id = []
            }

            // this.moderatorTimelineRequest.source.id = [...this.moderatorTimelineRequest.source.id, ...filters.Forum]
            // console.log('**---------------------**-*-*-')
            //  console.log('THE FINAL FILTER INJ MODERATOR REQUEST' + JSON.stringify(this.moderatorTimelineRequest.source))

            // console.log("The filters in recent forum in search request is" + JSON.stringify(this.searchRequest.filters))

            this.timelineFetchStatus = 'fetching'
            this.fetchTimelineData('FirstCall')
            //  this.fetchTimelineData()
          })
        }
      })) {

      // filter ends

      // this.fetchTimelineData()
    }
  }
  // acceptUpdate(postIdAccepeted: string) {
  //   //console.log("The acceptUpdate function is called")
  //   //console.log("The accepted post is" + postIdAccepeted)

  // }
  // rejectUpdate(postIdAccepeted: string) {
  //   //console.log("The rejectUpdate function is called")
  //   //console.log("The rejected post is" + postIdAccepeted)

  // }
  updateFromChild(receivedArray: string[]) {
    this.postIdUpdate = receivedArray[0]
    this.postStatus = receivedArray[1]
    if (this.postIdUpdate !== '' && this.postStatus === 'Successfully Accepted') {
      this.postAccepted = true

      // console.log("The post has beeen accepted and UPDATEFROM CHILD")
      this.timelineData.result.forEach(post => {
        if (post.id === this.postIdUpdate) {
          post.hidden = true
        }
        // else {
        //   post.hidden = false
        // }
      })
    } else if (this.postIdUpdate !== '' && this.postStatus === 'Successfully Rejected') {
      // console.log("REACGHED THE REJECT IF CONDITION")
      // console.log("The post id TO BE REJECTED UIS" + this.postIdUpdate)
      // console.log("The command received TO BE REJECTED IS " + this.postStatus)
      this.postRejected = true
      // this._eventEmiter.reason_of_rejection.subscribe(data => this.filtersResponse = data

      // console.log("The post has beeen Rejected and UPDATEFROM CHILD")
      this.timelineData.result.forEach(post => {
        if (post.id === this.postIdUpdate) {
          post.hidden = true
        }
        // else {
        //   post.hidden = false
        // }
      })
    }
  }
  // openDialog() {
  //   this.dialog.open(DialogBoxModeratorComponent)

  // }
  fetchTimelineData(call: string) {
    // console.log('The value of CALL DATA IS' + call)
    if (call === 'FirstCall') {
      this.timelineFetchStatus = 'fetching'
      this.moderatorTimelineRequest.pgNo = 0
    } else if (call === 'subsequentCall') {
      //   console.log('This is a subsequent call')
      this.timelineFetchStatus = 'fetching'
      this.moderatorTimelineRequest.pgNo += 1
    }
    if (this.timelineFetchStatus === 'done') {
      return
    }

    // console.log('In the moderator time line the page no is' + this.moderatorTimelineRequest.pgNo)

    // console.log('THE FILTERS00000000000000000000  is' + this.filtersRecFromRoute)

    // this.moderatorTimelineRequest.source.id = ["fce535c0-642c-11ea-b61d-2966651fe75e"]
    //   console.log('In the moderator timeline, the request sent, the page no is ' + this.moderatorTimelineRequest.pgNo)
    this.forumSvc.fetchModeratorTimelineData(this.moderatorTimelineRequest).subscribe(
      data => {
        this.timelineData.filters = [...[], ...data.filters]

        this.timelineData.filters.forEach(filterReceived => {
          //     console.log('The filter received is' + JSON.stringify(filterReceived))
          filterReceived.content.forEach(recFilterContent => {
            //  console.log('THE OVERALL REC OBJ IS' + JSON.stringify(recFilterContent.type))
            //  console.log('THe Received Filte Content ;;;;;;;;;;;;;;;' + JSON.stringify(recFilterContent.type))
            if (this.filtersRecFromRoute.includes(recFilterContent.type)) {
              filterReceived.checked = true
              recFilterContent.checked = true
            }
          })
          // this.moderatorTimelineRequest.source.id.forEach(existingFilter => {
          //   console.log("Thye existing FILTER is " + existingFilter)
          //   //if(filterReceived.type)
          //   console.log("THE TYPE OF RECEIVED FILTER IS" + filterReceived.content)
          // })
        })
        if (data.hits && data.result) {
          // console.log('DATA: ', data.filters)

          this.timelineData.hits = data.hits

          this.timelineData.result = [...[], ...data.result]
          // this.timelineData.filters = data.filters
          // console.log('In Moderator timeline THE FILTER RECEIVED IS' + JSON.stringify(this.timelineData.filters))

          this.timelineData.result.forEach(post => {
            if (post.id === this.posttoBeHidden) {
              post.hidden = true
            } else {
              post.hidden = false
            }
          })

          // handling filter starts

          // handling filter ends
          this._eventEmiter.sendMessage(this.timelineData.filters)

          //  console.log('Filters from moderator are' + JSON.stringify(this.timelineData.filters))
          if (data.hits > this.timelineData.result.length) {
            this.timelineFetchStatus = 'hasMore'
          } else {
            this.timelineFetchStatus = 'done'
          }
        } else {
          this.timelineData.result = []
          this._eventEmiter.sendMessage(this.timelineData.filters)
          this.timelineFetchStatus = 'none'
        }
      },
      () => {
        this.timelineFetchStatus = 'error'
      },
    )
  }
}
