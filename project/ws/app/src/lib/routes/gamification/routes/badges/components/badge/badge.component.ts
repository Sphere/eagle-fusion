import { Component, OnInit, ViewChild, ElementRef } from '@angular/core'
import { ConfigurationsService } from '@ws-widget/utils'
import { GamificationService } from '../../../../services/gamification.service'
import { Subscription, fromEvent } from 'rxjs'
import { debounceTime, throttleTime } from 'rxjs/operators'
@Component({
  selector: 'ws-app-badge',
  templateUrl: './badge.component.html',
  styleUrls: ['./badge.component.scss'],
})
export class BadgeComponent implements OnInit {
  disableNext: boolean
  disablePrev: boolean
  badges!: any
  scrollObserver: Subscription | undefined
  badgesYetToWin!: any
  badgesWon!: any
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
    if (this.userName) {
      this.userName = this.userName.split(' ')[0]
      if (this.userName === '') {
        this.userName = this.userName.split(' ')[1]
      }
    }
  }

  ngOnInit() {
    this.gamificationSvc.fetchBadges().subscribe(data => {
      this.badges = data
    })
    this.gamificationSvc.fetchBadgesWon().subscribe(data => {
      this.badgesWon = data
    })
    this.gamificationSvc.fetchBadgesYetToWin().subscribe(data => {
      this.badgesYetToWin = data
      Object.keys(this.badgesYetToWin).forEach(key => {
        this.badgesYetToWin[key].forEach((element: any) => {
          element.progress = (element.currentCount / element.requiredCount) * 100
        })
      })
    })

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

}
