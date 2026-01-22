import {
  Component,
  ElementRef,
  Inject,
  OnInit,
  OnDestroy,
  QueryList,
  ViewChildren,
  ViewChild,
} from '@angular/core'
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog'
import { LeadershipDashboardInfoComponent } from '../leadership-dashboard-info/leadership-dashboard-info.component'
import { UserProfileService } from '../../../../../project/ws/app/src/lib/routes/user-profile/services/user-profile.service'
import { ConfigurationsService } from '../../../../../library/ws-widget/utils/src/public-api'

@Component({
  selector: 'app-leadership-dashboard',
  templateUrl: './leadership-dashboard.component.html',
  styleUrls: ['./leadership-dashboard.component.scss'],
})
export class LeadershipDashboardComponent implements OnInit, OnDestroy {
  leaderboardData: any[] = []
  skeletonRankCards = [
    { height: 160 }, // rank 2
    { height: 180 }, // rank 1 (center)
    { height: 140 }, // rank 3
  ]

  topThree: any[] = []
  restUsers: any[] = []
  maxPoints = 0
  currentUserId = ''
  @ViewChildren('userRow', { read: ElementRef }) rows!: QueryList<ElementRef>
  currentUser: any
  isPinnedVisible = false
  loading = true
  collegeName = ''

  pageSize = 20
  currentPage = 0
  infiniteDisabled = false
  @ViewChild('scrollTrigger') scrollTrigger!: ElementRef
  @ViewChild('.leaderboard-content') leaderboardContent!: ElementRef
  private intersectionObserver!: IntersectionObserver

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<LeadershipDashboardComponent>,
    public dialog: MatDialog,
    public userProfileService: UserProfileService,
    private configSvc: ConfigurationsService,
  ) { }

  ngOnInit() {
    if (this.data) {
      this.loading = true
      this.leaderboardData = this.data.leaderboardData || []
      this.currentUser = this.data.currentUser || {}
      this.currentUserId = this.currentUser.userId
      this.setUserList()
    }
    this.collegeName =
      this.configSvc?.unMappedUser?.profileData?.professionalDetails[0].instituteName
    // this.loadLeaderboard(true);
  }

  loadLeaderboard(reset = true) {
    // if (reset) {
    //   this.currentPage = 1;
    //   this.infiniteDisabled = false;
    //   this.restUsers = [];
    // }
    this.loading = reset
    const request = {
      userId: this.configSvc.userProfile.userId, // this.configSvc.userProfile.userId,
      filters: {
        profession:
          this.configSvc.unMappedUser?.profileDetails?.profileReq?.professionalDetails[0]
            ?.designation,
        rootOrgId: this.configSvc.unMappedUser.rootOrgId,
        professional_institute_name:
          this.configSvc.unMappedUser?.profileDetails?.profileReq?.professionalDetails[0]?.instituteName
            ?.split(',')
            .join(''),
        background: 'Student',
      },
      limit: this.pageSize,
      offset: this.currentPage * this.pageSize,
    }

    this.userProfileService.getLeaderBoardData(request).subscribe(
      (res: any) => {
        const list = res.result.content.leaderboardList || []
        this.restUsers = [...this.restUsers, ...list]
        if (list.length < this.pageSize) {
          this.infiniteDisabled = true
        }

        this.loading = false
      },
      err => {
        console.log('Error loading leaderboard data', err)
        this.loading = false
        this.infiniteDisabled = true
      },
    )
  }

  setUserList() {
    this.maxPoints = this.leaderboardData[0]?.points || 1
    this.topThree = this.leaderboardData.slice(0, 3).map((user, index) => ({
      ...user,
      height: this.getBarHeight(user.points, index + 1),
    }))
    this.restUsers = this.leaderboardData.slice(3)
    this.loading = false
  }

  loadMore() {
    if (this.infiniteDisabled || this.loading) return
    this.currentPage++
    this.loadLeaderboard(false)
  }

  ngAfterViewInit() {
    this.rows.changes.subscribe(() => {
      this.evaluatePinState()
    })

    setTimeout(() => {
      this.evaluatePinState()
    }, 300)

    // Setup intersection observer for infinite scroll
    this.setupInfiniteScroll()
  }

  setupInfiniteScroll() {
    if (!this.scrollTrigger) return

    const options = {
      root: this.leaderboardContent?.nativeElement || null,
      rootMargin: '100px',
      threshold: 0,
    }

    this.intersectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.infiniteDisabled && !this.loading) {
          this.loadMore()
        }
      })
    }, options)

    this.intersectionObserver.observe(this.scrollTrigger.nativeElement)
  }

  ngOnDestroy() {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect()
    }
  }

  evaluatePinState() {
    // If no rows rendered but we have current user, show pinned (user not loaded yet)
    if (!this.rows || this.rows.length === 0) {
      if (this.currentUser && this.currentUser.userId) {
        this.isPinnedVisible = true
      }
      return
    }

    const index = this.restUsers.findIndex(u => u.userId === this.currentUserId)

    // If user not found in restUsers, show pinned (user not loaded yet)
    if (index === -1) {
      this.isPinnedVisible = true
      return
    }

    const rowEl = this.rows.toArray()[index]

    // If row doesn't exist in DOM, user is off-screen, show pinned
    if (!rowEl) {
      this.isPinnedVisible = true
      return
    }

    const rect = rowEl.nativeElement.getBoundingClientRect()
    const viewportHeight = window.innerHeight

    // Show pinned only if user row is below viewport
    this.isPinnedVisible = rect.top > viewportHeight
  }

  getBarHeight(points: number, rank: number): string {
    const minHeight = 124
    const maxHeight = 200
    return (
      minHeight +
      (points / this.maxPoints) *
      (maxHeight - minHeight - (rank === 1 ? 0 : rank === 2 ? 40 : 70)) +
      'px'
    )
  }

  getTopThreeForDisplay() {
    if (this.topThree.length === 0) return []

    const rank1 = this.topThree.find(u => u.rank === 1)
    const rank2 = this.topThree.find(u => u.rank === 2)
    const rank3 = this.topThree.find(u => u.rank === 3)

    // Return in display order: rank3 (left), rank1 (center), rank2 (right)
    // Filter out undefined values if fewer than 3 users
    const result = [rank3, rank1, rank2].filter(Boolean)
    return result.length > 0 ? result : []
  }

  closeLeaderboard() {
    this.dialogRef.close()
  }

  openInfoPopup() {
    this.dialog.open(LeadershipDashboardInfoComponent, {
      width: '100%',
      panelClass: 'congratulations-dialog',
    })
  }

  onScroll() {
    this.evaluatePinOnScroll()
  }

  evaluatePinOnScroll() {
    if (!this.rows || this.rows.length === 0) {
      // User not loaded yet, show pinned
      this.isPinnedVisible = true
      return
    }

    const index = this.restUsers.findIndex(u => u.userId === this.currentUserId)

    // User not in restUsers yet, show pinned
    if (index === -1) {
      this.isPinnedVisible = true
      return
    }

    const rowEl = this.rows.toArray()[index]

    // Row not rendered, user is off-screen, show pinned
    if (!rowEl) {
      this.isPinnedVisible = true
      return
    }

    const rect = rowEl.nativeElement.getBoundingClientRect()
    const viewportHeight = window.innerHeight

    // Show pinned only if user row is below viewport
    this.isPinnedVisible = rect.top > viewportHeight
  }
}
