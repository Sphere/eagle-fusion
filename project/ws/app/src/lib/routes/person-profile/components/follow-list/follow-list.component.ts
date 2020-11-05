import { Component, OnInit, Input, SimpleChanges, OnChanges } from '@angular/core'
import { IFollowers, IFollowerId } from '../../person-profile.model'
import { PersonProfileService } from '../../services/person-profile.service'
import { TFetchStatus, ConfigurationsService } from '../../../../../../../../../library/ws-widget/utils/src/public-api'

@Component({
  selector: 'ws-app-follow-list',
  templateUrl: './follow-list.component.html',
  styleUrls: ['./follow-list.component.scss'],
})
export class FollowListComponent implements OnInit, OnChanges {
  @Input() wid = ''
  @Input() name = ''
  @Input() followers: IFollowerId[] = []
  // followers: IFollowerId[] = []
  // following: IFollowerId[] = []
  followerCurrentDisplay: IFollowerId[] = []
  followingCurrentDisplay: IFollowerId[] = []
  followCount: IFollowers | undefined
  followersFetchStatus: TFetchStatus = 'none'
  followingCount = 0
  followersCount = 0
  pageSize = 0

  // paginator
  nextFollowersDisable = false
  previousFollowersDisable = false
  nextFollowingDisable = false
  previousFollowingDisable = false
  pageDisplaySize = 4
  lastIndexFollowersArray = 4
  startIndexFollowersArray = 0
  lastIndexFollowingArray = 4
  startIndexFollowingArray = 0
  isInitialized = false
  currentUserId = ''

  constructor(
    private personprofileSvc: PersonProfileService,
    public configSvc: ConfigurationsService
  ) {
    this.personprofileSvc.isfollowevent.subscribe((result: Boolean) => {
      if (result) {
        this.fetchFollowerApi()
        this.nextFollowersDisable = false
        this.previousFollowersDisable = false
      }
    })
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.wid) {
      if ((changes.wid.currentValue !== changes.wid.previousValue) && (this.isInitialized)) {
        this.followingCurrentDisplay = []
        this.followerCurrentDisplay = []
        this.wid = changes.wid.currentValue
        this.fetchFollowers()
      }
    }
  }
  ngOnInit() {
    if (this.wid) {
      this.fetchFollowers()
    }
    if (this.configSvc.userProfile && this.configSvc.userProfile.userName) {
      this.currentUserId = this.configSvc.userProfile.userId
    }
    this.isInitialized = true

  }

  fetchFollowers() {
    this.lastIndexFollowersArray = 4
    this.startIndexFollowersArray = 0
    if (this.followers.length > this.pageDisplaySize) {
      this.followerCurrentDisplay = this.followers.slice(this.startIndexFollowersArray, this.lastIndexFollowersArray)
      this.previousFollowersDisable = true
    } else {
      this.followerCurrentDisplay = this.followers
    }

  }
  fetchFollowerApi() {
    this.followersFetchStatus = 'fetching'
    this.lastIndexFollowersArray = 4
    this.startIndexFollowersArray = 0
    this.personprofileSvc.getFollowers(this.wid, this.pageSize).subscribe((data: any) => {
      if (data) {
        if (data.person) {
          this.followers = data.person.data
          if (this.followers.length > this.pageDisplaySize) {
            this.followerCurrentDisplay = this.followers.slice(this.startIndexFollowersArray, this.lastIndexFollowersArray)
            this.previousFollowersDisable = true
          } else {
            this.followerCurrentDisplay = this.followers
          }
        }
      }
      this.followersFetchStatus = 'done'
    },
                                                                          () => {
        this.followersFetchStatus = 'error'
      })

  }
  fetchNextFollowers() {
    if (this.previousFollowersDisable) {
      this.previousFollowersDisable = false
    }
    this.followerCurrentDisplay = []
    this.startIndexFollowersArray += this.pageDisplaySize
    this.lastIndexFollowersArray += this.pageDisplaySize
    if (this.lastIndexFollowersArray >= this.followers.length) {
      this.nextFollowersDisable = true

    }
    this.followerCurrentDisplay = this.followers.slice(this.startIndexFollowersArray, this.lastIndexFollowersArray)
  }
  fetchPreviousFollowers() {
    if (this.nextFollowersDisable) {
      this.nextFollowersDisable = false
    }

    this.followerCurrentDisplay = []
    this.startIndexFollowersArray -= this.pageDisplaySize
    this.lastIndexFollowersArray -= this.pageDisplaySize
    if (this.startIndexFollowersArray <= 0) {
      this.startIndexFollowersArray = 0
      this.previousFollowersDisable = true
    }
    this.followerCurrentDisplay = this.followers.slice(this.startIndexFollowersArray, this.lastIndexFollowersArray)

  }

}
