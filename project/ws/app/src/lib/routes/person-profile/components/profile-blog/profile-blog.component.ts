import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core'
import { NsDiscussionForum } from '@ws-widget/collection'
import { TFetchStatus, ConfigurationsService, ValueService } from '@ws-widget/utils'
import { Subscription } from 'rxjs'
import { PersonProfileService } from '../../services/person-profile.service'
@Component({
  selector: 'ws-app-profile-blog',
  templateUrl: './profile-blog.component.html',
  styleUrls: ['./profile-blog.component.scss'],
})
export class ProfileBlogComponent implements OnInit {

  @Input() wid = ''
  @Output() count = new EventEmitter<number>()
  @Output() fetching = new EventEmitter<Boolean>()

  blogSubscription: Subscription | null = null
  requestBody!: NsDiscussionForum.ITimelineRequest
  blogResult: NsDiscussionForum.ITimeline = {
    hits: 0,
    result: [],
  }
  blogDisplay: NsDiscussionForum.ITimelineResult[] = []
  blogFetchStatus: TFetchStatus = 'none'
  blogfetch: NsDiscussionForum.ITimelineResult[] = []
  showSocialLike = false

  // paginator
  nextBlogDisable = false
  previousBlogDisable = false
  pageDisplaySize = 3
  lastIndexBlogArray = this.pageDisplaySize
  startIndexBlogArray = 0
  smallScreenSize = 2
  largeScreenSize = 3
  isisXSmallSubscription: Subscription | null = null

  constructor(
    private personprofileSvc: PersonProfileService,
    private configSvc: ConfigurationsService,
    private valueSvc: ValueService,
  ) { }

  ngOnInit() {
    this.isisXSmallSubscription = this.valueSvc.isXSmall$.subscribe(isXSmall => {
      if (isXSmall) {
        this.pageDisplaySize = this.smallScreenSize
      } else {
        this.pageDisplaySize = this.largeScreenSize
      }
      this.lastIndexBlogArray = this.pageDisplaySize
      this.startIndexBlogArray = 0
      this.lastIndexBlogArray = this.pageDisplaySize
      this.startIndexBlogArray = 0
    })
    this.showSocialLike = (this.configSvc.restrictedFeatures && !this.configSvc.restrictedFeatures.has('socialLike')) || false
    if (this.configSvc.userProfile && this.configSvc.userProfile.userId) {
      this.requestBody = {
        pgNo: 0,
        pgSize: 24,
        postKind: [NsDiscussionForum.EPostKind.BLOG],
        sessionId: Date.now(),
        type: NsDiscussionForum.ETimelineType.MY_TIMELINE,
        userId: this.wid,
      }
      if (this.wid) {
        this.fetchTimelineDataProfile(this.requestBody)
      }

    }
  }
  blogSorting(result: NsDiscussionForum.ITimelineResult[]) {
    this.blogfetch = result.filter(obj => obj.postCreator.postCreatorId === this.wid)
    if (this.blogfetch.length > this.pageDisplaySize) {
      this.blogDisplay = this.blogfetch.slice(this.startIndexBlogArray, this.lastIndexBlogArray)
      this.previousBlogDisable = true

    } else {
      this.blogDisplay = this.blogfetch
    }
  }
  fetchTimelineDataProfile(_reqBody: NsDiscussionForum.ITimelineRequest) {
    this.blogFetchStatus = 'fetching'
    this.blogSubscription = this.personprofileSvc.fetchTimelineDataProfile(this.wid, this.requestBody).subscribe(
      data => {
        if (data.hits && data.result) {
          this.blogResult.hits = data.hits
          this.blogResult.result = [...this.blogResult.result, ...data.result]
          this.blogSorting(this.blogResult.result)
          if (data.hits > this.blogResult.result.length) {
            this.blogFetchStatus = 'hasMore'
            this.fetching.emit(true)
          } else {
            this.blogFetchStatus = 'done'
            this.fetching.emit(true)

          }
        } else {
          this.blogFetchStatus = 'none'
          this.fetching.emit(true)
        }
        this.count.emit(this.blogfetch.length)
      },
      _err => {
        this.blogFetchStatus = 'error'
        this.fetching.emit(true)

      }
    )
  }

  fetchNextBlog() {
    if (this.previousBlogDisable) {
      this.previousBlogDisable = false
    }
    this.blogDisplay = []
    this.startIndexBlogArray += this.pageDisplaySize
    this.lastIndexBlogArray += this.pageDisplaySize
    if (this.lastIndexBlogArray >= this.blogfetch.length) {
      this.nextBlogDisable = true

    }
    this.blogDisplay = this.blogfetch.slice(this.startIndexBlogArray, this.lastIndexBlogArray)
  }

  fetchPreviousBlog() {
    if (this.nextBlogDisable) {
      this.nextBlogDisable = false
    }

    this.blogDisplay = []
    this.startIndexBlogArray -= this.pageDisplaySize
    this.lastIndexBlogArray -= this.pageDisplaySize
    if (this.startIndexBlogArray <= 0) {
      this.startIndexBlogArray = 0
      this.previousBlogDisable = true
    }
    this.blogDisplay = this.blogfetch.slice(this.startIndexBlogArray, this.lastIndexBlogArray)
  }
}
