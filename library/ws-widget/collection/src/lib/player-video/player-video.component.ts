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
  // saveContinueLearningFunction,
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
  private contentHistoryResponse: any = null  // Cache full progress response for messaging
  private lastSentProgressPercentage = -1  // Track last sent progress to avoid duplicates
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
  isResumeStarted = false
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


  ngAfterViewInit(): void {
    this.getCurrentTime().then(() => {
      // console.log("Initial resume point:", this.widgetData.resumePoint)

      this.widgetData = {
        ...this.widgetData,
      }

      this.fetchContent().then(() => {
        console.log("this.widgetData.videoQuestions", this.widgetData)

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
      })
    })
  }


  async getCurrentTime() {
    let userId
    if (this.configSvc.userProfile) {
      userId = this.configSvc.userProfile.userId || ''
    }
    const batchId = this.activatedRoute.snapshot.queryParams.batchId ?? this.widgetData.identifier
    const req: NsContent.IContinueLearningDataReq = {
      request: {
        userId,
        batchId,
        courseId: this.activatedRoute.snapshot.queryParams.collectionId ?? '',
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
      autoplay: this.widgetData.autoplay ?? false,
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
    // const saveCLearning: saveContinueLearningFunction = data => {
    //   if (this.widgetData.identifier) {
    //     if (this.activatedRoute.snapshot.queryParams.collectionType &&
    //       this.activatedRoute.snapshot.queryParams.collectionType.toLowerCase() === 'playlist') {
    //       const continueLearningData = {
    //         contextPathId: this.activatedRoute.snapshot.queryParams.collectionId ?? this.widgetData.identifier,
    //         resourceId: data.resourceId,
    //         contextType: 'playlist',
    //         dateAccessed: Date.now(),
    //         data: JSON.stringify({
    //           progress: data.progress,
    //           timestamp: Date.now(),
    //           contextFullPath: [this.activatedRoute.snapshot.queryParams.collectionId, data.resourceId],
    //         }),
    //       }
    //       this.contentSvc
    //         .saveContinueLearning(continueLearningData)
    //         .toPromise()
    //         .catch()
    //     } else {
    //       const continueLearningData = {
    //         contextPathId: this.activatedRoute.snapshot.queryParams.collectionId ?? this.widgetData.identifier,
    //         ...data,
    //         // resourceId: data.resourceId,
    //         // dateAccessed: Date.now(),
    //         // data: data.data,
    //       }
    //       // JSON.stringify({
    //       //   progress: data.progress,
    //       //   timestamp: Date.now(),
    //       // }),
    //       this.contentSvc
    //         .saveContinueLearning(continueLearningData)
    //         .toPromise()
    //         .catch()
    //     }
    //   }
    // }
    const fireRProgress: fireRealTimeProgressFunction = (identifier, data) => {
      const collectionId = this.activatedRoute.snapshot.queryParams.collectionId ?? this.widgetData.identifier
      const batchId = this.activatedRoute.snapshot.queryParams.batchId ?? this.widgetData.identifier
      if (this.widgetData.identifier) {
        // Call the API but don't block on response - v3 doesn't return contentList
        this.viewerSvc
          .realTimeProgressUpdateV3(identifier, data, collectionId, batchId)
          .subscribe(
            () => {
              console.log('VPlayer progress update sent successfully', { identifier })
            },
            (error) => {
              console.error('VPlayer progress update error:', { identifier, error })
            }
          )
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
      // saveCLearning,
      fireRProgress,
      this.widgetData.passThroughData,
      ROOT_WIDGET_CONFIG.player.video,
      enableTelemetry,
      this.widgetData,
      this.widgetData.mimeType,
    ).dispose
  }

  private initializePlayer() {
    const collectionId = this.activatedRoute.snapshot.queryParams.collectionId ?? this.widgetData.identifier
    const batchId = this.activatedRoute.snapshot.queryParams.batchId ?? this.widgetData.identifier
    console.log("initializePlayer")

    // **CRITICAL**: Pre-fetch and cache content history before player ready
    // This ensures fireRProgress has complete data on first call to prevent minimal fallback
    this.fetchAndCacheContentHistory(this.widgetData.identifier, batchId, collectionId).catch(err => {
      console.warn('Initial cache fetch failed, fireRProgress will fetch on demand:', err)
    })

    const dispatcher: telemetryEventDispatcherFunction = event => {
      if (this.widgetData.identifier) {
        this.eventSvc.dispatchEvent(event)
      }
    }
    // const saveCLearning: saveContinueLearningFunction = data => {
    //   if (this.widgetData.identifier && data) {
    //     if (this.activatedRoute.snapshot.queryParams.collectionType &&
    //       this.activatedRoute.snapshot.queryParams.collectionType.toLowerCase() === 'playlist') {
    //       // const continueLearningData = {
    //       //   contextPathId: this.activatedRoute.snapshot.queryParams.collectionId ?
    //       //     this.activatedRoute.snapshot.queryParams.collectionId : this.widgetData.identifier,
    //       //   resourceId: data.resourceId,
    //       //   contextType: 'playlist',
    //       //   dateAccessed: Date.now(),
    //       //   data: JSON.stringify({
    //       //     progress: data.progress,
    //       //     timestamp: Date.now(),
    //       //     contextFullPath: [this.activatedRoute.snapshot.queryParams.collectionId, data.resourceId],
    //       //   }),
    //       // }
    //       // this.contentSvc
    //       //   .saveContinueLearning(continueLearningData)
    //       //   .toPromise()
    //       //   .catch()
    //     } else {
    //       // const continueLearningData = {
    //       //   contextPathId: this.activatedRoute.snapshot.queryParams.collectionId
    //       //     ? this.activatedRoute.snapshot.queryParams.collectionId
    //       //     : this.widgetData.identifier,
    //       //   ...data,
    //       //   // resourceId: data.resourceId,
    //       //   // dateAccessed: Date.now(),
    //       //   // data: JSON.stringify({
    //       //   //   progress: data.progress,
    //       //   //   timestamp: Date.now(),
    //       //   // }),
    //       // }
    //       // this.contentSvc
    //       //   .saveContinueLearning(continueLearningData)
    //       //   .toPromise()
    //       //   .catch()
    //     }
    //   }
    // }
    const fireRProgress: fireRealTimeProgressFunction = async (identifier, data) => {
      try {
        // Ensure we have contentHistoryResponse - fetch if needed
        if (!this.contentHistoryResponse || !this.contentHistoryResponse.contentList || this.contentHistoryResponse.contentList.length === 0) {
          await this.fetchAndCacheContentHistory(identifier, batchId, collectionId)
        }

        // **CRITICAL**: If resource is already 100% complete, don't send lower percentages on replay
        // Initialize lastSentProgressPercentage from cached completion if it's 100%
        if (this.lastSentProgressPercentage === -1 && this.contentHistoryResponse) {
          const cachedItem = this.contentHistoryResponse.contentList.find((item: any) => item.contentId === identifier)
          if (cachedItem && cachedItem.completionPercentage === 100) {
            // Already marked complete - set tracking to 100 to prevent sending lower percentages
            this.lastSentProgressPercentage = 100
            console.log('Resource already 100% complete, skipping progress updates for replay', { identifier })
            return
          }
        }

        // Calculate progress percentage
        const temp = data.current
        const latest = parseFloat(temp[temp.length - 1] ?? '0')
        const percentMilis = (latest / data.max_size) * 100
        let percent = parseFloat(percentMilis.toFixed(2))

        // **CRITICAL: Force 100% for video near completion to ensure full green tick**
        // Use 95% threshold to catch values like 97.9% that are essentially complete
        if (percent >= 95) {
          percent = 100
          data.current = data.max_size
        }

        // Prevent duplicate updates (only skip if exact same percentage sent)
        if (percent === this.lastSentProgressPercentage) {
          console.log('Exact same progress, skipping duplicate', { percent })
          return
        }

        // Prevent backwards progress
        if (percent < this.lastSentProgressPercentage) {
          console.log('Progress decreased, skipping', { percent, lastSent: this.lastSentProgressPercentage })
          return
        }

        // Send update for every 5% milestone (5, 10, 15, 20... 100)
        const currentMilestone = Math.floor(percent / 5) * 5
        const lastMilestone = Math.floor(this.lastSentProgressPercentage / 5) * 5

        // Check if we've reached a new 5% milestone
        const isNewMilestone = currentMilestone > lastMilestone
        const isCompletion = percent === 100
        const isFirstProgress = this.lastSentProgressPercentage === -1 && percent > 0

        if (isNewMilestone || isCompletion || isFirstProgress) {
          console.log('Sending progress update at milestone', { percent, milestone: currentMilestone, isNewMilestone, isCompletion, isFirstProgress })
          await this.updateVideoProgress(identifier, data, percent, collectionId, batchId)
        }
      } catch (error) {
        console.error('Error in fireRProgress:', error)
      }
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
        autoplay: this.widgetData.autoplay ?? false,
      },
      dispatcher,
      // saveCLearning,
      fireRProgress,
      this.widgetData.passThroughData,
      ROOT_WIDGET_CONFIG.player.video,
      this.widgetData.resumePoint ?? 0,
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
  async onTimeUpdate() {
    try {
      const percentage = (this.videoTag.nativeElement.currentTime / this.videoTag.nativeElement.duration) * 100

      // Ensure we have contentHistoryResponse - fetch if needed
      const collectionId = this.activatedRoute.snapshot.queryParams.collectionId ?? this.widgetData.identifier
      const batchId = this.activatedRoute.snapshot.queryParams.batchId ?? this.widgetData.identifier

      if (!this.contentHistoryResponse || !this.contentHistoryResponse.contentList || this.contentHistoryResponse.contentList.length === 0) {
        await this.fetchAndCacheContentHistory(this.widgetData.identifier, batchId, collectionId)
      }

      if (this.progressData && this.progressData.completionPercentage < percentage) {
        const data = {
          current: this.videoTag.nativeElement.currentTime,
          max_size: this.videoTag.nativeElement.duration,
          mime_type: this.widgetData.mimeType,
        }

        // Prevent duplicate updates and backwards progress
        if (percentage <= this.lastSentProgressPercentage) {
          console.log('Progress not increased, skipping update', { percentage, lastSent: this.lastSentProgressPercentage })
          return
        }

        // Ensure 100% is sent for video completion
        let finalPercentage = percentage
        if (percentage >= 95) {  // Lower threshold to catch near-completion values like 97.9%
          data.current = data.max_size
          finalPercentage = 100  // Force 100% for completion
        }

        // Update progress on video
        if (finalPercentage >= 95 && this.widgetData.identifier) {
          // Video is finished, ensure 100% is sent
          await this.updateVideoProgress(this.widgetData.identifier, data, 100, collectionId, batchId)
        } else if (this.widgetData.identifier) {
          // Regular progress update
          await this.updateVideoProgress(this.widgetData.identifier, data, finalPercentage, collectionId, batchId)
        }
      }
    } catch (error) {
      console.error('Error in onTimeUpdate:', error)
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

  onEventTrigger(event: 'start' | 'pause' | 'end') {
    if (event === 'start') {
      if (!this.isResumeStarted) {
        this.isResumeStarted = true
        this.onVideoPlay()
      } else {
        this.onVideoPause('start')
      }
    } else if (event === 'pause') {
      this.onVideoPause('pause')
    } else if (event === 'end') {
      this.onVideoEnded()
    }
  }

  onVideoPlay() {
    console.log("Video play event")
    this.telemetrySvc.start("video/mp4", 'start', 'player', {
      "id": this.widgetData.identifier,
      "type": "video/mp4",
      "version": "",
      "rollup": {
        "l1": this.activatedRoute.snapshot.queryParams.collectionId ?? this.widgetData.identifier,
        "l2": this.widgetData.identifier
      }
    })
  }

  onVideoPause(event: string) {
    console.log("Video pause event")
    this.telemetrySvc.interact('video/mp4', event, 'player', {
      id: this.widgetData.identifier,
      type: 'video/mp4',
      version: '',
      rollup: {
        l1: this.activatedRoute.snapshot.queryParams.collectionId ?? this.widgetData.identifier,
        l2: this.widgetData.identifier,
      },
    })
  }

  onVideoEnded() {
    console.log("Video ended event")
    this.telemetrySvc.end('video/mp4', 'ended', 'player', {
      id: this.widgetData.identifier,
      type: 'video/mp4',
      version: '',
      rollup: {
        l1: this.activatedRoute.snapshot.queryParams.collectionId ?? this.widgetData.identifier,
        l2: this.widgetData.identifier,
      },
    })
  }

  /**
   * Fetch and cache content history with full response for progress messaging
   * **CRITICAL**: This ensures TOC always receives complete data structure with all required fields
   */
  private async fetchAndCacheContentHistory(identifier: string, batchId: string | undefined, collectionId: string): Promise<void> {
    return new Promise((resolve) => {
      let userId
      if (this.configSvc.userProfile) {
        userId = this.configSvc.userProfile.userId || ''
      }
      const req: NsContent.IContinueLearningDataReq = {
        request: {
          userId,
          batchId: batchId || undefined,  // Ensure batchId is included if available
          courseId: collectionId,
          // **CRITICAL**: Do NOT filter by contentIds - fetch FULL course contentList with all resources
          // This ensures TOC receives complete context, not just the single video item
          contentIds: [],  // Empty array = fetch entire course contentList
          // **CRITICAL**: Remove fields filter to get COMPLETE response with completionPercentage
          // Without this, other items won't have completionPercentage and will default to 0
          fields: [],  // Empty = get all fields including completionPercentage, batchId, courseId, etc.
        },
      }
      this.contentSvc.fetchContentHistoryV2(req).subscribe(
        data => {
          if (data && data['result']) {
            // Store full response for later messaging to TOC
            this.contentHistoryResponse = data['result']
            // Cache single item contentData
            if (data['result']['contentList'] && data['result']['contentList'].length > 0) {
              this.contentData = data['result']['contentList'].find((obj: any) => obj.contentId === identifier)
              console.log('✓ Cached complete content history:', {
                identifier,
                hasContentList: !!this.contentHistoryResponse.contentList,
                itemCount: this.contentHistoryResponse.contentList?.length
              })
            }
          }
          resolve()
        },
        error => {
          console.error('Error fetching content history:', error)
          resolve()
        }
      )
    })
  }

  /**
   * Update video progress and send message to TOC
   */
  private async updateVideoProgress(identifier: string, data: any, percent: number, collectionId: string, batchId: string | undefined): Promise<void> {
    try {
      // **CRITICAL**: Determine status based on completion percentage
      // Status: 0 = not started, 1 = in progress, 2 = completed
      const status = percent === 100 ? 2 : percent > 0 ? 1 : 0

      // **CRITICAL**: Add completionPercentage to data object BEFORE API call
      // This ensures the server receives and stores the correct percentage value
      const dataWithCompletion = {
        ...data,
        completionPercentage: percent,
        status: status,
      }

      this.viewerSvc.realTimeProgressUpdateV3(identifier, dataWithCompletion, collectionId, batchId).subscribe(
        async (response: any) => {
          try {
            console.log('Video progress update successful:', { identifier, percent, status, calcPercent: (data.current / data.max_size * 100).toFixed(2) })
            console.log("message passed", response)
            // Priority 1: Use cached contentHistoryResponse if available (most reliable)
            if (this.contentHistoryResponse && this.contentHistoryResponse.contentList && this.contentHistoryResponse.contentList.length > 0) {
              // **CRITICAL**: Ensure ALL items have completionPercentage field (never undefined)
              // This prevents TOC's updateKeyIfMatch from wiping out existing values
              const updatedContentList = this.contentHistoryResponse.contentList.map((item: any) => {
                if (item.contentId === identifier) {
                  // **CRITICAL**: When 100% completion, always set status to 2 (completed)
                  // This ensures template condition for green checkmark passes
                  const finalStatus = percent === 100 ? 2 : status
                  return {
                    ...item,
                    completionPercentage: percent,
                    status: finalStatus,
                    // **CRITICAL**: Ensure other fields are preserved
                    batchId: item.batchId,
                    courseId: item.courseId,
                    lastAccessTime: new Date().toISOString(),
                  }
                } else {
                  return {
                    ...item,
                    // **CRITICAL**: Preserve existing completionPercentage for non-video items
                    // This ensures updateKeyIfMatch doesn't overwrite with undefined
                    completionPercentage: item.completionPercentage ?? 0,
                    status: item.status ?? 0,
                  }
                }
              })
              const messageData = { ...this.contentHistoryResponse, contentList: updatedContentList, type: 'Video' }
              console.log('Sending cached data to TOC:', { percent, contentId: identifier, completionPercentage: percent, itemCount: updatedContentList.length, hasAllFields: updatedContentList.every((i: any) => i.completionPercentage !== undefined) })
              this.viewerSvc.generateInteractTelemetry('progress-update-success', { contentId: identifier, completionPercentage: percent, status, mimeType: 'video/mp4', batchId: batchId || '' })
              console.log("messageDData1111", messageData)
              this.contentSvc.changeMessage(messageData)
              this.lastSentProgressPercentage = percent
              return
            }

            // Priority 2: Use API response contentList if available (more complete than minimal)
            if (response && response.result && response.result.contentList && response.result.contentList.length > 0) {
              // **CRITICAL**: Update status for the matching item in API response
              // Ensure consistency: status should be 1 for in-progress (0-100%), 2 for completed (100%)
              const updatedContentList = response.result.contentList.map((item: any) => {
                if (item.contentId === identifier) {
                  return {
                    ...item,
                    completionPercentage: percent,
                    status: status,  // Use calculated status (1 for in-progress, 2 for completion)
                  }
                }
                return item
              })
              const messageData = { ...response.result, contentList: updatedContentList, type: 'Video' }
              console.log('Sending API response data to TOC:', { percent, itemCount: updatedContentList.length })
              this.viewerSvc.generateInteractTelemetry('progress-update-success', { contentId: identifier, completionPercentage: percent, status, mimeType: 'video/mp4', batchId: batchId || '' })
              console.log("messageDData2222", messageData)
              this.contentSvc.changeMessage(messageData)
              this.lastSentProgressPercentage = percent
              return
            }

            // Priority 3: Only create minimal structure if we truly have no cached data
            // **CRITICAL**: This should be rare - prefer cached/API response for complete data structure
            console.warn('WARNING: Using minimal fallback structure - TOC may lose complete progress data', { identifier, percent })
            const messageData = {
              contentList: [{
                contentId: identifier,
                completionPercentage: percent,
                status: status
              }],
              type: 'Video'
            }
            this.viewerSvc.generateInteractTelemetry('progress-update-success', { contentId: identifier, completionPercentage: percent, status, mimeType: 'video/mp4', batchId: batchId || '' })
            console.log("messageDData3333", messageData)
            this.contentSvc.changeMessage(messageData)
            this.lastSentProgressPercentage = percent
          } catch (error) {
            console.error('Error processing progress update response:', error)
            // Even on error, ensure lastSentProgressPercentage is updated to prevent loop
            this.lastSentProgressPercentage = percent
          }
        },
        error => {
          console.error('Error updating video progress API call:', error)
          // Still update tracking even on API error to prevent infinite retry
          this.lastSentProgressPercentage = percent
          // Send telemetry of error but don't block progress
          this.viewerSvc.generateInteractTelemetry('progress-update-error', { contentId: identifier, error: error.message, batchId: batchId || '' })
        }
      )
    } catch (error) {
      console.error('Error in updateVideoProgress:', error)
    }
  }
}

