import { Component, OnInit, ViewChild, ElementRef } from '@angular/core'
import { TFetchStatus, LoggerService, ConfigurationsService } from '@ws-widget/utils'
import { IBadgeResponse } from './badges.model'
import { Subscription, fromEvent } from 'rxjs'
import { BadgesService } from './badges.service'
import { MatSnackBar } from '@angular/material'
import { debounceTime, throttleTime } from 'rxjs/operators'

@Component({
  selector: 'ws-app-badges',
  templateUrl: './badges.component.html',
  styleUrls: ['./badges.component.scss'],
})
export class BadgesComponent implements OnInit {
  status: TFetchStatus = 'none'
  isUpdating = false
  badges: IBadgeResponse
  paramSubscription: Subscription | null = null
  userName: string | undefined
  userEmail: string | undefined
  disableNext: boolean
  disablePrev: boolean
  scrollObserver: Subscription | undefined

  @ViewChild('cardContents', { read: ElementRef, static: false }) public cardContents:
    | ElementRef
    | undefined
  show = 4

  constructor(
    private badgesSvc: BadgesService,
    private logger: LoggerService,
    private snackBar: MatSnackBar,
    private configSvc: ConfigurationsService,
  ) {
    this.badges = {
      canEarn: [],
      closeToEarning: [],
      earned: [],
      lastUpdatedDate: '',
      recent: [],
      totalPoints: [{ collaborative_points: 0, learning_points: 0 }],
    }
    if (this.configSvc.userProfile) {
      this.userName = this.configSvc.userProfile.userName
    }
    if (this.userName) {
      this.userName = this.userName.split(' ')[0]
    }
    // if (this.authSvc.userEmail) {
    // this.userEmail = this.authSvc.userEmail
    // }
    this.disablePrev = true
    this.disableNext = false
  }

  ngOnInit() {
    this.badgesSvc.fetchBadges().subscribe(data => {
      this.logger.log('Data check from resolver', data)
      this.badges = data
      this.status = 'done'
    })
    setTimeout(
      () => {
        this.initializeObserver()
        this.updateNavigationButtons()
      },
      100
    )
  }

  reCalculateBadges() {
    this.isUpdating = true
    this.badgesSvc.reCalculateBadges().subscribe(
      _ => {
        this.badgesSvc.fetchBadges().subscribe(
          (data: IBadgeResponse) => {
            this.badges = data
            this.isUpdating = false
            this.snackBar.open('Badges Refreshed')
          },
          (err: string) => {
            this.logger.log(err)
            this.isUpdating = false
          },
        )
      },
      (err: string) => {
        this.logger.log(err)
        this.isUpdating = false
      },
    )
  }

  initializeObserver() {
    if (this.cardContents) {
      this.scrollObserver = fromEvent(this.cardContents.nativeElement, 'scroll')
        .pipe(debounceTime(200))
        .pipe(throttleTime(200))
        .subscribe(_ => {
          if (this.cardContents) {
            this.updateNavigationButtonStatus(this.cardContents.nativeElement as HTMLElement)
          }
        })
    }
  }

  public scrollRight(): void {
    if (this.cardContents) {
      const clientWidth = this.cardContents.nativeElement.clientWidth
      this.cardContents.nativeElement.scrollTo({
        left: this.cardContents.nativeElement.scrollLeft + clientWidth * 0.9,
        behavior: 'smooth',
      })
    }
  }

  public scrollLeft(): void {
    if (this.cardContents) {
      const clientWidth = this.cardContents.nativeElement.clientWidth
      this.cardContents.nativeElement.scrollTo({
        left: this.cardContents.nativeElement.scrollLeft - clientWidth * 0.9,
        behavior: 'smooth',
      })
    }
  }

  updateNavigationButtons() {
    if (this.cardContents) {
      if (
        this.cardContents.nativeElement.scrollWidth <= this.cardContents.nativeElement.clientWidth
      ) {
        this.disableNext = true
      }
    }
  }

  updateNavigationButtonStatus(element: HTMLElement) {
    this.updateNavigationButtons()
    if (element.scrollLeft === 0) {
      this.disablePrev = true
    } else {
      this.disablePrev = false
    }
    if (element.scrollWidth === element.clientWidth + element.scrollLeft) {
      this.disableNext = true
    } else {
      this.disableNext = false
    }
  }

  simulateDummyData() {
    this.badges.earned = [

    ]

    this.badges.closeToEarning = [

    ]
  }

  increaseShow() {
    this.show += 4
  }
  decreaseShow() {
    this.show = 4
  }
}
