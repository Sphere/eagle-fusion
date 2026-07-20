import { Component, OnInit } from '@angular/core'
import { PersonProfileService } from '../../services/person-profile.service'
import { ActivatedRoute, Router } from '@angular/router'
import { ConfigurationsService, ValueService, TFetchStatus } from '@ws-widget/utils/src/public-api'
import { IFollowerId, IFollowDetails } from '../../person-profile.model'
import { ProfileService } from '../../../profile/services/profile.service'
import { Subscription } from 'rxjs'
import { MatSnackBar } from '@angular/material/snack-bar'

@Component({
  standalone: false,
  selector: 'ws-app-person-profile',
  templateUrl: './person-profile.component.html',
  styleUrls: ['./person-profile.component.scss'],

})
export class PersonProfileComponent implements OnInit {

  constructor(
    private personprofileSvc: PersonProfileService,
    private route: ActivatedRoute,
    private router: Router,
    private profileSvc: ProfileService,
    public configSvc: ConfigurationsService,
    private valueSvc: ValueService,
    private matSnackBar: MatSnackBar
  ) {
    this.router.onSameUrlNavigation = 'reload'
    this.route.queryParams.subscribe(params => {
      this.currentUserId = params['userId']
      this.fetchUserDetails(this.currentUserId)
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
  userDetails: IFollowDetails | undefined
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
  enabledFeatures: string[] = []

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

  fetchUserDetails(wid: string) {
    this.followingCount = 0
    this.isFollowButtonEnabled = true
    this.following = []
    this.followersCount = 0
    this.followers = []
    if (this.configSvc.userProfile) {
      if (wid === this.configSvc.userProfile.userId) {
        this.isFollowButtonEnabled = false
      }
    }
    if (this.currentUserId) {
      this.personprofileSvc.fetchdetails(this.currentUserId).subscribe(
        (data: IFollowDetails) => {
          this.userDetails = data
          if (this.userDetails) {
            this.targetId = this.userDetails.wid || ''
            // tslint:disable-next-line: max-line-length
            if (this.userDetails && this.userDetails.first_name) {
              this.iconChar = `${this.userDetails.first_name[0]}${this.userDetails.last_name ? this.userDetails.last_name[0] : ''}`
              this.userName = `${this.userDetails.first_name} ${this.userDetails.last_name ? this.userDetails.last_name : ''}`
            }
            this.firstName = this.userDetails && this.userDetails.first_name ? this.userDetails.first_name : ''
            this.fetchInterest()
            this.fetchFollowers()
            this.fetchFollowing()
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
