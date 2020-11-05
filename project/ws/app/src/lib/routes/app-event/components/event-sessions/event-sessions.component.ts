import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { Subscription, timer } from 'rxjs'
import { ISpeakerDetails } from '../../interfaces/speaker-details.model'
import { EventService } from '../../services/event.service'

@Component({
  selector: 'ws-app-event-sessions',
  templateUrl: './event-sessions.component.html',
  styleUrls: ['./event-sessions.component.scss'],
})
export class EventSessionsComponent implements OnInit, OnDestroy {
  data: ISpeakerDetails[] = []
  sessionCard: any
  quizdata: any
  session = 'Session'
  liveSpeaker: ISpeakerDetails[] = []
  sessionStartTime: number[] = []
  sessionEndTime: number[] = []
  private currentSubscription: Subscription | null = null

  constructor(
    private activatedRoute: ActivatedRoute,
    private appEventSvc: EventService,
    private changeDetector: ChangeDetectorRef,
  ) { }

  ngOnInit() {
    this.appEventSvc.bannerisEnabled.next(true)
    if (this.activatedRoute.parent) {
      this.activatedRoute.parent.data.subscribe((data: any) => {
        this.sessionCard = data.eventdata.data.SessionCards
        this.data = []
        Object.keys(data.eventdata.data.SessionCards.Sessions).forEach((v: any, index: number) => {
          this.data.push({
            sessionID: `${this.session}${(index + 1)}`,
            speakerType: data.eventdata.data.SessionCards.Sessions[v].SessionType,
            speakerImage: data.eventdata.data.SessionCards.Sessions[v].SessionImage,
            speakerKeynote: data.eventdata.data.SessionCards.Sessions[v].SessionTitle,
            speakerDate: data.eventdata.data.SessionCards.Sessions[v].SessionStartTime,
            speakerName: data.eventdata.data.SessionCards.Sessions[v].Speaker,
            registeredUsers: data.eventdata.data.SessionCards.Sessions[v].Attendees,
            startTime: data.eventdata.data.SessionCards.Sessions[v].SessionStartTime,
            endTime: data.eventdata.data.SessionCards.Sessions[v].SessionEndTime,
          })
        })
        if (this.data && this.data.length > 0) {
          this.calculateTime()
          this.currentSubscription = timer(0, 60000)
            .subscribe(() => {
              this.liveSpeaker = []
              this.sessionStartTime.map(
                (v: number, index: number) => {
                  this.sessionStartTime[index] = v - 60000
                  this.sessionEndTime[index] = this.sessionEndTime[index] - 60000
                  if (this.data &&
                    this.data.length > 0 &&
                    this.sessionStartTime[index] < 0 &&
                    this.sessionEndTime[index] > 0) {
                    this.liveSpeaker.push(this.data[index])
                  } else {
                  }
                  this.data[index].startRemainingTime = this.sessionStartTime[index]
                  this.data[index].endRemaningTime = this.sessionEndTime[index]
                }
              )
              this.changeDetector.detectChanges()
            })
        }
      }
      )
    }
  }

  calculateTime() {
    if (this.data) {
      this.data.forEach((speaker: ISpeakerDetails) => {
        const startTime = Date.parse(speaker.startTime) - Date.parse(Date())
        const endTime = Date.parse(speaker.endTime) - Date.parse(Date())
        this.sessionStartTime.push(startTime)
        this.sessionEndTime.push(endTime)
      })
    }
  }

  ngOnDestroy() {
    if (this.currentSubscription) {
      this.currentSubscription.unsubscribe()
    }
  }
}
