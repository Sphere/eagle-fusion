import { Component, OnInit, ViewChild, ElementRef } from '@angular/core'
import { ConfigurationsService } from '@ws-widget/utils'
import { GamificationService } from '../../../../services/gamification.service'
import { Subscription } from 'rxjs'

@Component({
  selector: 'ws-app-my-rewards',
  templateUrl: './my-rewards.component.html',
  styleUrls: ['./my-rewards.component.scss'],
})

export class MyRewardsComponent implements OnInit {
  disableNext: boolean
  disablePrev: boolean
  users!: any
  balance!: number
  url!: string
  show = true
  h1!: any
  h2!: any
  fy!: any
  metrics!: any
  rolesList!: any
  role!: any
  scrollObserver: Subscription | undefined
  userName: string | undefined
  objectKeys = Object.keys

  @ViewChild('cardContents', { read: ElementRef, static: false }) public cardContents:
    | ElementRef
    | undefined

  constructor(private gamificationSvc: GamificationService,
              private configSvc: ConfigurationsService) {
    this.disablePrev = true
    this.disableNext = false
    if (this.configSvc.userProfile) {
      this.userName = this.configSvc.userProfile.userName
    }
  }

  ngOnInit() {
    this.rolesList = ['All', 'Sales Manager', 'Service Technician',
      'Parts Manager', 'Sales Consultant', 'Service Manager', 'Service Advisor', 'Dealer/Partner',
      'Parts Sales Person']
    this.gamificationSvc.fetchUserProfile().subscribe(data => {
      this.users = data
      this.metrics = JSON.parse(this.users.column3)
      this.h1 = this.metrics.H1
      this.h2 = this.metrics.H2
      this.fy = this.metrics.FY
      this.role = this.rolesList.includes(this.users.column2)
    })
    this.gamificationSvc.getBalance().subscribe(data => {
      this.balance = data
    })
    this.gamificationSvc.getsso().subscribe(data => {
      this.url = data
    })
  }

}
