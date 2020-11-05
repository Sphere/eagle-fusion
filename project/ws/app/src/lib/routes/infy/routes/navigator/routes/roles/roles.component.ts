import { Component, OnInit } from '@angular/core'
import { TFetchStatus } from '@ws-widget/utils'
import { NavigatorService } from '../../services/navigator.service'
import { IOfferings, IRole } from '../../models/navigator.model'
import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout'

@Component({
  selector: 'ws-app-roles',
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss'],
})
export class RolesComponent implements OnInit {
  status: TFetchStatus = 'none'
  rolesData!: IOfferings
  smallScreen = false
  selectedTrack = 'Accelerate'
  currentTrackData!: IRole[]
  hasMore = false

  isSmallScreen$ = this.breakpointObserver.observe(Breakpoints.XSmall)
  constructor(
    private navSvc: NavigatorService,
    private breakpointObserver: BreakpointObserver,
  ) {
    this.navSvc.fetchNavigatorRoles().subscribe((data: IOfferings) => {
      this.rolesData = data
      this.currentTrackData = this.rolesData.Accelerate.roles
      this.status = 'done'
    })

    this.isSmallScreen$.subscribe((breakPointState: BreakpointState) => {
      if (breakPointState.matches) {
        this.smallScreen = true
      } else {
        this.smallScreen = false
      }
    })
  }

  ngOnInit() { }

  trackClicked(newTrack: string) {
    this.selectedTrack = newTrack
    this.hasMore = false
    if (newTrack === 'Assure') {
      this.currentTrackData = this.rolesData.Assure.roles
    } else if (newTrack === 'Experience') {
      this.currentTrackData = this.rolesData.Experience.roles
    } else if (newTrack === 'Insight') {
      this.currentTrackData = this.rolesData.Insight.roles
    } else if (newTrack === 'Innovate') {
      this.currentTrackData = this.rolesData.Innovate.roles
    } else {
      this.currentTrackData = this.rolesData.Accelerate.roles
    }
    if (this.currentTrackData.length > 3) {
      this.hasMore = true
    }
  }
}
