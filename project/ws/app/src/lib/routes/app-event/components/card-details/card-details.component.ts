import { Component, Input, OnInit, ChangeDetectorRef, AfterViewChecked } from '@angular/core'
import { IUserDetails } from '../../interfaces/user-details.model'
import { ISpeakerDetails } from '../../interfaces/speaker-details.model'
import { IEventDetails } from '../../interfaces/event-details.model'
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router'
interface ITimer {
  hours: number
  mins: number
}
@Component({
  selector: 'ws-app-card-details',
  templateUrl: './card-details.component.html',
  styleUrls: ['./card-details.component.scss'],
})
export class CardDetailsComponent implements OnInit, AfterViewChecked {

  @Input() userDetails?: IUserDetails[] = []
  @Input() speakerDetails?: ISpeakerDetails[] = []
  @Input() eventDetails?: IEventDetails[] = []
  @Input() cardType: 'user' | 'speaker' | 'event' | 'liveSpeaker' = 'user'
  currDate?: Date = new Date()
  @Input() liveSpeaker?: ISpeakerDetails[] = []
  sortedSpeaker: ISpeakerDetails[] = []
  navigationExtras: NavigationExtras = {}

  constructor(
    private changeDetector: ChangeDetectorRef,
    private route: ActivatedRoute,
    private router: Router,
  ) { }

  ngOnInit() {
  }

  sortSpeaker(a: ISpeakerDetails, b: ISpeakerDetails) {
    if (a.startRemainingTime && b.startRemainingTime) {
      if (a.startRemainingTime < b.startRemainingTime) {
        return -1
      }
      if (a.startRemainingTime > b.startRemainingTime) {
        return 1
      }
    }
    return 0
  }

  convertMinutes(minsRemaining: number): ITimer {
    const days = Math.floor(minsRemaining / (1000 * 60 * 60 * 24))
    const mins = Math.floor((minsRemaining / 1000 / 60) % 60)
    const hours = Math.floor((minsRemaining / (1000 * 60 * 60)) % 24) + days * 24
    return { mins, hours }
  }

  ngAfterViewChecked() {
    if (this.speakerDetails && this.speakerDetails.length > 0) {
      this.speakerDetails.sort(this.sortSpeaker)
      this.sortedSpeakerFunction()
    }
    this.changeDetector.detectChanges()
  }

  sortedSpeakerFunction() {
    this.sortedSpeaker = []
    const sessionEnded: ISpeakerDetails[] = []
    if (this.speakerDetails && this.speakerDetails.length > 0) {
      this.speakerDetails.forEach((speaker: ISpeakerDetails) => {
        if (
          !((speaker &&
            speaker.startRemainingTime &&
            speaker.endRemaningTime) &&
            speaker.startRemainingTime < 0 &&
            speaker.endRemaningTime > 0)) {
          if (speaker &&
            speaker.startRemainingTime &&
            speaker.endRemaningTime &&
            speaker.startRemainingTime < 0 &&
            speaker.endRemaningTime < 0) {
            sessionEnded.push(speaker)
          } else {
            this.sortedSpeaker.push(speaker)
          }
        }
      }
      )
    }
    this.sortedSpeaker = this.sortedSpeaker.concat(sessionEnded)
    this.navigationExtras = {
      state: { speakerDetails: this.sortedSpeaker },
    }
  }

  onClickSessionCard(i: number) {
    if (this.sortedSpeaker[i]) {
      this.navigationExtras = {
        state: { sessionID: this.sortedSpeaker[i].sessionID },
      }
      this.router.navigate(['../session-details', i + 1], this.navigationExtras = { ...this.navigationExtras, relativeTo: this.route })
    }
  }
}
