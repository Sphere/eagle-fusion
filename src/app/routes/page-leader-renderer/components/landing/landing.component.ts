import { Component, ElementRef, OnInit, ViewChild } from '@angular/core'
import { MatDialog, MatSnackBar } from '@angular/material'
import { ActivatedRoute, ParamMap, Router } from '@angular/router'
import { ConfigurationsService } from '@ws-widget/utils'
import { IWsEmailUserId, IWsUserFollow } from '../../model/leadership-email.model'
import { IWsLeaderData } from '../../model/leadership.model'
import { LeadershipService } from '../../services/leadership.service'
import { SendMailDialogComponent } from '../send-mail-dialog/send-mail-dialog.component'

@Component({
  selector: 'ws-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
})
export class LandingComponent implements OnInit {
  @ViewChild('followed', { static: true }) followed!: ElementRef<any>
  @ViewChild('unfollowed', { static: true }) unfollowed!: ElementRef<any>
  @ViewChild('followUnfollowError', { static: true }) followUnfollowError!: ElementRef<any>

  isFetchingFollow = false
  tabs: string[] = []
  currentIndex = 0
  leaderName = ''
  userId: string | undefined
  leaderData: IWsLeaderData | null = null
  loggedUserFollowData: IWsUserFollow = {
    followers: [],
    following: [],
  }
  // public userUuid = this.configSvc.userProfile ? this.configSvc.userProfile.userId : ''
  leaderUuid = ''
  isFollowDisabled = true
  errorFetchingJson = false

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private leaderSvc: LeadershipService,
    public configSvc: ConfigurationsService,
  ) {
    if (this.configSvc.userProfile) {
      this.userId = this.configSvc.userProfile.userId
    }
  }

  ngOnInit() {
    if (this.route) {
      this.route.data.subscribe(response => {
        this.init(response)
      })
    }
  }

  init(response: any) {
    const leaderResponse = response.leaderData
    if (leaderResponse.data) {
      this.leaderData = leaderResponse.data
      this.tabs = this.leaderData ? this.leaderData.tabs.map(tab => tab.title) : []
      this.route.paramMap.subscribe((params: ParamMap) => {
        const name = params.get('name')
        this.leaderName = name ? name : ''
      })
      this.route.queryParamMap.subscribe((qParamMap: ParamMap) => {
        const tab = qParamMap.get('tab')
        this.currentIndex = tab && this.tabs.includes(tab) ? this.tabs.indexOf(tab) : 0
      })
    } else if (leaderResponse.error) {
      this.errorFetchingJson = true
    }
    this.fetchUserId()
    this.fetchLoggedUserFollowers()
  }

  fetchUserId() {
    if (this.leaderData) {
      this.leaderSvc.emailToUserId(this.leaderData.profile.emailId).subscribe(
        (uuid: IWsEmailUserId) => {
          this.leaderUuid = uuid.userId
          this.isFollowDisabled = false
        },
        () => {
          this.isFollowDisabled = true
        },
      )
    }
  }

  onIndexChange(index: number) {
    this.router.navigate([], { queryParams: { tab: this.tabs[index] } })
  }

  openSendMailDialog() {
    if (this.leaderData) {
      this.dialog.open(SendMailDialogComponent, {
        data: {
          placeholder: this.leaderData.mailMeta.placeholder,
          emailTo: this.leaderData.mailMeta.emailTo,
          name: this.leaderData.mailMeta.name,
          subject: this.leaderData.mailMeta.subject,
        },
      })
    }
  }

  private fetchLoggedUserFollowers() {
    const userId = this.userId ? this.userId : ''
    this.leaderSvc.fetchUserFollow(userId).subscribe(
      (data: IWsUserFollow) => {
        this.loggedUserFollowData = data
      },
      () => {
        this.snackBar.open(this.followUnfollowError.nativeElement.value)
      },
    )
  }

  isFollowing(id: string) {
    return this.loggedUserFollowData.following.filter(obj => obj.id === id).length > 0
  }

  follow() {
    if (this.leaderData) {
      const leaderData = this.leaderData
      this.isFetchingFollow = true
      this.loggedUserFollowData.following.push({
        id: this.leaderUuid,
        email: leaderData.profile.emailId,
        firstname:
          leaderData.profile.name ||
          leaderData.profile.emailId.substr(0, leaderData.profile.emailId.indexOf('.')),
      })
      this.leaderSvc
        .followUser({ followsourceid: this.userId, followtargetid: this.leaderUuid, type: 'person' })
        .subscribe(
          () => {
            this.snackBar.open(`${this.followed.nativeElement.value}_${leaderData.profile.name}`)
            this.isFetchingFollow = false
          },
          () => {
            this.snackBar.open(this.followUnfollowError.nativeElement.value)
            this.loggedUserFollowData.following.pop()
            this.isFetchingFollow = false
          },
        )
    }
  }

  unFollow() {
    const leaderData = this.leaderData
    if (leaderData) {
      this.isFetchingFollow = true
      this.leaderSvc
        .unFollowUser({ followsourceid: this.userId, followtargetid: this.leaderUuid })
        .subscribe(
          () => {
            this.snackBar.open(`${this.unfollowed.nativeElement.value} ${leaderData.profile.name}`)
            this.loggedUserFollowData.following = this.loggedUserFollowData.following.filter(
              u => u.id !== this.leaderUuid,
            )
            this.isFetchingFollow = false
          },
          () => {
            this.snackBar.open(this.followUnfollowError.nativeElement.value)
            this.isFetchingFollow = false
          },
        )
    }
  }

  toggleFollow() {
    this.isFollowing(this.leaderUuid) ? this.unFollow() : this.follow()
  }
}
