import { Component, OnInit, Output, EventEmitter } from '@angular/core'
import { TFetchStatus, ConfigurationsService } from '@ws-widget/utils'
import { MatSelectChange } from '@angular/material'
import { GamificationService } from '../../../../services/gamification.service'
import { ExcelService } from '../excel.service'
@Component({
  selector: 'ws-app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
})
export class AdminComponent implements OnInit {
  query!: any
  leaderboard!: any
  public sideNavBarOpened = false
  leaderBoardData!: any
  originalLeaderboard!: any
  sprint!: any
  sprintSelected!: any
  fetchStatus: TFetchStatus
  userName: string | undefined
  result!: any
  rolesList!: any
  dealers!: any
  selectedRole!: string
  selectedRegion!: string
  roleName!: string
  dealerCode!: any
  regionName!: string
  group!: any
  excelArray = [{}]

  @Output() langChangedEvent = new EventEmitter<string>()

  constructor(
    private gamificationSvc: GamificationService,
    private configSvc: ConfigurationsService,
    private excelService: ExcelService,
  ) {
    if (this.configSvc.userProfile) {
      this.userName = this.configSvc.userProfile.userName
    }
    this.fetchStatus = 'none'
    this.excelService = excelService
  }

  ngOnInit() {
    this.rolesList = [
      'All',
      'Sales Manager',
      'Service Technician',
      'Parts Manager',
      'Sales Consultant',
      'Service Manager',
      'Service Advisor',
      'Dealer/Partner',
      'Parts Sales Person',
    ]
    this.fetchLeaderboardData()
    this.fetchDealersData()
    this.sprintSelected = 'fy'
    this.selectedRole = 'All'
  }

  private fetchLeaderboardData() {
    this.fetchStatus = 'fetching'
    this.gamificationSvc.fetchLeaderBoard(this.sprint).subscribe(data => {
      data.forEach((element: any) => {
        element.reason = ''
      })
      this.leaderBoardData = data
      this.originalLeaderboard = data
      this.fetchStatus = 'done'
    })
  }

  private fetchDealersData() {
    this.gamificationSvc.fetchDealers().subscribe(data => {
      this.dealers = data.Dealers
    })
  }

  updatePoints(leaderBoardData: []) {
    this.gamificationSvc.updateApprovedPoints(leaderBoardData).subscribe(data => {
      this.result = data
    })
  }

  exportToExcel(data: any) {
    this.excelArray = [{}]
    data.forEach((element: any) => {
      const excelObj = {
        'Employee Number': 0,
        Currency: 'Points',
        Amount: 0,
        Reason: '',
      }
      excelObj.Amount = element.pointsApproved
      excelObj['Employee Number'] = element.UserSourceSystemId
      excelObj.Reason = element.reason
      this.excelArray.push(excelObj)
    })
    this.excelService.exportAsExcelFile(this.excelArray, 'points')
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
    this.fetchLeaderboardData()
  }

  roleChanged(path: MatSelectChange) {
    this.roleName = path.value
    if (this.dealerCode === undefined) {
      this.dealerCode = 'All Dealers'
    }
    if (this.group === undefined) {
      this.group = 'All'
    }
    if (this.regionName === undefined) {
      this.regionName = 'All'
    }
    this.applyFilter(this.roleName, this.regionName, this.dealerCode, this.group)
  }

  regionChanged(path: MatSelectChange) {
    this.regionName = path.value
    if (this.dealerCode === undefined) {
      this.dealerCode = 'All Dealers'
    }
    if (this.group === undefined) {
      this.group = 'All'
    }
    if (this.roleName === undefined) {
      this.roleName = 'All'
    }
    this.applyFilter(this.roleName, this.regionName, this.dealerCode, this.group)
  }

  dealerChanged(path: MatSelectChange) {
    this.dealerCode = path.value
    if (this.roleName === undefined) {
      this.roleName = 'All'
    }
    if (this.group === undefined) {
      this.group = 'All'
    }
    if (this.regionName === undefined) {
      this.regionName = 'All'
    }
    this.applyFilter(this.roleName, this.regionName, this.dealerCode, this.group)
  }

  groupChanged(path: MatSelectChange) {
    this.group = path.value
    if (this.roleName === undefined) {
      this.roleName = 'All'
    }
    if (this.regionName === undefined) {
      this.regionName = 'All'
    }
    if (this.dealerCode === undefined) {
      this.dealerCode = 'All Dealers'
    }
    this.applyFilter(this.roleName, this.regionName, this.dealerCode, this.group)
  }

  applyFilter(role: string, region: string, dealer: any, group: any) {
    this.leaderBoardData = this.originalLeaderboard
    if (role !== undefined && role !== 'All') {
      this.leaderBoardData = this.leaderBoardData.filter((each: any) => each.Column2 === role)
    }
    if (group !== undefined && group !== 'All') {
      this.leaderBoardData = this.leaderBoardData.filter((each: any) => each.Column1 === group)
    }
    if (region !== undefined && region !== 'All') {
      this.leaderBoardData = this.leaderBoardData.filter((each: any) => each.City === region)
    }
    if (dealer !== undefined && dealer !== 'All Dealers') {
      this.leaderBoardData = this.leaderBoardData.filter((each: any) => each.dealerCode === dealer)
    }
  }

  handleSearchQuery(value: any) {
    this.leaderBoardData = this.originalLeaderboard
    this.leaderBoardData = Object.assign([], this.leaderBoardData).filter(
      (item: any) => item.FirstName.toLowerCase().indexOf(value.toLowerCase()) > -1,
    )
  }
}
