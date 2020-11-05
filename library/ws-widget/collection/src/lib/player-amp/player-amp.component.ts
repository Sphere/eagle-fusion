import {
  Component,
  OnInit,
  Input,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
} from '@angular/core'
import { IWidgetsPlayerAmpData } from './player-amp.model'
import { Subscription, interval, timer } from 'rxjs'
import { EventService, WsEvents } from '@ws-widget/utils'
import { DynamicAssetsLoaderService } from '../_services/dynamic-assets-loader.service'
import { getAmpConfig, isIOS, LINKS } from './player-amp.utility'
import { ROOT_WIDGET_CONFIG } from '../collection.config'
import { first, filter } from 'rxjs/operators'
import { NsWidgetResolver, WidgetBaseComponent } from '@ws-widget/resolver'

@Component({
  selector: 'ws-widget-player-amp',
  templateUrl: './player-amp.component.html',
  styleUrls: ['./player-amp.component.scss'],
})
export class PlayerAmpComponent extends WidgetBaseComponent
  implements OnInit, AfterViewInit, OnDestroy, NsWidgetResolver.IWidgetData<any> {
  @Input() widgetType!: string
  @Input() widgetSubType!: string
  @Input() widgetInstanceId?: string
  @Input() widgetData!: any

  @Input() data!: IWidgetsPlayerAmpData
  @ViewChild('videoTag', { static: true }) videoTag!: ElementRef<HTMLVideoElement>
  private player: amp.Player | null = null
  private activityStartedAt: Date | null = null
  private maxTimeSeeked = 0
  enableTelemetry = false
  private heartbeatSubscription: Subscription | null = null
  constructor(
    private dynamicLoaderSvc: DynamicAssetsLoaderService,
    private eventSvc: EventService,
  ) {
    super()
  }

  ngOnInit() {
  }
  async ngAfterViewInit() {
    if (this.data.tokens && this.data.tokens.manifest && this.data.tokens.streamingToken) {
      await this.scriptSetups()
      this.initializePlayer()
    }
    this.eventDispatcher(WsEvents.EnumTelemetrySubType.Init)
  }
  ngOnDestroy() {
    if (this.heartbeatSubscription) {
      this.heartbeatSubscription.unsubscribe()
    }
    this.disposePlayer()
  }

  private async scriptSetups() {
    if (this.data.tokens && this.data.tokens.manifest && this.data.tokens.streamingToken) {
      await Promise.all([
        this.dynamicLoaderSvc.loadStyle(LINKS.ampCSS),
        this.dynamicLoaderSvc.loadScript(LINKS.ampScript),
      ])
      if (Array.isArray(this.data.markers)) {
        await Promise.all([
          this.dynamicLoaderSvc.loadStyle(LINKS.ampPluginMarkerCSS),
          this.dynamicLoaderSvc.loadScript(LINKS.ampPluginMarkerScript),
        ])
      }
      if (!amp) {
        await timer(1000, 500)
          .pipe(
            filter(() => Boolean(amp)),
            first(),
        )
          .toPromise()
      }
    }
    return true
  }
  // Player Related Methods
  private initializePlayer() {
    this.disposePlayer()
    if (!this.data || !this.data.tokens) {
      return
    }
    this.player = amp(this.videoTag.nativeElement, getAmpConfig(this.data.posterImage), () => {
      this.activityStartedAt = new Date()
      this.eventDispatcher(WsEvents.EnumTelemetrySubType.Loaded)
      this.heartbeatSubscription = interval(30000).subscribe(_ => {
        if (this.currentTime > this.maxTimeSeeked) {
          this.maxTimeSeeked = this.currentTime
        }
        this.eventDispatcher(WsEvents.EnumTelemetrySubType.HeartBeat)
      })
    })
    this.addEventListener()
    const subTitles = this.data.subtitles
      ? this.data.subtitles.map(u => ({
        label: u.label,
        kind: 'subtitles',
        srclang: u.srclang,
        src: u.url,
      }))
      : []
    const playerSource: amp.Player.Source[] = [
      {
        src: this.data.tokens.manifest,
        type: 'application/vnd.ms-sstr+xml',
        protectionInfo: [
          {
            type: 'AES',
            authenticationToken: this.data.tokens.streamingToken,
          },
        ],
      },
    ]
    if (isIOS()) {
      playerSource.unshift({
        src: `${LINKS.ampProxy}?playbackUrl=${
          this.data.tokens.manifest
          }(format=m3u8-aapl)&token=${encodeURIComponent(this.data.tokens.streamingToken)}`,
        type: 'application/vnd.apple.mpegurl',
        disableUrlRewriter: true,
      })
    }
    this.player.src(playerSource, subTitles.length ? subTitles : undefined)
  }

  private disposePlayer() {
    if (this.player) {
      this.player.dispose()
    }
  }

  // Add Event Listeners
  private addEventListener() {
    if (!this.player || !this.player.addEventListener) {
      return
    }
    this.player.addEventListener(amp.eventName.loadeddata, () => {
      try {
        if (this.data.resumePoint && this.player) {
          const start = Number(this.data.resumePoint)
          if (start > 10 && this.player.duration() - start > 20) {
            this.player.currentTime(start - 10)
          }
        }
      } catch (err) { }
    })
    this.player.addEventListener(amp.eventName.ended, () => {
      this.eventDispatcher(
        WsEvents.EnumTelemetrySubType.StateChange,
        WsEvents.EnumTelemetryMediaActivity.ENDED,
      )
    })
    this.player.addEventListener(amp.eventName.play, () => {
      this.eventDispatcher(
        WsEvents.EnumTelemetrySubType.StateChange,
        WsEvents.EnumTelemetryMediaActivity.PLAYED,
      )
    })
    this.player.addEventListener(amp.eventName.pause, () => {
      this.eventDispatcher(
        WsEvents.EnumTelemetrySubType.StateChange,
        WsEvents.EnumTelemetryMediaActivity.PAUSED,
      )
    })
    this.player.addEventListener(amp.eventName.disposing, () => {
      this.eventDispatcher(
        WsEvents.EnumTelemetrySubType.Unloaded,
        WsEvents.EnumTelemetryMediaActivity.NONE,
      )
    })

    this.player.addEventListener(amp.eventName.fullscreen, () => {
      this.eventDispatcher(
        WsEvents.EnumTelemetrySubType.StateChange,
        WsEvents.EnumTelemetryMediaActivity.FULLSCREEN_ACTIVATED,
      )
    })
    this.player.addEventListener(amp.eventName.exitfullscreen, () => {
      this.eventDispatcher(
        WsEvents.EnumTelemetrySubType.StateChange,
        WsEvents.EnumTelemetryMediaActivity.FULLSCREEN_DEACTIVATED,
      )
    })
    this.player.addEventListener(amp.eventName.volumechange, () => {
      this.eventDispatcher(
        WsEvents.EnumTelemetrySubType.StateChange,
        WsEvents.EnumTelemetryMediaActivity.VOLUME_CHANGE,
      )
    })
    this.player.addEventListener(amp.eventName.seeked, () => {
      this.eventDispatcher(
        WsEvents.EnumTelemetrySubType.StateChange,
        WsEvents.EnumTelemetryMediaActivity.SEEKED,
      )
    })
    this.player.addEventListener(amp.eventName.mute, () => {
      this.eventDispatcher(
        WsEvents.EnumTelemetrySubType.StateChange,
        WsEvents.EnumTelemetryMediaActivity.MUTE,
      )
    })
    this.player.addEventListener(amp.eventName.unmute, () => {
      this.eventDispatcher(
        WsEvents.EnumTelemetrySubType.StateChange,
        WsEvents.EnumTelemetryMediaActivity.UNMUTE,
      )
    })
  }

  // Player Meta Getters for telemetry
  private get currentTime(): number {
    if (this.player) {
      return this.player.currentTime()
    }
    return 0
  }
  private get totalTime(): number {
    if (this.player) {
      return this.player.duration()
    }
    return 0
  }
  private get currentState(): WsEvents.EnumTelemetryMediaState {
    if (!this.player) {
      return WsEvents.EnumTelemetryMediaState.NOT_STARTED
    }
    if (this.player.ended()) {
      return WsEvents.EnumTelemetryMediaState.ENDED
    }
    if (this.player.paused()) {
      return WsEvents.EnumTelemetryMediaState.PAUSED
    }
    return WsEvents.EnumTelemetryMediaState.PLAYING
  }
  // TELEMETRY HELPER METHODS
  private eventDispatcher(
    eventType: WsEvents.EnumTelemetrySubType,
    activityType: WsEvents.EnumTelemetryMediaActivity = WsEvents.EnumTelemetryMediaActivity.NONE,
  ) {
    const commonStructure: WsEvents.WsEventTelemetryMedia = {
      eventType: WsEvents.WsEventType.Telemetry,
      eventLogLevel: WsEvents.WsEventLogLevel.Info,
      from: {
        type: 'widget',
        widgetType: ROOT_WIDGET_CONFIG.player._type,
        widgetSubType: ROOT_WIDGET_CONFIG.player.amp,
      },
      to: '',
      data: {
        activityType,
        activityStartedAt: this.activityStartedAt,
        currentState: this.currentState,
        currentTime: this.currentTime || 0,
        eventSubType: eventType,
        maxedSeekedTime: this.maxTimeSeeked,
        totalTime: this.totalTime || 0,
      },
      passThroughData: this.data.passThroughData,
    }
    switch (eventType) {
      case WsEvents.EnumTelemetrySubType.HeartBeat:
      case WsEvents.EnumTelemetrySubType.Init:
      case WsEvents.EnumTelemetrySubType.Loaded:
      case WsEvents.EnumTelemetrySubType.StateChange:
      case WsEvents.EnumTelemetrySubType.Unloaded:
        break
      default:
        return
    }
    if (this.enableTelemetry) {
      this.eventSvc.dispatchEvent(commonStructure)
    }

  }
}
