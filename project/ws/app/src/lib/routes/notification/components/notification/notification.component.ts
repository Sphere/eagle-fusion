import { Component, OnInit } from '@angular/core'
import { IUserNotification } from '../../models/notifications.model'
import { NsGoal, NsPlaylist, BtnPlaylistService, BtnGoalsService } from '@ws-widget/collection'
import { TFetchStatus, NsPage, ConfigurationsService } from '@ws-widget/utils'

@Component({
  selector: 'ws-app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss'],
})
export class NotificationComponent implements OnInit {
  recentBadge: IUserNotification | null = null
  sharedPlaylists: NsPlaylist.IPlaylist[] = []
  sharedGoals: NsGoal.IGoal[] = []
  sharedNotificationGoals: NsGoal.IGoal[] = []
  fetchStatus: TFetchStatus | null = null
  statusCount: number | null = null
  pageNavbar: Partial<NsPage.INavBackground> = this.configSvc.pageNavBar
  constructor(
    private goalsSvc: BtnGoalsService,
    private playlistSvc: BtnPlaylistService,
    private configSvc: ConfigurationsService,
  ) { }

  ngOnInit() {
    this.initiate()
  }

  initiate() {
    this.fetchStatus = 'fetching'
    this.statusCount = 0
    this.fetchSharedPlaylist()
    this.fetchSharedGoals()
  }

  fetchSharedPlaylist() {
    this.playlistSvc.getPlaylists(NsPlaylist.EPlaylistTypes.PENDING).subscribe(
      data => {
        data.forEach(playlist => {
          playlist.sharedBy = (playlist.sharedBy || '').split('@')[0]
        })
        this.sharedPlaylists = data
        this.checkContentStatus()
      },
      _err => {
        this.checkContentStatus()
      },
    )
  }
  fetchSharedGoals() {
    this.goalsSvc.getActionRequiredGoals('isInIntranet').subscribe(
      data => {
        this.sharedNotificationGoals = data
        this.sharedNotificationGoals.forEach(goal => {
          if (goal.sharedBy) {
            goal.sharedBy.email = goal.sharedBy ? (goal.sharedBy.email || '').split('@')[0] : ''
          }
        })
        this.sharedGoals = this.sharedNotificationGoals
        this.checkContentStatus()
      },
      _err => {
        this.checkContentStatus()
      },
    )
  }
  checkContentStatus() {
    this.fetchStatus = 'done'
    if (this.statusCount != null) {
      this.statusCount += 1
    }
    if (
      this.statusCount === 3 &&
      !this.recentBadge &&
      !this.sharedGoals.length &&
      !this.sharedPlaylists.length
    ) {
      this.fetchStatus = 'none'
    }
  }
  playlistTrackBy(playlist: NsPlaylist.IPlaylist) {
    return playlist.id
  }
  goalTrackBy(goal: NsGoal.IGoal) {
    return goal.id
  }
}
