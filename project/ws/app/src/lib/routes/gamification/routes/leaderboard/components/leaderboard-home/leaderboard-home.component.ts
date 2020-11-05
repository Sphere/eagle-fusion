import {
  Component, OnInit,
  Output,
  EventEmitter,
} from '@angular/core'
import { MatSelectChange, MatButtonToggleChange } from '@angular/material'
import { TFetchStatus, ConfigurationsService } from '@ws-widget/utils'
import { GamificationService } from '../../../../services/gamification.service'
import { FormControl } from '@angular/forms'
import { DatePipe } from '@angular/common'
@Component({
  selector: 'ws-app-leaderboard',
  templateUrl: './leaderboard-home.component.html',
  styleUrls: ['./leaderboard-home.component.scss'],
})
export class LeaderboardHomeComponent implements OnInit {
  public sideNavBarOpened = false
  maxDate: Date
  leaderboard!: any
  leaderBoardActivity!: any
  query!: any
  leaderBoardGuild!: any
  rolesList!: any
  originalLeaderboard!: any
  sprint!: any
  sprintSelected!: any
  dealers!: any
  selectedRole!: string
  fetchStatus: TFetchStatus
  leaderBoardFirstRowGuild!: any
  leaderBoardFirstRowActivity!: any
  selectedRegion!: string
  userName: string | undefined
  roleName!: string
  dealerCode!: any
  dateStr!: any
  dateEnd!: any
  regionName!: string
  currentTab = 'Guild'
  guildMode = true
  activityMode = false
  startDate = new FormControl(new Date())
  endDate = new FormControl(new Date())

  @Output() langChangedEvent = new EventEmitter<string>()

  constructor(
    private gamificationSvc: GamificationService,
    private configSvc: ConfigurationsService,
    private datePipe: DatePipe,
  ) {
    if (this.configSvc.userProfile) {
      this.userName = this.configSvc.userProfile.userName
    }
    this.fetchStatus = 'none'
    this.maxDate = new Date()
  }

  ngOnInit() {
    this.rolesList = ['All', 'Sales Manager', 'Service Technician',
      'Parts Manager', 'Sales Consultant', 'Service Manager', 'Service Advisor', 'Dealer/Partner',
      'Parts Sales Person']
    this.fetchGuildLeaderboardData(null, null)
    this.fetchActivityLeaderboardData(null, null)
    this.fetchDealersData()
    this.sprintSelected = 'fy'
    this.selectedRole = 'All'
  }

  onTabChange(event: MatButtonToggleChange) {
    if (event.value === 'Activity') {
      this.currentTab = 'Activity'
      this.guildMode = false
      this.activityMode = true
    } else {
      this.currentTab = 'Guild'
      this.guildMode = true
      this.activityMode = false
    }
  }

  fetchGuildLeaderboardData(dateSt: any, dateEn: any) {
    if (dateSt && dateEn) {
      this.dateStr = this.datePipe.transform(dateSt, 'yyyy-MM-dd')
      this.dateEnd = this.datePipe.transform(dateEn, 'yyyy-MM-dd')
    }
    this.fetchStatus = 'fetching'
    this.gamificationSvc.fetchGuildLeaderboard(this.sprint, this.dateStr, this.dateEnd).subscribe(data => {
      this.leaderBoardGuild = data
      this.originalLeaderboard = data
      this.leaderBoardFirstRowGuild = this.leaderBoardGuild.filter(
        (each: any) => each.FirstName === this.userName
      )
      this.fetchStatus = 'done'
    })
  }

  fetchActivityLeaderboardData(dateSt: any, dateEn: any) {
    if (dateSt && dateEn) {
      this.dateStr = this.datePipe.transform(dateSt, 'yyyy-MM-dd')
      this.dateEnd = this.datePipe.transform(dateEn, 'yyyy-MM-dd')
    }
    this.fetchStatus = 'fetching'
    this.gamificationSvc.fetchActivityLeaderboard(this.sprint, this.dateStr, this.dateEnd).subscribe(data => {
      this.leaderBoardActivity = data
      this.originalLeaderboard = data
      this.leaderBoardFirstRowActivity = this.leaderBoardActivity.filter(
        (each: any) => each.FirstName === this.userName
      )
      this.fetchStatus = 'done'
    })
  }

  private fetchDealersData() {
    this.gamificationSvc.fetchDealers().subscribe(data => {
      this.dealers = data.Dealers
    })
  }

  // Function to capture sprint value
  sprintChanged(path: MatSelectChange) {
    if (path.value === 'h1') {
      this.sprint = 36097
    }
    if (path.value === 'h2') {
      this.sprint = 36098
    }
    if (path.value === 'fy') {
      this.sprint = ''
    }
    if (this.activityMode) {
      this.fetchActivityLeaderboardData(null, null)
    }
    if (this.guildMode) {
      this.fetchGuildLeaderboardData(null, null)
    }
  }

  roleChanged(path: MatSelectChange) {
    this.roleName = path.value
    if (this.dealerCode === undefined) {
      this.dealerCode = 'All Dealers'
    }
    if (this.regionName === undefined) {
      this.regionName = 'All'
    }
    this.applyFilter(this.roleName, this.regionName, this.dealerCode)
  }

  regionChanged(path: MatSelectChange) {
    this.regionName = path.value
    if (this.dealerCode === undefined) {
      this.dealerCode = 'All Dealers'
    }
    if (this.roleName === undefined) {
      this.roleName = 'All'
    }
    this.applyFilter(this.roleName, this.regionName, this.dealerCode)
  }

  dealerChanged(path: MatSelectChange) {
    this.dealerCode = path.value
    if (this.roleName === undefined) {
      this.roleName = 'All'
    }
    if (this.regionName === undefined) {
      this.regionName = 'All'
    }
    this.applyFilter(this.roleName, this.regionName, this.dealerCode)

  }

  applyFilter(role: string, region: string, dealer: any) {
    if (this.activityMode) {
      this.leaderBoardActivity = this.originalLeaderboard
      if (role !== undefined && role !== 'All') {
        this.leaderBoardActivity = this.leaderBoardActivity.filter(
          (each: any) => each.Column2 === role
        )
      }
      if (region !== undefined && region !== 'All') {
        this.leaderBoardActivity = this.leaderBoardActivity.filter(
          (each: any) => each.City === region
        )
      }
      if (dealer !== undefined && dealer !== 'All Dealers') {
        this.leaderBoardActivity = this.leaderBoardActivity.filter(
          (each: any) => each.dealerCode === dealer
        )
      }

    }
    if (this.guildMode) {
      this.leaderBoardGuild = this.originalLeaderboard
      if (role !== undefined && role !== 'All') {
        this.leaderBoardGuild = this.leaderBoardGuild.filter(
          (each: any) => each.Column2 === role
        )
      }
      if (region !== undefined && region !== 'All') {
        this.leaderBoardGuild = this.leaderBoardGuild.filter(
          (each: any) => each.City === region
        )
      }
      if (dealer !== undefined && dealer !== 'All Dealers') {
        this.leaderBoardGuild = this.leaderBoardGuild.filter(
          (each: any) => each.dealerCode === dealer
        )
      }

    }

  }

  handleSearchQuery(value: any) {
    if (this.activityMode) {
      this.leaderBoardActivity = this.originalLeaderboard
      this.leaderBoardActivity = Object.assign([], this.leaderBoardActivity).filter(
        (item: any) => item.FirstName.toLowerCase().indexOf(value.toLowerCase()) > -1
      )
    }
    if (this.guildMode) {
      this.leaderBoardGuild = this.originalLeaderboard
      this.leaderBoardGuild = Object.assign([], this.leaderBoardGuild).filter(
        (item: any) => item.FirstName.toLowerCase().indexOf(value.toLowerCase()) > -1
      )
    }

  }

}
