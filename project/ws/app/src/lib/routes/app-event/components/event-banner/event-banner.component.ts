import { Component, Input, OnDestroy, OnChanges, OnInit, ChangeDetectorRef } from '@angular/core'
import { Subscription, timer } from 'rxjs'
import { Router, ActivatedRoute } from '@angular/router'

interface ITimer {
  hours: number
  mins: number
}
@Component({
  selector: 'ws-app-event-banner',
  templateUrl: './event-banner.component.html',
  styleUrls: ['./event-banner.component.scss'],

})

export class EventBannerComponent implements OnDestroy, OnChanges, OnInit {
  @Input() data: any
  @Input() totalEvent = 1
  @Input() isRegisteredUser!: boolean
  currentIndex = 0
  data1: any
  timer: any
  slideInterval: Subscription | null = null
  eventStarted = true
  bannerTemplates = ['registeredBanner', 'timeBanner']
  allStartTimeData: string[] = []
  allRemainingTime: ITimer[] = []
  sessionTime: number[] = []
  private currentSubscription: Subscription | null = null

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private changeDetector: ChangeDetectorRef,
  ) { }

  ngOnChanges() {
    // this.reInitiateSlideInterval()
    // this.timerData()

  }

  ngOnInit() {
    this.calculateTime()
    // const t: Observable<number> = interval(60000)
    this.currentSubscription = timer(0, 60000)
      .subscribe(() => {
        this.allRemainingTime = []
        this.sessionTime.map(
          (v: number, index: number) => {
            this.sessionTime[index] = v - 60000
            this.allRemainingTime.push(this.convertMinutes(this.sessionTime[index]))
            this.changeDetector.detectChanges()
          }
        )
      })
  }

  ngOnDestroy() {
    // clearInterval(this.timer)
    if (this.currentSubscription) {
      this.currentSubscription.unsubscribe()
    }
  }

  // timerData() {
  //   this.timer = setInterval(
  //     () => {
  //       this.calculateTime()
  //       // tslint:disable-next-line: align
  //     }, 60000)
  // }
  calculateTime() {
    this.allStartTimeData = []
    Object.keys(this.data.SessionCards.Sessions).forEach((v: any) => {
      this.allStartTimeData.push(this.data.SessionCards.Sessions[v].SessionStartTime)
    })
    this.allStartTimeData.forEach((sessionTime: string) => {
      const diffDate = Date.parse(sessionTime) - Date.parse(Date())
      // const days = Math.floor(diffDate / (1000 * 60 * 60 * 24))
      // const mins = Math.floor((diffDate / 1000 / 60) % 60)
      // const hours = Math.floor((diffDate / (1000 * 60 * 60)) % 24) + days * 24
      // const totalMins = mins + (hours * 60)
      this.sessionTime.push(diffDate)
    })
  }

  convertMinutes(minsRemaining: number): ITimer {
    const days = Math.floor(minsRemaining / (1000 * 60 * 60 * 24))
    const mins = Math.floor((minsRemaining / 1000 / 60) % 60)
    const hours = Math.floor((minsRemaining / (1000 * 60 * 60)) % 24) + days * 24
    return { mins, hours }
  }

  slideTo(index: number) {
    if (index >= 0 && index < this.bannerTemplates.length) {
      this.currentIndex = index
      // this.reInitiateSlideInterval()
    }
  }
  onClickRegister() {
    this.router.navigate(['sessions'], { relativeTo: this.route })
    this.isRegisteredUser = !this.isRegisteredUser
  }
}
