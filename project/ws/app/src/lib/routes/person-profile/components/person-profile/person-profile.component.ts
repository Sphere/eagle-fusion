import { Component, OnInit } from '@angular/core'
import { BtnFollowService, UserAutocompleteService, NsAutoComplete } from '@ws-widget/collection/src/public-api'
import { PersonProfileService } from '../../services/person-profile.service'
import { ActivatedRoute, Router } from '@angular/router'
import { ConfigurationsService, ValueService, TFetchStatus } from '@ws-widget/utils/src/public-api'
import { IFollowerId } from '../../person-profile.model'
import { ProfileService } from '../../../profile/services/profile.service'
import { Subscription } from 'rxjs'
import { MatSnackBar } from '@angular/material'

@Component({
  selector: 'ws-app-person-profile',
  templateUrl: './person-profile.component.html',
  styleUrls: ['./person-profile.component.scss'],
})
export class PersonProfileComponent implements OnInit {

  constructor(
    private followSvc: BtnFollowService,
    private personprofileSvc: PersonProfileService,
    private fetchUser: UserAutocompleteService,
    private route: ActivatedRoute,
    private router: Router,
    private profileSvc: ProfileService,
    public configSvc: ConfigurationsService,
    private valueSvc: ValueService,
    private matSnackBar: MatSnackBar
  ) {
    this.router.onSameUrlNavigation = 'reload'
    this.route.queryParams.subscribe(params => {
      this.emailId = params['emailId']
      this.fetchUserDetails(this.emailId)
    })
  }
  isFollow = false
  followers: IFollowerId[] = []
  following: IFollowerId[] = []
  followingCount = 0
  followersCount = 0
  interests: string[] | null = null
  followersFetchStatus: TFetchStatus = 'none'
  followingFetchStatus: TFetchStatus = 'none'
  statusFollowed: 'FOLLOWED' | 'NOT_FOLLOWED' | 'PENDING' | 'ERROR' = 'PENDING'
  targetId = ''
  basePicUrl = `/apis/protected/v8/user/details/wtoken`
  userDetails: NsAutoComplete.IUserAutoComplete | undefined
  suggestionsInterestLimit = 7
  emailId = ''
  userName = ''
  firstName = ''
  isFollowButtonEnabled = true
  isPersonProfileAvailable = true
  isAchivementEnabled = true
  isInterestsEnabled = false
  iconChar = ''
  isSmallScreen = false
  isLtMediumSubscription: Subscription | null = null
  currentUserName = ''
  currentUserId = ''
  profilePic = ''

  enabledFeatures: String[] = []

  // followingCount: any = ''

  ngOnInit() {
    if (this.configSvc.userProfile && this.configSvc.userProfile.userName) {
      this.currentUserId = this.configSvc.userProfile.userId
      this.currentUserName = this.configSvc.userProfile.userName
    }
    this.isLtMediumSubscription = this.valueSvc.isLtMedium$.subscribe(isLtMedium => {
      if (isLtMedium) {
        this.isSmallScreen = true
      } else {
        this.isSmallScreen = false
      }
    })

    if ((this.configSvc.restrictedFeatures) && (this.configSvc.restrictedFeatures.has('personProfile'))) {
      this.isPersonProfileAvailable = false
    }
    this.profileSvc.fetchConfigFile().subscribe((data: any) => {
      if (data) {
        if (data.enabledTabs.interests.available) {
          this.isInterestsEnabled = true
        }
      }

    })
    // this.fetchUserDetails(this.emailId)
    if (this.configSvc.userProfile) {
      if (this.emailId === this.configSvc.userProfile.email) {
        this.isFollowButtonEnabled = false
      }
    }

  }
  fetchInterest() {
    this.personprofileSvc.fetchUserInterestsV2(this.targetId).subscribe((data: string[]) => {
      this.interests = data
    })
  }

  follow() {
    this.statusFollowed = 'PENDING'
    this.followSvc.follow(this.targetId, 'person').subscribe(
      () => {
        this.statusFollowed = 'FOLLOWED'
        this.isFollow = false
        this.personprofileSvc.isfollowevent.emit(true)
        this.followersCount = this.followersCount + 1
      },
      () => {
        this.statusFollowed = 'NOT_FOLLOWED'
        this.isFollow = true
      },
    )
  }
  unfollowFn() {
    this.statusFollowed = 'PENDING'
    this.followSvc.unfollow(this.targetId, 'person').subscribe(
      () => {
        this.statusFollowed = 'NOT_FOLLOWED'
        this.followersCount = this.followersCount - 1
        this.personprofileSvc.isfollowevent.emit(true)
        // this.isFollow = true

      },
      () => {
        this.statusFollowed = 'FOLLOWED'
        // this.isFollow = false
      },
    )

  }
  fetchUserDetails(emailId: string) {
    this.followingCount = 0
    this.isFollowButtonEnabled = true
    this.following = []
    this.followersCount = 0
    this.followers = []
    if (this.configSvc.userProfile) {
      if (emailId === this.configSvc.userProfile.email) {
        this.isFollowButtonEnabled = false
      }
    }
    if (this.emailId) {
      this.fetchUser.fetchAutoComplete(emailId).subscribe(
        (data: NsAutoComplete.IUserAutoComplete[]) => {
          this.userDetails = data[0]
          if (this.userDetails) {
            this.targetId = this.userDetails.wid
            // tslint:disable-next-line: max-line-length
            this.iconChar = `${this.userDetails.first_name[0]}${this.userDetails.last_name ? this.userDetails.last_name[0] : ''}`
            this.userName = `${this.userDetails.first_name} ${this.userDetails.last_name ? this.userDetails.last_name : ''}`
            this.firstName = this.userDetails.first_name
            this.fetchInterest()
            this.fetchFollowers()
            this.fetchFollowing()
            this.fetchDetails()
          } else {
            this.statusFollowed = 'ERROR'
            this.openSnackBar('Error while fetching user details')
          }
        },
        _ => {
          this.statusFollowed = 'ERROR'
          this.openSnackBar('Error while fetching user details')
          this.followersFetchStatus = 'fetching'
          this.followingFetchStatus = 'fetching'

        },
      )
    }
  }
  fetchDetails() {
    this.personprofileSvc.fetchdetails(this.targetId).subscribe((data: any) => {
      if (data && data[0].source_profile_picture) {
        this.profilePic = data[0].source_profile_picture
      }
    })

  }
  fetchFollowers() {
    this.followersFetchStatus = 'fetching'
    this.personprofileSvc.getFollowers(this.targetId).subscribe(
      (data: any) => {
        if (data && data.person) {
          this.followers = data.person.data
          this.followersCount = data.person.count
          if (this.followers) {
            this.followers.forEach(person => {
              if (this.configSvc.userProfile) {
                if (person.identifier === this.configSvc.userProfile.userId) {
                  this.statusFollowed = 'FOLLOWED'
                }
              }
            })
            if (this.statusFollowed === 'PENDING') {
              this.statusFollowed = 'NOT_FOLLOWED'

            }
          }
        } else {
          this.followersCount = 0
          this.followers = []
          this.statusFollowed = 'NOT_FOLLOWED'
        }
        this.followersFetchStatus = 'done'
      },
      () => {
        this.followersFetchStatus = 'error'
        this.openSnackBar('Error while fetching followers.')
      })
  }
  fetchFollowing() {
    this.followingFetchStatus = 'fetching'
    this.personprofileSvc.getFollowingv3(this.targetId, true, true, ['person']).subscribe(
      (data: any) => {
        if (data.person) {
          this.followingCount = data.person.count
          this.following = data.person.data
        }
        this.followingFetchStatus = 'done'
      },
      () => {
        this.followingFetchStatus = 'error'
        this.openSnackBar('Error while fetching data.')
      })
  }

  private openSnackBar(message: string) {
    this.matSnackBar.open(message)
  }
}
