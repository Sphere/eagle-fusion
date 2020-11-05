import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core'
import { NsDiscussionForum } from '@ws-widget/collection'
import { TFetchStatus, ConfigurationsService } from '@ws-widget/utils'
import { PersonProfileService } from '../../services/person-profile.service'
import { Subscription } from 'rxjs'
@Component({
  selector: 'ws-app-user-qna',
  templateUrl: './user-qna.component.html',
  styleUrls: ['./user-qna.component.scss'],
})
export class UserQnaComponent implements OnInit {
  @Input() wid = ''
  @Output() count = new EventEmitter<number>()
  @Output() fetching = new EventEmitter<Boolean>()

  qnaTimelineRequest!: NsDiscussionForum.ITimelineRequest
  qnaSubscription: Subscription | null = null
  qnaDisplay: NsDiscussionForum.ITimelineResult[] = []
  qnaResult: NsDiscussionForum.ITimeline = {
    hits: 0,
    result: [],
  }
  qnaFetchStatus: TFetchStatus = 'none'
  qnafetch: NsDiscussionForum.ITimelineResult[] = []

  // paginator
  nextQnaDisable = false
  previousQnaDisable = false
  pageDisplaySize = 2
  lastIndexQnaArray = this.pageDisplaySize
  startIndexQnaArray = 0
  showSocialLike = false

  constructor(
    private personprofileSvc: PersonProfileService,
    private configSvc: ConfigurationsService,
  ) { }

  ngOnInit() {
    this.showSocialLike = (this.configSvc.restrictedFeatures && !this.configSvc.restrictedFeatures.has('socialLike')) || false
    if (this.configSvc.userProfile && this.configSvc.userProfile.userId) {
      this.qnaTimelineRequest = {
        pgNo: 0,
        pgSize: 24,
        postKind: [NsDiscussionForum.EPostKind.QUERY],
        sessionId: Date.now(),
        type: NsDiscussionForum.ETimelineType.MY_TIMELINE,
        userId: this.wid,
      }
      this.fetchQnaData(this.qnaTimelineRequest)
    }
    // console.log(this.fetchQnaData)
  }

  qnaSorting(result: NsDiscussionForum.ITimelineResult[]) {
    this.qnafetch = result.filter(obj => obj.postCreator.postCreatorId === this.wid)
    if (this.qnafetch.length > this.pageDisplaySize) {
      this.qnaDisplay = this.qnafetch.slice(this.startIndexQnaArray, this.lastIndexQnaArray)
      this.previousQnaDisable = true

    } else {
      this.qnaDisplay = this.qnafetch
    }
  }
  fetchQnaData(_reqBody: NsDiscussionForum.ITimelineRequest) {
    this.qnaFetchStatus = 'fetching'
    this.qnaSubscription = this.personprofileSvc.fetchTimelineDataProfile(this.wid, this.qnaTimelineRequest).subscribe(
      data => {
        if (data.hits && data.result) {
          this.qnaResult.hits = data.hits
          this.qnaResult.result = [...this.qnaResult.result, ...data.result]
          this.qnaSorting(this.qnaResult.result)
          if (data.hits > this.qnaResult.result.length) {
            this.qnaFetchStatus = 'hasMore'
          } else {
            this.qnaFetchStatus = 'done'
            this.fetching.emit(true)
          }
        } else {
          this.qnaFetchStatus = 'none'
          this.fetching.emit(true)
        }
        this.count.emit(this.qnafetch.length)
      },
      _err => {
        this.qnaFetchStatus = 'error'
        this.fetching.emit(true)
      }
    )
  }

  fetchNextQna() {
    if (this.previousQnaDisable) {
      this.previousQnaDisable = false
    }
    this.qnaDisplay = []
    this.startIndexQnaArray += this.pageDisplaySize
    this.lastIndexQnaArray += this.pageDisplaySize
    if (this.lastIndexQnaArray >= this.qnafetch.length) {
      this.nextQnaDisable = true

    }
    this.qnaDisplay = this.qnafetch.slice(this.startIndexQnaArray, this.lastIndexQnaArray)
  }

  fetchPreviousQna() {
    if (this.nextQnaDisable) {
      this.nextQnaDisable = false
    }

    this.qnaDisplay = []
    this.startIndexQnaArray -= this.pageDisplaySize
    this.lastIndexQnaArray -= this.pageDisplaySize
    if (this.startIndexQnaArray <= 0) {
      this.startIndexQnaArray = 0
      this.previousQnaDisable = true
    }
    this.qnaDisplay = this.qnafetch.slice(this.startIndexQnaArray, this.lastIndexQnaArray)
  }
}
