import { Component, OnInit, Input, SimpleChanges, OnChanges } from '@angular/core'
import { ConfigurationsService } from '@ws-widget/utils/src/public-api'
import { IFollowerId } from '../../person-profile.model'

@Component({
  selector: 'ws-app-user-details',
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.scss'],
})
export class UserDetailsComponent implements OnInit, OnChanges {
  @Input() wid = ''
  @Input() name = ''
  @Input() followersCount = ''
  @Input() followingCount = ''
  @Input() followers: IFollowerId[] = []
  @Input() following: IFollowerId[] = []
  @Input() enabledFeatures: string[] = []

  isViewmore = true

  knowledgeBoardEnabled = true
  playlistEnabled = true
  goalsEnabled = true
  interestEnabled = true
  isBlogsEnabled = true
  isQnaEnabled = true
  isQnaContentPresent = true
  isBlogContentPresent = true
  kbFetchingDone = false
  playlistsFetchingDone = false
  authoredFetching = false
  reviewedFetching = false
  authoredEnabled = true
  reviwedEnabled = true
  blogFetching = false
  isInitialized = false
  isQnaFetching = false
  isReviewEnabled = true
  isAuthorEnabled = true

  constructor(
    private configSvc: ConfigurationsService
    // private personprofileSvc: PersonProfileService
  ) { }

  ngOnChanges(changes: SimpleChanges) {
    if ((this.isInitialized)) {
      if (changes.wid) {
        if ((changes.wid.currentValue !== changes.wid.previousValue)) {
          this.wid = changes.wid.currentValue
          this.checkingDetails()
        }
      }
    }
  }

  ngOnInit() {
    this.isInitialized = true
    this.checkingDetails()
    // this.isBlogsEnabled = (this.configSvc.restrictedFeatures && this.configSvc.restrictedFeatures.has('social')) || false
  }

  checkingDetails() {
    this.kbFetchingDone = false
    this.playlistsFetchingDone = false

    if (this.configSvc.restrictedFeatures) {
      if (this.configSvc.restrictedFeatures.has('knowledgeBoard')) {
        this.knowledgeBoardEnabled = false
      }
      if (this.configSvc.restrictedFeatures.has('playlist')) {
        this.playlistEnabled = false
      }
      if (this.configSvc.restrictedFeatures.has('goals')) {
        this.goalsEnabled = false
      }
      if (this.configSvc.restrictedFeatures.has('blogs')) {
        this.isBlogsEnabled = false
      }
      if (this.configSvc.restrictedFeatures.has('qna')) {
        this.isQnaEnabled = false
      }
      if (this.configSvc.restrictedFeatures.has('review')) {
        this.isReviewEnabled = false
      }
      if (this.configSvc.restrictedFeatures.has('create')) {
        this.isAuthorEnabled = false
      }
    }
  }

  fetchingKbDone(event: Boolean) {
    if (event) {
      this.kbFetchingDone = true
    }
  }

  fetchingPlaylistDone(event: Boolean) {
    if (event) {
      this.playlistsFetchingDone = true
    }
  }

  fetchingContentAuthored(event: boolean) {
    this.authoredFetching = event
  }

  fetchingContentReviewed(event: boolean) {
    this.reviewedFetching = event
  }
  fetchingQna(event: boolean) {
    this.isQnaFetching = event
  }
  fetchingBlog(event: boolean) {
    this.blogFetching = event
  }

  checkAuthoredEnabled(event: number) {
    if (event === 0) {
      this.authoredEnabled = false

    }
  }
  checkReviewEnabled(event: number) {
    if (event === 0) {
      this.reviwedEnabled = false
    }
  }
  checkBlogEnabled(event: number) {
    if (event === 0) {
      this.isBlogContentPresent = false

    }
  }
  checkQnaEnabled(event: number) {
    if (event === 0) {
      this.isQnaContentPresent = false
    }
  }
}
