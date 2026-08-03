import videoJs from 'video.js'
import { Subscription, interval, fromEvent } from 'rxjs'
import { WsEvents } from '@ws-widget/utils'
import { ROOT_WIDGET_CONFIG } from '../collection.config'
import { IWidgetsPlayerMediaData } from '../_models/player-media.model'
import { NsContent } from './widget-content.model'

export const videojsEventNames = {
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
  loadedmetadata: 'loadedmetadata',
  seeking: 'seeking',
}
export type telemetryEventDispatcherFunction = (e: any) => void
export type saveContinueLearningFunction = (d: any) => void
export type fireRealTimeProgressFunction = (i: string, d: any) => void

function eventDispatchHelper(
  passThroughData: any,
  dispatcher: telemetryEventDispatcherFunction,
  state: WsEvents.EnumTelemetrySubType,
  data: IWidgetsPlayerMediaData,
  widgetSubType: string,
  playerState: string,
  mimeT: string,
) {
  if (state === WsEvents.EnumTelemetrySubType.Loaded || state === WsEvents.EnumTelemetrySubType.Unloaded) {
    const event = {
      eventType: WsEvents.WsEventType.Telemetry,
      eventLogLevel: WsEvents.WsEventLogLevel.Info,
      from: {
        widgetSubType,
        type: 'widget',
        widgetType: ROOT_WIDGET_CONFIG.player._type,
      },
      to: '',
      data: {
        state,
        passThroughData,
        type: WsEvents.WsTimeSpentType.Player,
        mode: WsEvents.WsTimeSpentMode.Play,
        identifier: data.identifier,
        playerStatus: playerState,
        mimeType: mimeT,
      },
    }
    dispatcher(event)
  }
  if (state === WsEvents.EnumTelemetrySubType.HeartBeat) {
    const heartBeatEvent = {
      eventType: WsEvents.WsEventType.Telemetry,
      eventLogLevel: WsEvents.WsEventLogLevel.Trace,
      from: {
        widgetSubType,
        type: 'widget',
        widgetType: ROOT_WIDGET_CONFIG.player._type,
      },
      to: '',
      data: {
        identifier: data.identifier,
        eventSubType: WsEvents.EnumTelemetrySubType.HeartBeat,
        mimeType: mimeT,
        mode: WsEvents.WsTimeSpentMode.Play,
        type: WsEvents.WsTimeSpentType.Player,
      },
    }
    dispatcher(heartBeatEvent)
  }
}

function generateEventDispatcherHelper(
  passThroughData: any,
  dispatcher: any,
  widgetSubType: string,
) {
  return (
    eventType: WsEvents.EnumTelemetrySubType,
    widgetData: IWidgetsPlayerMediaData,
    playerState: WsEvents.EnumTelemetryMediaActivity,
    mimeType: NsContent.EMimeTypes,
  ) => {
    eventDispatchHelper(
      passThroughData,
      dispatcher,
      eventType,
      widgetData,
      widgetSubType,
      playerState,
      mimeType,
    )
  }
}
function fireRealTimeProgress(
  mimeT: string,
  widgetData: IWidgetsPlayerMediaData,
  fireRProgress: fireRealTimeProgressFunction,
  cTime: number,
  dTime: number,
) {
  const data = {
    content_type: 'Resource',
    current: [cTime.toString()],
    max_size: dTime,
    mime_type: mimeT,
    user_id_type: 'uuid',
  }
  if (widgetData.identifier) {
    fireRProgress(widgetData.identifier, data)
  }
}

// ==========================================
// 🎯 VIDEO PLAYBACK STATE — bundled so the event handlers below can be plain
// module-level functions (keeps each handler's branching out of
// videoJsInitializer's own cognitive complexity) while still sharing state.
// ==========================================
interface VideoPlaybackState {
  heartBeatSubscription: Subscription | null
  currentTimeInterval: Subscription | null
  loaded: boolean
  currTime: number
  maxWatchedTime: number
  seekRestrictionEnabled: boolean
  progressUnlocked: boolean
  lastKnownTime: number
  lastReportedBoundary: number // Track last 5% boundary reported (0, 5, 10, 15...)
}

// 🔥 CRITICAL: Defensive player validity checks — prevents "Cannot read
// properties of null" errors from a disposed/uninitialized player.
function isVideoPlayerUsable(player: any): boolean {
  if (!player) {
    console.warn("[Progress] Player is null")
    return false
  }
  if (player.isDisposed && player.isDisposed()) {
    console.warn("[Progress] Player disposed")
    return false
  }
  if (!player.tech_ || !player.tech_.el_) {
    console.warn("[Progress] Player tech unavailable")
    return false
  }
  if (
    typeof player.duration !== "function" ||
    typeof player.currentTime !== "function"
  ) {
    console.warn("[Progress] Player methods unavailable")
    return false
  }
  return true
}

function getSafeVideoPlayerTimes(player: any): { duration: number; currentTime: number } | null {
  try {
    return { duration: player.duration(), currentTime: player.currentTime() }
  } catch (err) {
    console.warn("[Progress] Error accessing player time:", err)
    return null
  }
}

// ==========================================
// 🎯 SINGLE SOURCE OF TRUTH: reportVideoProgress()
// ==========================================
function reportVideoProgress(
  player: any,
  state: VideoPlaybackState,
  mimeType: NsContent.EMimeTypes,
  widgetData: IWidgetsPlayerMediaData,
  fireRProgress: fireRealTimeProgressFunction,
  source = "timeupdate",
): void {
  try {
    if (!isVideoPlayerUsable(player)) {
      return
    }

    const times = getSafeVideoPlayerTimes(player)
    if (!times) {
      return
    }
    const { duration, currentTime } = times

    if (
      !duration ||
      Number.isNaN(Number(duration)) ||
      duration <= 0 ||
      Number.isNaN(Number(currentTime)) ||
      currentTime < 0
    ) {
      return
    }

    const currentPercentage = (currentTime / duration) * 100

    // Math.floor for strict 5% boundaries
    const currentBoundary = Math.floor(currentPercentage / 5) * 5
    const clampedBoundary = Math.max(0, Math.min(100, currentBoundary))

    // Monotonic check: only forward progress
    if (clampedBoundary > state.lastReportedBoundary) {
      state.lastReportedBoundary = clampedBoundary
      state.currTime = currentTime

      console.log(
        `[Progress] ${source} | Boundary: ${clampedBoundary}% | ` +
        `Time: ${currentTime.toFixed(2)}s/${duration.toFixed(2)}s | ` +
        `Speed: ${player.playbackRate()}x | Raw: ${currentPercentage.toFixed(
          2
        )}%`
      )

      fireRealTimeProgress(
        mimeType,
        widgetData,
        fireRProgress,
        currentTime,
        duration
      )
    } else if (clampedBoundary < state.lastReportedBoundary) {
      console.log(
        `[Progress] ${source} | Backward seek detected: ` +
        `${clampedBoundary}% < ${state.lastReportedBoundary}% (skipping duplicate fire)`
      )
    }
  } catch (err) {
    console.error("[Progress] Error:", err)
  }
}

function enableVideoProgressControl(player: any): void {
  player?.controlBar?.progressControl?.enable()
  const progressEl = player?.controlBar?.progressControl?.el()
  if (progressEl) {
    (progressEl as HTMLElement).style.pointerEvents = "auto";
    (progressEl as HTMLElement).style.cursor = "pointer"
  }
  const seekBar = player?.controlBar?.progressControl?.seekBar
  seekBar?.enable()

  if (seekBar?.el()) {
    const el = seekBar.el() as HTMLElement
    el.style.pointerEvents = "auto"
    el.style.cursor = "pointer"
  }
}

function disableVideoProgressControl(player: any): void {
  const progressControl = player?.controlBar?.progressControl
  const seekBar = progressControl?.seekBar

  progressControl?.disable()
  seekBar?.disable()

  if (seekBar?.el()) {
    const el = seekBar.el() as HTMLElement
    el.style.pointerEvents = "none"
    el.style.cursor = "default"
  }
}

// Resume from saved position — must work regardless of telemetry setting
// Handle both cases: loadeddata not yet fired, or already fired (src in template)
function applyVideoResumePoint(player: any, resumePoint: number): void {
  try {
    if (resumePoint) {
      const start = Number(resumePoint)
      if (!Number.isNaN(Number(start)) && start > 0) {
        player.currentTime(start)
      }
    }
  } catch (err) { /* ignore resume-point seek failure, playback continues from start */ }
}

function handleVideoEnded(
  player: any,
  state: VideoPlaybackState,
  eventDispatcher: (eventType: any, widgetData: any, playerState: any, mimeType: any) => void,
  widgetData: IWidgetsPlayerMediaData,
  mimeType: NsContent.EMimeTypes,
  fireRProgress: fireRealTimeProgressFunction,
): void {
  if (!state.loaded) {
    return
  }
  reportVideoProgress(player, state, mimeType, widgetData, fireRProgress, "ended")
  eventDispatcher(WsEvents.EnumTelemetrySubType.Unloaded, widgetData, WsEvents.EnumTelemetryMediaActivity.ENDED, mimeType)
  state.loaded = false
  state.heartBeatSubscription?.unsubscribe()
  state.currentTimeInterval?.unsubscribe()
}

function handleVideoPlay(
  player: any,
  state: VideoPlaybackState,
  eventDispatcher: (eventType: any, widgetData: any, playerState: any, mimeType: any) => void,
  widgetData: IWidgetsPlayerMediaData,
  mimeType: NsContent.EMimeTypes,
  fireRProgress: fireRealTimeProgressFunction,
): void {
  if (!state.loaded) {
    eventDispatcher(WsEvents.EnumTelemetrySubType.Loaded, widgetData, WsEvents.EnumTelemetryMediaActivity.PLAYED, mimeType)
    state.heartBeatSubscription = interval(2 * 60000).subscribe(_ => {
      eventDispatcher(WsEvents.EnumTelemetrySubType.HeartBeat, widgetData, WsEvents.EnumTelemetryMediaActivity.PLAYED, mimeType)
    })
    state.loaded = true
  }
  state.currentTimeInterval = interval(500).subscribe(_ => {
    const currPercentage = (player.currentTime() / player.duration()) * 100
    const roundedPercentage = Math.round(currPercentage / 5) * 5
    if (roundedPercentage !== state.currTime) {
      state.currTime = roundedPercentage
      fireRealTimeProgress(mimeType, widgetData, fireRProgress, player.currentTime(), player.duration())
    }
  })
}

// ==========================================
// 🎯 SINGLE DRIVER: timeupdate
// This is the ONLY place progress is tracked during playback
// Fires naturally at appropriate rate for all playback speeds
// ==========================================
function handleVideoTimeUpdate(
  player: any,
  state: VideoPlaybackState,
  mimeType: NsContent.EMimeTypes,
  widgetData: IWidgetsPlayerMediaData,
  fireRProgress: fireRealTimeProgressFunction,
): void {
  try {
    const currentTime = player.currentTime()
    state.lastKnownTime = currentTime
    //  Only enforce frontier snap-back if restriction is ON
    if (state.seekRestrictionEnabled) {
      const playbackRate = player.playbackRate() || 1
      const dynamicBuffer = playbackRate * 1.5
      if (currentTime > state.maxWatchedTime + dynamicBuffer) {
        player.currentTime(state.maxWatchedTime)
        disableVideoProgressControl(player)
        setTimeout(() => enableVideoProgressControl(player), 300)
        return
      }
    }
    if (!player.paused() && !player.ended()) {
      if (currentTime > state.maxWatchedTime) {
        state.maxWatchedTime = currentTime
      }
      if (state.seekRestrictionEnabled && !state.progressUnlocked) {
        enableVideoProgressControl(player)
        state.progressUnlocked = true
      }
      reportVideoProgress(player, state, mimeType, widgetData, fireRProgress, "timeupdate")
    }
  } catch (err) {
    console.error("[Player] Error in timeupdate:", err)
  }
}

// ==========================================
// 🎯 SEEKED: Only for seek detection
// Reports progress immediately after user seeks
// Monotonic check prevents backward seek duplicates
// ==========================================
function handleVideoSeeking(player: any, state: VideoPlaybackState): void {
  try {
    if (!player || player.isDisposed?.()) return
    if (!state.seekRestrictionEnabled) return
    if (!state.progressUnlocked) {
      console.log(
        "[Seek Block] Playback not started yet — blocking seek"
      )
      player.currentTime(state.maxWatchedTime) // snap back to 0
      return
    }
    const seekTarget = player.currentTime()
    const delta = Math.abs(seekTarget - state.lastKnownTime)
    if (player.paused()) {
      const seekTarget = player.currentTime()
      if (seekTarget > state.maxWatchedTime) {
        console.log("[Seek Block] Forward seek blocked while paused")
        player.currentTime(state.maxWatchedTime)
        disableVideoProgressControl(player)
        setTimeout(() => enableVideoProgressControl(player), 300)
      }
      return
    }
    const buffer = 1 // 1 second tolerance to avoid flickering at boundary
    if (delta <= 10.5) {
      if (seekTarget > state.maxWatchedTime) {
        state.maxWatchedTime = seekTarget
      }
      // Tap backward → always allow (seekTarget < lastKnownTime)
      return
    }
    if (seekTarget > state.maxWatchedTime + buffer) {
      player.currentTime(state.maxWatchedTime)
    }
  } catch (err) {
    console.error("[Seek Block] Error:", err)
  }
}

function handleVideoSeeked(
  player: any,
  state: VideoPlaybackState,
  mimeType: NsContent.EMimeTypes,
  widgetData: IWidgetsPlayerMediaData,
  fireRProgress: fireRealTimeProgressFunction,
): void {
  try {
    const seekedTo = player.currentTime()
    if (player.paused()) return
    console.log(`[Player] Seeked to: ${seekedTo}s`)
    if (!state.seekRestrictionEnabled || seekedTo <= state.maxWatchedTime) {
      reportVideoProgress(player, state, mimeType, widgetData, fireRProgress, "seeked")
    }
  } catch (err) {
    console.error("[Player] Error in seeked:", err)
  }
}

function handleVideoPause(
  player: any,
  state: VideoPlaybackState,
  eventDispatcher: (eventType: any, widgetData: any, playerState: any, mimeType: any) => void,
  widgetData: IWidgetsPlayerMediaData,
  mimeType: NsContent.EMimeTypes,
  fireRProgress: fireRealTimeProgressFunction,
): void {
  if (state.loaded) {
    reportVideoProgress(player, state, mimeType, widgetData, fireRProgress, "pause")
    eventDispatcher(WsEvents.EnumTelemetrySubType.Unloaded, widgetData, WsEvents.EnumTelemetryMediaActivity.PAUSED, mimeType)
    state.loaded = false
    state.heartBeatSubscription?.unsubscribe()
    state.currentTimeInterval?.unsubscribe()
  }
  state.currTime = player.currentTime()
}

export function videoJsInitializer(
  elem: HTMLVideoElement | HTMLAudioElement,
  config: videoJs.PlayerOptions,
  dispatcher: telemetryEventDispatcherFunction,
  fireRProgress: fireRealTimeProgressFunction,
  passThroughData: any,
  widgetSubType: string,
  resumePoint = 0,
  enableTelemetry: boolean,
  widgetData: any,
  mimeType: NsContent.EMimeTypes,
  isSeekingEnable?: boolean
): { player: videoJs.Player; dispose: () => void } {
  const player: any = videoJs(elem, config)
  player.volume(0.8) // Set default volume to 80%
  player.muted(false) // Ensure video is not muted

  marker(widgetData, player)
  const eventDispatcher = enableTelemetry
    ? generateEventDispatcherHelper(passThroughData, dispatcher, widgetSubType)
    : () => undefined
  const readyToRaise = false

  const state: VideoPlaybackState = {
    heartBeatSubscription: null,
    currentTimeInterval: null,
    loaded: false,
    currTime: 0,
    maxWatchedTime: resumePoint || 0,
    seekRestrictionEnabled: !isSeekingEnable,
    progressUnlocked: resumePoint > 0,
    lastKnownTime: resumePoint || 0,
    lastReportedBoundary: -1, // Track last 5% boundary reported (0, 5, 10, 15...)
  }

  player.on(videojsEventNames.loadeddata, () => applyVideoResumePoint(player, resumePoint))

  // If the video data is already loaded (src was set in the template), seek immediately
  if (player.readyState() >= 2 && resumePoint) {
    applyVideoResumePoint(player, resumePoint)
  }

  if (enableTelemetry) {
    player.on(videojsEventNames.ended, () => handleVideoEnded(player, state, eventDispatcher, widgetData, mimeType, fireRProgress))
    player.on(videojsEventNames.play, () => handleVideoPlay(player, state, eventDispatcher, widgetData, mimeType, fireRProgress))
    player.on("timeupdate", () => handleVideoTimeUpdate(player, state, mimeType, widgetData, fireRProgress))
    player.on(videojsEventNames.seeking, () => handleVideoSeeking(player, state))
    player.on(videojsEventNames.seeked, () => handleVideoSeeked(player, state, mimeType, widgetData, fireRProgress))
    player.on(videojsEventNames.pause, () => handleVideoPause(player, state, eventDispatcher, widgetData, mimeType, fireRProgress))
  }
  const dispose = () => {
    if (state.heartBeatSubscription) {
      state.heartBeatSubscription.unsubscribe()
    }
    if (state.currentTimeInterval) {
      state.currentTimeInterval.unsubscribe()
    }
    if (state.loaded) {
      eventDispatcher(WsEvents.EnumTelemetrySubType.Unloaded, widgetData, WsEvents.EnumTelemetryMediaActivity.ENDED, mimeType)
    }
    if (readyToRaise) {
      fireRealTimeProgress(mimeType, widgetData, fireRProgress, state.currTime, player.duration())
    }
  }
  return { player, dispose }
}
export function videoInitializer(
  elem: HTMLVideoElement,
  dispatcher: telemetryEventDispatcherFunction,
  fireRProgress: fireRealTimeProgressFunction,
  passThroughData: any,
  widgetSubType: string,
  enableTelemetry: boolean,
  widgetData: any,
  mimeType: NsContent.EMimeTypes,
): { dispose: () => void } {
  const player = videoJs(elem)
  player.volume(0.8) // Set default volume to 80%
  player.muted(false) // Ensure video is not muted

  marker(widgetData, player)

  const eventDispatcher = enableTelemetry
    ? generateEventDispatcherHelper(passThroughData, dispatcher, widgetSubType)
    : () => undefined
  let heartBeatSubscription: Subscription
  let currentTimeInterval: Subscription
  let playSubscription: Subscription
  let pauseSubscription: Subscription
  let endedSubscription: Subscription
  let loaded = false
  let readyToRaise = false
  let currTime = 0
  if (enableTelemetry) {
    playSubscription = fromEvent(elem, 'play').subscribe(() => {
      if (!loaded) {
        eventDispatcher(WsEvents.EnumTelemetrySubType.Loaded, widgetData, WsEvents.EnumTelemetryMediaActivity.PLAYED, mimeType)
        heartBeatSubscription = interval(2 * 60000).subscribe(_ => {
          eventDispatcher(WsEvents.EnumTelemetrySubType.HeartBeat, widgetData, WsEvents.EnumTelemetryMediaActivity.PLAYED, mimeType)
        })
        loaded = true
      }
      currentTimeInterval = interval(500).subscribe(_ => {
        if (elem.currentTime >= elem.duration * 5 / 100 && elem.currentTime < elem.duration * 95 / 100
          && !readyToRaise) {
          readyToRaise = true
        }
        if (elem.currentTime >= elem.duration * 95 / 100 && readyToRaise) {
          fireRealTimeProgress(mimeType, widgetData, fireRProgress, elem.currentTime, elem.duration)
          readyToRaise = false
        }
        currTime = elem.currentTime
      })
    })
    pauseSubscription = fromEvent(elem, 'pause').subscribe(() => {
      if (loaded) {
        eventDispatcher(WsEvents.EnumTelemetrySubType.Unloaded, widgetData, WsEvents.EnumTelemetryMediaActivity.PAUSED, mimeType)
        loaded = false
        heartBeatSubscription.unsubscribe()
        currentTimeInterval.unsubscribe()
      }
      currTime = elem.currentTime
    })
    endedSubscription = fromEvent(elem, 'ended').subscribe(() => {
      if (loaded) {
        eventDispatcher(WsEvents.EnumTelemetrySubType.Unloaded, widgetData, WsEvents.EnumTelemetryMediaActivity.ENDED, mimeType)
        loaded = false
        heartBeatSubscription.unsubscribe()
        currentTimeInterval.unsubscribe()
      }
    })
  }
  const dispose = () => {
    if (heartBeatSubscription) {
      heartBeatSubscription.unsubscribe()
    }
    if (currentTimeInterval) {
      currentTimeInterval.unsubscribe()
    }
    if (loaded) {
      eventDispatcher(WsEvents.EnumTelemetrySubType.Unloaded, widgetData, WsEvents.EnumTelemetryMediaActivity.ENDED, mimeType)
    }
    if (readyToRaise) {
      fireRealTimeProgress(mimeType, widgetData, fireRProgress, currTime, elem.duration)
    }
    if (playSubscription) {
      playSubscription.unsubscribe()
    }
    if (pauseSubscription) {
      pauseSubscription.unsubscribe()
    }
    if (endedSubscription) {
      endedSubscription.unsubscribe()
    }
  }
  return { dispose }
}

export function youtubeInitializer(
  elem: HTMLElement,
  youtubeId: string,
  dispatcher: telemetryEventDispatcherFunction,
  fireRProgress: fireRealTimeProgressFunction,
  passThroughData: any,
  widgetSubType: string,
  enableTelemetry: boolean,
  widgetData: IWidgetsPlayerMediaData,
  mimeType: NsContent.EMimeTypes,
  screenHeight: string,
): { dispose: () => void } {
  const yHeight = screenHeight
  const player = new (<any>window).YT.Player(elem, {
    videoId: youtubeId,
    width: '100%',
    height: yHeight,
    playerVars: {
      autoplay: 0,
      modestbranding: 0,
      showInfo: 0,
    },
    events: {
      onStateChange: (event: any) => {
        onPlayerStateChange(event)
      },
    },
  })
  const eventDispatcher = enableTelemetry
    ? generateEventDispatcherHelper(passThroughData, dispatcher, widgetSubType)
    : () => undefined
  let heartBeatSubscription: Subscription
  let currentTimeInterval: Subscription
  let loaded = false
  let readyToRaise = false
  let currTime = 0
  const onPlayerStateChange = (event: any) => {
    switch (event.data) {
      case (<any>window).YT.PlayerState.PLAYING:
        if (!loaded) {
          eventDispatcher(WsEvents.EnumTelemetrySubType.Loaded, widgetData, WsEvents.EnumTelemetryMediaActivity.PLAYED, mimeType)
          heartBeatSubscription = interval(2 * 60000).subscribe(_ => {
            eventDispatcher(WsEvents.EnumTelemetrySubType.HeartBeat, widgetData, WsEvents.EnumTelemetryMediaActivity.PLAYED, mimeType)
          })
          loaded = true
        }
        currentTimeInterval = interval(500).subscribe(_ => {
          if (player.getCurrentTime() >= player.getDuration() * 5 / 100 && player.getCurrentTime() < player.getDuration() * 95 / 100
            && !readyToRaise) {
            readyToRaise = true
          }
          if (player.getCurrentTime() >= player.getDuration() * 95 / 100 && readyToRaise) {
            fireRealTimeProgress(mimeType, widgetData, fireRProgress, player.getCurrentTime(), player.getDuration())
            readyToRaise = false
          }
          currTime = player.getCurrentTime()
        })
        break
      case (<any>window).YT.PlayerState.PAUSED:
        if (loaded) {
          eventDispatcher(WsEvents.EnumTelemetrySubType.Unloaded, widgetData, WsEvents.EnumTelemetryMediaActivity.PAUSED, mimeType)
          loaded = false
          heartBeatSubscription.unsubscribe()
          currentTimeInterval.unsubscribe()
        }
        currTime = player.getCurrentTime()
        break
      case (<any>window).YT.PlayerState.ENDED:
        if (loaded) {
          eventDispatcher(WsEvents.EnumTelemetrySubType.Unloaded, widgetData, WsEvents.EnumTelemetryMediaActivity.ENDED, mimeType)
          loaded = false
          heartBeatSubscription.unsubscribe()
          currentTimeInterval.unsubscribe()
        }
        break
    }
  }
  const dispose = () => {
    if (heartBeatSubscription) {
      heartBeatSubscription.unsubscribe()
    }
    if (currentTimeInterval) {
      currentTimeInterval.unsubscribe()
    }
    if (loaded) {
      eventDispatcher(WsEvents.EnumTelemetrySubType.Unloaded, widgetData, WsEvents.EnumTelemetryMediaActivity.ENDED, mimeType)
    }
    if (readyToRaise) {
      fireRealTimeProgress(mimeType, widgetData, fireRProgress, currTime, player.getDuration())
    }
  }
  return { dispose }
}
function marker(widgetData: any, player: any) {
  if (widgetData.videoQuestions) {
    const markers = convertData(widgetData.videoQuestions)
    if (player.markers) {
      player.markers({
        markerStyle: {
          width: '8px',
          'background-color': 'yellow',
        },
        markerTip: {
          display: true,
          text: function () {
            return "Quiz"
          },
        },
        markers: markers,
      })
    } else {
      console.error('Markers plugin is not loaded.')
    }
  }
}
function convertData(data: any[]): { time: number, text: string }[] {
  return data.map(item => {
    return {
      time: item.timestampInSeconds,
      text: item.question[0].text,
    }
  })
}