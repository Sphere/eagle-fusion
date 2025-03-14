import { AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { NsWidgetResolver, WidgetBaseComponent } from '@ws-widget/resolver'
import { EventService, ConfigurationsService, TelemetryService, ValueService } from '@ws-widget/utils'
import videoJs from 'video.js'
import { ViewerUtilService } from '../../../../../../project/ws/viewer/src/lib/viewer-util.service'
import { ROOT_WIDGET_CONFIG } from '../collection.config'
import { IWidgetsPlayerMediaData } from '../_models/player-media.model'
import {
  fireRealTimeProgressFunction,
  saveContinueLearningFunction,
  telemetryEventDispatcherFunction,
  videoInitializer,
  videoJsInitializer,
} from '../_services/videojs-util'
import { NsContent } from '../_services/widget-content.model'
import { WidgetContentService } from '../_services/widget-content.service'
import { ViewerDataService } from 'project/ws/viewer/src/lib/viewer-data.service'
import { PlayerVideoPopupComponent } from '../player-video-popup/player-video-popup-component'
import { MatDialog } from '@angular/material/dialog'
import { interval, Subscription } from 'rxjs'
import 'videojs-markers'

const videoJsOptions: videoJs.PlayerOptions = {
  controls: true,
  autoplay: false,
  preload: 'auto',
  fluid: false,
  techOrder: ['html5'],
  playbackRates: [0.75, 0.85, 1, 1.25, 2, 3],
  poster: '',
  html5: {
    hls: {
      overrideNative: true,
    },
    nativeVideoTracks: false,
    nativeAudioTracks: false,
    nativeTextTracks: false,
  },
  nativeControlsForTouch: false,
}

@Component({
  selector: 'ws-widget-player-video',
  templateUrl: './player-video.component.html',
  styleUrls: ['./player-video.component.scss'],
})
export class PlayerVideoComponent extends WidgetBaseComponent
  implements
  OnInit,
  AfterViewInit,
  OnDestroy,
  NsWidgetResolver.IWidgetData<IWidgetsPlayerMediaData> {
  @Input() widgetData!: any
  @ViewChild('videoTag', { static: false }) videoTag!: ElementRef<HTMLVideoElement>
  @ViewChild('realvideoTag', { static: false }) realvideoTag!: ElementRef<HTMLVideoElement>
  private player: videoJs.Player | null = null
  private dispose: (() => void) | null = null
  contentData: any
  popupShown = false;
  progressData: any
  videoQuestions!: {
    timestamp: { hours: 0, minutes: 0, seconds: 0 },
    timestampInSeconds: 0,
    question: [ // Ensure 'question' is used here
      {
        text: '',
        options: [{ text: '', optionId: '', isCorrect: false, answerInfo: '' }]
      }
    ]
  }
  videojsEventNames = {
    disposing: 'disposing',
    ended: 'ended',
    exitfullscreen: 'exitfullscreen',
    fullscreen: 'fullscreen',
    mute: 'mute',
    pause: 'pause',
    play: 'play',
    ready: 'ready',
    seeked: 'seeked',
    unmute: 'unmute',
    volumechange: 'volumechange',
    loadeddata: 'loadeddata',
  }
  videoStates: { [videoId: string]: { popupTriggered: any, currentMilestone: any } } = {};
  popupTriggered = false

  constructor(
    private eventSvc: EventService,
    private contentSvc: WidgetContentService,
    private viewerSvc: ViewerUtilService,
    private activatedRoute: ActivatedRoute,
    private configSvc: ConfigurationsService,
    private telemetrySvc: TelemetryService,
    public viewerDataSvc: ViewerDataService,
    private readonly dialog: MatDialog,
    private readonly valueSvc: ValueService,

  ) {
    super()
    // console.log(window.innerWidth)
    // if (window.innerWidth < 768) {
    //   screen.orientation.lock('landscape');
    //   //this.isMobileResolution = true;
    // } else {
    //   //this.isMobileResolution = false;
    // }
  }

  ngOnInit() { console.log("videoDatas", this.widgetData, this.contentData) }


  async ngAfterViewInit() {
    await this.getCurrentTime()
    console.log("Initial resume point:", this.widgetData.resumePoint)
    this.widgetData = {
      ...this.widgetData,
    }
    // if (this.widgetData && this.widgetData.identifier && !this.widgetData.url) {
    await this.fetchContent()
    console.log("this.widgetData.videoQuestions", this.widgetData)
    //enable below code to show popup questions
    if (this.videoTag) {
      this.addTimeUpdateListener(this.videoTag.nativeElement)
    }
    if (this.realvideoTag) {
      this.addTimeUpdateListener(this.realvideoTag.nativeElement)
    }

    if (this.widgetData.url) {
      if (this.widgetData.isVideojs) {
        this.initializePlayer()
      } else {
        this.initializeVPlayer()
      }
    }
  }

  async getCurrentTime() {
    let userId
    if (this.configSvc.userProfile) {
      userId = this.configSvc.userProfile.userId || ''
    }
    const batchId = this.activatedRoute.snapshot.queryParams.batchId ?
      this.activatedRoute.snapshot.queryParams.batchId : this.widgetData.identifier
    const req: NsContent.IContinueLearningDataReq = {
      request: {
        userId,
        batchId,
        courseId: this.activatedRoute.snapshot.queryParams.collectionId || '',
        contentIds: [],
        fields: ['progressdetails'],
      },
    }
    const data = await this.contentSvc.fetchContentHistoryV2(req).toPromise()
    if (data?.result?.contentList?.length) {
      const contentData = data.result.contentList.find((obj: any) => obj.contentId === this.widgetData.identifier)
      if (contentData?.progressdetails?.current) {
        this.progressData = contentData
        this.widgetData.resumePoint = contentData.progressdetails.current
        console.log("Updated resume point:", this.widgetData.resumePoint)
      }
    }
  }

  addTimeUpdateListener(videoElement: HTMLVideoElement): void {
    const player = videoJs(videoElement, {
      ...videoJsOptions,
      poster: this.widgetData.posterImage,
      autoplay: this.widgetData.autoplay || false,
    })

    const videoId = videoElement.id
    this.videoStates[videoId] = {
      popupTriggered: new Set<number>(), // Track triggered milestones
      currentMilestone: null,
    }

    // Handle play event
    player.on(this.videojsEventNames.play, () => {
      this.openFullscreen(player) // Open video in fullscreen mode
      const intervalId = interval(500).subscribe(() => {
        const currentTimeInSeconds = Math.round(player.currentTime())
        if (this.widgetData.videoQuestions && this.widgetData.videoQuestions.length > 0) {
          for (const milestone of this.widgetData.videoQuestions) {
            // Check if popup has already been triggered for this milestone
            if (
              currentTimeInSeconds === milestone.timestampInSeconds &&
              !this.videoStates[videoId].popupTriggered.has(milestone.timestampInSeconds)
            ) {
              player.pause()
              console.log("Popup triggered for milestone:", milestone.timestampInSeconds)
              this.videoStates[videoId].popupTriggered.add(milestone.timestampInSeconds)
              this.videoStates[videoId].currentMilestone = milestone.timestampInSeconds
              this.openPopup(milestone.question, player, intervalId)
              return // Exit loop after triggering popup
            }
          }
        }
      })
    })

    // Handle timeupdate for user seeking
    player.on('timeupdate', () => {
      const currentTimeInSeconds = Math.round(player.currentTime())
      if (this.widgetData.videoQuestions) {
        for (const milestone of this.widgetData.videoQuestions) {
          // Reset popupTriggered if user seeks before the milestone
          if (currentTimeInSeconds < milestone.timestampInSeconds) {
            this.videoStates[videoId].popupTriggered.delete(milestone.timestampInSeconds)
          }
        }
      }
    })
  }

  openFullscreen(player: any): void {
    this.valueSvc.isXSmall$.subscribe(isXSmall => {
      if (isXSmall)
        if (player.requestFullscreen) {
          player.requestFullscreen()
        } else if (player.webkitRequestFullscreen) { // Safari
          player.webkitRequestFullscreen()
        } else if ((player).msRequestFullscreen) { // IE/Edge
          player.msRequestFullscreen()
        }
    })

  }
  openPopup(questions: any, videoElement: any, intervalId: Subscription): void {
    const confirmdialog = this.dialog.open(PlayerVideoPopupComponent, {
      width: '600px',
      data: { questions },
    })

    if (confirmdialog) {
      confirmdialog.afterClosed().subscribe(() => {
        console.log("Popup closed")
        this.dialog.closeAll()
        videoElement.play()
        intervalId.unsubscribe() // Stop the current interval
        this.addTimeUpdateListener(videoElement) // Resume the listener if needed
        this.onTimeUpdate()
      })
    }
  }

  ngOnDestroy() {
    if (this.player) {
      this.player.dispose()
    }
    if (this.dispose) {
      this.dispose()
    }
  }
  private initializeVPlayer() {
    console.log("initializeVPlayer")
    const dispatcher: telemetryEventDispatcherFunction = event => {
      if (this.widgetData.identifier) {
        this.eventSvc.dispatchEvent(event)
      }
    }
    const saveCLearning: saveContinueLearningFunction = data => {
      if (this.widgetData.identifier) {
        if (this.activatedRoute.snapshot.queryParams.collectionType &&
          this.activatedRoute.snapshot.queryParams.collectionType.toLowerCase() === 'playlist') {
          const continueLearningData = {
            contextPathId: this.activatedRoute.snapshot.queryParams.collectionId ?
              this.activatedRoute.snapshot.queryParams.collectionId : this.widgetData.identifier,
            resourceId: data.resourceId,
            contextType: 'playlist',
            dateAccessed: Date.now(),
            data: JSON.stringify({
              progress: data.progress,
              timestamp: Date.now(),
              contextFullPath: [this.activatedRoute.snapshot.queryParams.collectionId, data.resourceId],
            }),
          }
          this.contentSvc
            .saveContinueLearning(continueLearningData)
            .toPromise()
            .catch()
        } else {
          const continueLearningData = {
            contextPathId: this.activatedRoute.snapshot.queryParams.collectionId ?
              this.activatedRoute.snapshot.queryParams.collectionId : this.widgetData.identifier,
            ...data,
            // resourceId: data.resourceId,
            // dateAccessed: Date.now(),
            // data: data.data,
          }
          // JSON.stringify({
          //   progress: data.progress,
          //   timestamp: Date.now(),
          // }),
          this.contentSvc
            .saveContinueLearning(continueLearningData)
            .toPromise()
            .catch()
        }
      }
    }
    const fireRProgress: fireRealTimeProgressFunction = (identifier, data) => {
      const collectionId = this.activatedRoute.snapshot.queryParams.collectionId ?
        this.activatedRoute.snapshot.queryParams.collectionId : this.widgetData.identifier
      const batchId = this.activatedRoute.snapshot.queryParams.batchId ?
        this.activatedRoute.snapshot.queryParams.batchId : this.widgetData.identifier
      if (this.widgetData.identifier) {
        this.viewerSvc
          .realTimeProgressUpdate(identifier, data, collectionId, batchId)
      }

    }

    if (this.widgetData.resumePoint && this.widgetData.resumePoint !== 0) {
      this.realvideoTag.nativeElement.currentTime = this.widgetData.resumePoint
    }
    let enableTelemetry = false
    if (!this.widgetData.disableTelemetry && typeof (this.widgetData.disableTelemetry) !== 'undefined') {
      enableTelemetry = true
    }
    this.dispose = videoInitializer(
      this.realvideoTag.nativeElement,
      dispatcher,
      saveCLearning,
      fireRProgress,
      this.widgetData.passThroughData,
      ROOT_WIDGET_CONFIG.player.video,
      enableTelemetry,
      this.widgetData,
      this.widgetData.mimeType,
    ).dispose
  }

  private initializePlayer() {
    console.log("initializePlayer")

    const dispatcher: telemetryEventDispatcherFunction = event => {
      if (this.widgetData.identifier) {
        this.eventSvc.dispatchEvent(event)
      }
    }
    const saveCLearning: saveContinueLearningFunction = data => {
      if (this.widgetData.identifier && data) {
        if (this.activatedRoute.snapshot.queryParams.collectionType &&
          this.activatedRoute.snapshot.queryParams.collectionType.toLowerCase() === 'playlist') {
          // const continueLearningData = {
          //   contextPathId: this.activatedRoute.snapshot.queryParams.collectionId ?
          //     this.activatedRoute.snapshot.queryParams.collectionId : this.widgetData.identifier,
          //   resourceId: data.resourceId,
          //   contextType: 'playlist',
          //   dateAccessed: Date.now(),
          //   data: JSON.stringify({
          //     progress: data.progress,
          //     timestamp: Date.now(),
          //     contextFullPath: [this.activatedRoute.snapshot.queryParams.collectionId, data.resourceId],
          //   }),
          // }
          // this.contentSvc
          //   .saveContinueLearning(continueLearningData)
          //   .toPromise()
          //   .catch()
        } else {
          // const continueLearningData = {
          //   contextPathId: this.activatedRoute.snapshot.queryParams.collectionId
          //     ? this.activatedRoute.snapshot.queryParams.collectionId
          //     : this.widgetData.identifier,
          //   ...data,
          //   // resourceId: data.resourceId,
          //   // dateAccessed: Date.now(),
          //   // data: JSON.stringify({
          //   //   progress: data.progress,
          //   //   timestamp: Date.now(),
          //   // }),
          // }
          // this.contentSvc
          //   .saveContinueLearning(continueLearningData)
          //   .toPromise()
          //   .catch()
        }
      }
    }
    const fireRProgress: fireRealTimeProgressFunction = async (identifier, data) => {
      const collectionId = this.activatedRoute.snapshot.queryParams.collectionId ?
        this.activatedRoute.snapshot.queryParams.collectionId : this.widgetData.identifier
      const batchId = this.activatedRoute.snapshot.queryParams.batchId ?
        this.activatedRoute.snapshot.queryParams.batchId : this.widgetData.identifier

      this.telemetrySvc.start('video', 'video-start', this.activatedRoute.snapshot.queryParams.collectionId ?
        this.activatedRoute.snapshot.queryParams.collectionId : this.widgetData.identifier)

      let userId
      if (this.configSvc.userProfile) {
        userId = this.configSvc.userProfile.userId || ''
      }
      const req: NsContent.IContinueLearningDataReq = {
        request: {
          userId,
          batchId,
          courseId: collectionId,
          contentIds: [],
          fields: ['progressdetails'],
        },
      }
      this.contentSvc.fetchContentHistoryV2(req).subscribe(
        async result => {
          this.contentData = await result['result']['contentList'].find((obj: any) => obj.contentId === identifier)
          const temp = data.current
          console.log("current progress", data)
          const latest = parseFloat(temp[temp.length - 1] || '0')
          const percentMilis = (latest / data.max_size) * 100
          const percent = parseFloat(percentMilis.toFixed(2))
          const data1: any = {
            courseID: this.activatedRoute.snapshot.queryParams.collectionId ?
              this.activatedRoute.snapshot.queryParams.collectionId : this.widgetData.identifier,
            contentId: this.widgetData.identifier,
            name: this.viewerDataSvc.resource!.name,
            moduleId: this.viewerDataSvc.resource!.parent ? this.viewerDataSvc.resource!.parent : undefined,
          }
          this.telemetrySvc.end('video', 'video-close', this.activatedRoute.snapshot.queryParams.collectionId ?
            this.activatedRoute.snapshot.queryParams.collectionId : this.widgetData.identifier, data1)

          if (this.contentData && percent >= this.contentData.completionPercentage) {
            if (this.widgetData.identifier && identifier && data) {
              this.viewerSvc
                .realTimeProgressUpdate(identifier, data, collectionId, batchId).subscribe((data: any) => {

                  const result = data.result
                  result['type'] = 'Video'
                  this.contentSvc.changeMessage(result)
                })
              // this.contentSvc.changeMessage('Video')
            }
          }

          if (this.contentData === undefined && percent > 95) {
            const data1: any = {
              courseID: this.activatedRoute.snapshot.queryParams.collectionId ?
                this.activatedRoute.snapshot.queryParams.collectionId : this.widgetData.identifier,
              contentId: this.widgetData.identifier,
              name: this.viewerDataSvc.resource!.name,
              moduleId: this.viewerDataSvc.resource!.parent ? this.viewerDataSvc.resource!.parent : undefined,
            }
            this.telemetrySvc.end('video', 'video-close', this.activatedRoute.snapshot.queryParams.collectionId ?
              this.activatedRoute.snapshot.queryParams.collectionId : this.widgetData.identifier, data1)

            this.viewerSvc
              .realTimeProgressUpdate(identifier, data, collectionId, batchId).subscribe((data: any) => {

                const result = data.result
                result['type'] = 'Video'
                this.contentSvc.changeMessage(result)
              })
            // this.contentSvc.changeMessage('Video')
          } else {
            if (this.contentData && this.contentData.completionPercentage && percent > 95) {
              const data1: any = {
                courseID: this.activatedRoute.snapshot.queryParams.collectionId ?
                  this.activatedRoute.snapshot.queryParams.collectionId : this.widgetData.identifier,
                contentId: this.widgetData.identifier,
                name: this.viewerDataSvc.resource!.name,
                moduleId: this.viewerDataSvc.resource!.parent ? this.viewerDataSvc.resource!.parent : undefined,
              }
              this.telemetrySvc.end('video', 'video-close', this.activatedRoute.snapshot.queryParams.collectionId ?
                this.activatedRoute.snapshot.queryParams.collectionId : this.widgetData.identifier, data1)

              this.viewerSvc
                .realTimeProgressUpdate(identifier, data, collectionId, batchId).subscribe((data: any) => {

                  const result = data.result
                  result['type'] = 'Video'
                  this.contentSvc.changeMessage(result)
                })
            }
          }

        })
    }

    let enableTelemetry = false
    if (!this.widgetData.disableTelemetry && typeof (this.widgetData.disableTelemetry) !== 'undefined') {
      enableTelemetry = true
    }
    const initObj = videoJsInitializer(
      this.videoTag.nativeElement,
      {
        ...videoJsOptions,
        poster: this.widgetData.posterImage,
        autoplay: this.widgetData.autoplay || false,
      },
      dispatcher,
      saveCLearning,
      fireRProgress,
      this.widgetData.passThroughData,
      ROOT_WIDGET_CONFIG.player.video,
      this.widgetData.resumePoint ? this.widgetData.resumePoint : 0,
      enableTelemetry,
      this.widgetData,
      this.widgetData.mimeType,
    )
    console.log("this.widgetData.resumePoint ", this.widgetData.resumePoint)
    this.player = initObj.player
    this.dispose = initObj.dispose
    initObj.player.ready(() => {
      if (Array.isArray(this.widgetData.subtitles)) {
        this.widgetData.subtitles.forEach((u, index) => {
          initObj.player.addRemoteTextTrack(
            {
              default: index === 0,
              kind: 'captions',
              label: u.label,
              srclang: u.srclang,
              src: u.url,
            },
            false,
          )
        })
      }
      if (this.widgetData.url) {
        initObj.player.src(this.widgetData.url)
      }
    })
  }
  onTimeUpdate() {
    const percentage = (this.videoTag.nativeElement.currentTime / this.videoTag.nativeElement.duration) * 100
    if (this.progressData.completionPercentage < percentage) {
      const data = {
        current: this.videoTag.nativeElement.currentTime,
        max_size: this.videoTag.nativeElement.duration,
        mime_type: this.widgetData.mimeType,
      }

      const collectionId = this.activatedRoute.snapshot.queryParams.collectionId ?
        this.activatedRoute.snapshot.queryParams.collectionId : this.widgetData.identifier
      const batchId = this.activatedRoute.snapshot.queryParams.batchId ?
        this.activatedRoute.snapshot.queryParams.batchId : this.widgetData.identifier
      if (percentage >= 98) {
        data.current = data.max_size
      }
      if (percentage <= 98 && this.widgetData.identifier) {
        this.viewerSvc
          .realTimeProgressUpdate(this.widgetData.identifier, data, collectionId, batchId).subscribe((data: any) => {
            const result = data.result
            result['type'] = 'Video'
            this.contentSvc.changeMessage(result)
          })
      }
    }
  }
  async fetchContent() {
    try {
      const content = await this.contentSvc
        .fetchContent(this.widgetData.identifier || '', 'minimal', [], this.widgetData.primaryCategory)
        .toPromise()

      if (content?.result?.content?.videoQuestions) {
        const videoQuestions = content.result.content.videoQuestions
        console.log("videoQuestions", videoQuestions)

        if (videoQuestions.length > 0) {
          try {
            this.widgetData.videoQuestions = JSON.parse(videoQuestions)
          } catch (error) {
            console.error("Error parsing videoQuestions JSON:", error)
            this.widgetData.videoQuestions = []
          }
        } else {
          this.widgetData.videoQuestions = []
        }
      }

      console.log("this.widgetData.videoQuestions", this.widgetData.videoQuestions)

      if (content.artifactUrl && content.artifactUrl.indexOf('/content-store/') > -1) {
        this.widgetData.url = content.artifactUrl
        this.widgetData.posterImage = content.appIcon
        await this.contentSvc.setS3Cookie(this.widgetData.identifier || '').toPromise()
      }
    } catch (error) {
      console.error("Error fetching content or parsing videoQuestions:", error)
      this.widgetData.videoQuestions = [] // Set to an empty array in case of error
    }
  }
}

