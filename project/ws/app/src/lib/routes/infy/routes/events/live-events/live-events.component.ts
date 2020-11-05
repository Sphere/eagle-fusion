import { Component, OnInit, OnDestroy } from '@angular/core'
import { ConfigurationsService, TFetchStatus, LoggerService } from '@ws-widget/utils'
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser'
import { ActivatedRoute } from '@angular/router'
import { Subscription, interval } from 'rxjs'
import { MobileAppsService } from '../../../../../../../../../../src/app/services/mobile-apps.service'
import { IEvent } from '../models/event.model'
import { EventsService } from '../services/events.service'

@Component({
  selector: 'ws-app-live-events',
  templateUrl: './live-events.component.html',
  styleUrls: ['./live-events.component.scss'],
})
export class LiveEventsComponent implements OnInit, OnDestroy {
  liveEvents!: IEvent[]
  liveUrl: string | null
  showIframeSupportWarning = true
  safeLiveUrl: SafeResourceUrl | undefined
  urlHasLiveUrl = false
  fetchStatus: TFetchStatus = 'fetching'
  notifierSubscription: Subscription | undefined
  isLiveStream = true
  isLiveStreamMobile = true

  constructor(
    private activatedRoute: ActivatedRoute,
    private sanitizer: DomSanitizer,
    public mobileAppsSvc: MobileAppsService,
    // private snackBar: MatSnackBar,
    public configSvc: ConfigurationsService,
    private eventsSvc: EventsService,
    private logger: LoggerService,
  ) {
    this.liveUrl = ''
  }

  ngOnInit() {
    this.eventsSvc.fetchLiveEvents().subscribe(
      (response: IEvent[]) => {
        this.logger.log('Got response', response)
        const events = (response || []).filter(event => new Date(event.end_time) > new Date())
        // tslint:disable-next-line:max-line-length
        // const events = [{ event_name: 'RedHat Tech day Track 2', start_time: new Date(), end_time: new Date(new Date().getTime() + (5 * 24 * 60 * 60 * 1000)), event_url: 'https://join-apac.broadcast.skype.com/wingspan.com/98cd8c9825b64b91ba62b427f59894da' }]
        this.liveEvents = events
        this.fetchStatus = 'done'
      },
      () => {
        this.fetchStatus = 'error'
      },
    )
    if (this.configSvc.restrictedFeatures) {
      this.isLiveStream = this.configSvc.restrictedFeatures.has('live_stream')
      this.isLiveStreamMobile = this.configSvc.restrictedFeatures.has('live_stream_mob')
    }

    this.activatedRoute.queryParamMap.subscribe(qparamsMap => {
      this.liveUrl = qparamsMap.get('liveUrl')
      if (this.liveUrl) {
        this.urlHasLiveUrl = true
        if (this.notifierSubscription) {
          this.notifierSubscription.unsubscribe()
        }
        // this.notifier('RUNNING')
        this.notifierSubscription = interval(30000).subscribe(() => {
          // this.notifier('RUNNING')
        })
        this.safeLiveUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.liveUrl)
      } else {
        this.urlHasLiveUrl = false
      }
    })
  }

  ngOnDestroy() {
    if (this.notifierSubscription) {
      this.notifierSubscription.unsubscribe()
    }
  }

  isCurrentTimeSmall(timestamp: string) {
    return new Date() < new Date(timestamp)
  }

  get currentTime() {
    return new Date()
  }
}
