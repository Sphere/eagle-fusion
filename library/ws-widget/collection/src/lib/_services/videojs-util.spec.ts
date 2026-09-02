jest.mock('video.js', () => jest.fn())
jest.mock('@ws-widget/utils', () => ({
  WsEvents: {
    EnumTelemetrySubType: { Loaded: 'Loaded', Unloaded: 'Unloaded', HeartBeat: 'HeartBeat' },
    WsEventType: { Telemetry: 'Telemetry' },
    WsEventLogLevel: { Info: 'Info', Trace: 'Trace' },
    WsTimeSpentType: { Player: 'Player' },
    WsTimeSpentMode: { Play: 'Play' },
    EnumTelemetryMediaActivity: { PLAYED: 'PLAYED', PAUSED: 'PAUSED', ENDED: 'ENDED' },
  },
}))

import videoJs from 'video.js'
import {
  videoJsInitializer,
  videoInitializer,
  youtubeInitializer,
} from './videojs-util'

describe('videojs-util', () => {
  let mockPlayer: any
  let handlers: { [key: string]: (() => void)[] }

  beforeEach(() => {
    jest.clearAllMocks()
    handlers = {}
    mockPlayer = {
      volume: jest.fn(),
      muted: jest.fn(),
      on: jest.fn((event: string, cb: () => void) => {
        handlers[event] = handlers[event] || []
        handlers[event].push(cb)
      }),
      isDisposed: jest.fn().mockReturnValue(false),
      duration: jest.fn().mockReturnValue(100),
      currentTime: jest.fn().mockReturnValue(10),
      playbackRate: jest.fn().mockReturnValue(1),
      paused: jest.fn().mockReturnValue(false),
      ended: jest.fn().mockReturnValue(false),
      readyState: jest.fn().mockReturnValue(0),
      controlBar: {
        progressControl: {
          enable: jest.fn(),
          disable: jest.fn(),
          el: jest.fn().mockReturnValue({ style: {} }),
          seekBar: {
            enable: jest.fn(),
            disable: jest.fn(),
            el: jest.fn().mockReturnValue({ style: {} }),
          },
        },
      },
      markers: jest.fn(),
      tech_: { el_: {} },
    };
    (videoJs as unknown as jest.Mock).mockReturnValue(mockPlayer)
  })

  const fire = (event: string) => {
    (handlers[event] || []).forEach(cb => cb())
  }

  describe('videoJsInitializer', () => {
    const passThroughData = {}
    const widgetData: any = { identifier: 'id1', videoQuestions: null }

    it('creates player, sets volume/muted and returns dispose fn', () => {
      const dispatcher = jest.fn()
      const fireRProgress = jest.fn()
      const result = videoJsInitializer(
        {} as any, {} as any, dispatcher, fireRProgress, passThroughData, 'sub', 0, false, widgetData, 'video/mp4' as any,
      )
      expect(mockPlayer.volume).toHaveBeenCalledWith(0.8)
      expect(mockPlayer.muted).toHaveBeenCalledWith(false)
      expect(result.player).toBe(mockPlayer)
      expect(typeof result.dispose).toBe('function')
    })

    it('logs error via console.error when markers plugin missing and videoQuestions set', () => {
      mockPlayer.markers = undefined
      const errSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined)
      const questionsData: any = {
        identifier: 'id1',
        videoQuestions: [{ timestampInSeconds: 5, question: [{ text: 'q1' }] }],
      }
      videoJsInitializer({} as any, {} as any, jest.fn(), jest.fn(), passThroughData, 'sub', 0, false, questionsData, 'video/mp4' as any)
      expect(errSpy).toHaveBeenCalledWith('Markers plugin is not loaded.')
      errSpy.mockRestore()
    })

    it('calls markers() when plugin available and videoQuestions provided', () => {
      const questionsData: any = {
        identifier: 'id1',
        videoQuestions: [{ timestampInSeconds: 5, question: [{ text: 'q1' }] }],
      }
      videoJsInitializer({} as any, {} as any, jest.fn(), jest.fn(), passThroughData, 'sub', 0, false, questionsData, 'video/mp4' as any)
      expect(mockPlayer.markers).toHaveBeenCalled()
    })

    it('applies resume point immediately when readyState >= 2', () => {
      mockPlayer.readyState.mockReturnValue(2)
      mockPlayer.currentTime = jest.fn()
      videoJsInitializer({} as any, {} as any, jest.fn(), jest.fn(), passThroughData, 'sub', 50, false, widgetData, 'video/mp4' as any)
      expect(mockPlayer.currentTime).toHaveBeenCalledWith(50)
    })

    it('applyResume via loadeddata event handles invalid resumePoint gracefully', () => {
      videoJsInitializer({} as any, {} as any, jest.fn(), jest.fn(), passThroughData, 'sub', NaN as any, false, widgetData, 'video/mp4' as any)
      expect(() => fire('loadeddata')).not.toThrow()
    })

    it('with telemetry enabled: play sets up heartbeat and currentTimeInterval, timeupdate reports progress, pause unsubscribes, ended unsubscribes', () => {
      jest.useFakeTimers()
      const dispatcher = jest.fn()
      const fireRProgress = jest.fn()
      videoJsInitializer({} as any, {} as any, dispatcher, fireRProgress, passThroughData, 'sub', 0, true, widgetData, 'video/mp4' as any, true)

      fire('play')
      expect(dispatcher).toHaveBeenCalled()

      mockPlayer.currentTime.mockReturnValue(20)
      fire('timeupdate')
      expect(fireRProgress).toHaveBeenCalled()

      fire('pause')
      expect(dispatcher).toHaveBeenCalled()

      fire('play')
      fire('ended')
      jest.useRealTimers()
    })

    it('seeking handler blocks forward seek when progress not unlocked and seek restriction enabled', () => {
      const fireRProgress = jest.fn()
      videoJsInitializer({} as any, {} as any, jest.fn(), fireRProgress, passThroughData, 'sub', 0, true, widgetData, 'video/mp4' as any, false)
      mockPlayer.paused.mockReturnValue(false)
      expect(() => fire('seeking')).not.toThrow()
    })

    it('seeking handler allows small delta seek forward', () => {
      const fireRProgress = jest.fn()
      videoJsInitializer({} as any, {} as any, jest.fn(), fireRProgress, passThroughData, 'sub', 10, true, widgetData, 'video/mp4' as any, false)
      fire('play')
      mockPlayer.currentTime.mockReturnValue(15)
      fire('timeupdate')
      mockPlayer.currentTime.mockReturnValue(16)
      fire('seeking')
      expect(() => fire('seeking')).not.toThrow()
    })

    it('seeking while paused blocks forward seek beyond maxWatchedTime', () => {
      videoJsInitializer({} as any, {} as any, jest.fn(), jest.fn(), passThroughData, 'sub', 10, true, widgetData, 'video/mp4' as any, false)
      fire('play')
      mockPlayer.currentTime.mockReturnValue(15)
      fire('timeupdate')
      mockPlayer.paused.mockReturnValue(true)
      mockPlayer.currentTime.mockReturnValue(50)
      fire('seeking')
    })

    it('seeked handler reports progress when not paused and within maxWatchedTime', () => {
      const fireRProgress = jest.fn()
      videoJsInitializer({} as any, {} as any, jest.fn(), fireRProgress, passThroughData, 'sub', 0, true, widgetData, 'video/mp4' as any, true)
      mockPlayer.paused.mockReturnValue(false)
      mockPlayer.currentTime.mockReturnValue(5)
      fire('seeked')
      expect(fireRProgress).toHaveBeenCalled()
    })

    it('seeked handler does nothing while paused', () => {
      videoJsInitializer({} as any, {} as any, jest.fn(), jest.fn(), passThroughData, 'sub', 0, true, widgetData, 'video/mp4' as any)
      mockPlayer.paused.mockReturnValue(true)
      expect(() => fire('seeked')).not.toThrow()
    })

    it('reportProgress handles invalid duration/currentTime gracefully', () => {
      mockPlayer.duration.mockReturnValue(0)
      videoJsInitializer({} as any, {} as any, jest.fn(), jest.fn(), passThroughData, 'sub', 0, true, widgetData, 'video/mp4' as any)
      fire('play')
      expect(() => fire('timeupdate')).not.toThrow()
    })

    it('reportProgress returns early when player disposed', () => {
      videoJsInitializer({} as any, {} as any, jest.fn(), jest.fn(), passThroughData, 'sub', 0, true, widgetData, 'video/mp4' as any)
      fire('play')
      mockPlayer.isDisposed.mockReturnValue(true)
      expect(() => fire('timeupdate')).not.toThrow()
    })

    it('reportProgress returns early when tech layer missing', () => {
      mockPlayer.tech_ = null
      videoJsInitializer({} as any, {} as any, jest.fn(), jest.fn(), passThroughData, 'sub', 0, true, widgetData, 'video/mp4' as any)
      fire('play')
      expect(() => fire('timeupdate')).not.toThrow()
    })

    it('reportProgress catches error thrown while accessing duration/currentTime', () => {
      mockPlayer.duration = jest.fn(() => { throw new Error('boom') })
      videoJsInitializer({} as any, {} as any, jest.fn(), jest.fn(), passThroughData, 'sub', 0, true, widgetData, 'video/mp4' as any)
      fire('play')
      expect(() => fire('timeupdate')).not.toThrow()
    })

    it('dispose unsubscribes heartbeat/currentTimeInterval and dispatches unloaded when loaded', () => {
      jest.useFakeTimers()
      const dispatcher = jest.fn()
      const result = videoJsInitializer({} as any, {} as any, dispatcher, jest.fn(), passThroughData, 'sub', 0, true, widgetData, 'video/mp4' as any)
      fire('play')
      expect(() => result.dispose()).not.toThrow()
      jest.useRealTimers()
    })

    it('dispose is safe with telemetry disabled (no subscriptions)', () => {
      const result = videoJsInitializer({} as any, {} as any, jest.fn(), jest.fn(), passThroughData, 'sub', 0, false, widgetData, 'video/mp4' as any)
      expect(() => result.dispose()).not.toThrow()
    })

    it('fires heartbeat dispatch after 2 minutes of play', () => {
      jest.useFakeTimers()
      const dispatcher = jest.fn()
      videoJsInitializer({} as any, {} as any, dispatcher, jest.fn(), passThroughData, 'sub', 0, true, widgetData, 'video/mp4' as any)
      fire('play')
      jest.advanceTimersByTime(2 * 60000 + 10)
      expect(dispatcher).toHaveBeenCalled()
      jest.useRealTimers()
    })

    it('timeupdate snap-back re-enables progress control after timeout', () => {
      jest.useFakeTimers()
      videoJsInitializer({} as any, {} as any, jest.fn(), jest.fn(), passThroughData, 'sub', 0, true, widgetData, 'video/mp4' as any, false)
      fire('play')
      mockPlayer.currentTime.mockReturnValue(1000)
      fire('timeupdate')
      jest.advanceTimersByTime(400)
      expect(mockPlayer.controlBar.progressControl.enable).toHaveBeenCalled()
      jest.useRealTimers()
    })

    it('timeupdate seek-restriction snap-back path executes without throwing', () => {
      jest.useFakeTimers()
      videoJsInitializer({} as any, {} as any, jest.fn(), jest.fn(), passThroughData, 'sub', 0, true, widgetData, 'video/mp4' as any, false)
      fire('play')
      mockPlayer.currentTime.mockReturnValue(1000)
      expect(() => fire('timeupdate')).not.toThrow()
      jest.useRealTimers()
    })
  })

  describe('videoInitializer', () => {
    const passThroughData = {}
    const widgetData: any = { identifier: 'id1' }

    it('creates player and returns dispose function with telemetry disabled', () => {
      const elem = document.createElement('video')
      const result = videoInitializer(elem, jest.fn(), jest.fn(), passThroughData, 'sub', false, widgetData, 'video/mp4' as any)
      expect(mockPlayer.volume).toHaveBeenCalledWith(0.8)
      expect(typeof result.dispose).toBe('function')
      expect(() => result.dispose()).not.toThrow()
    })

    it('handles play/pause/ended events with telemetry enabled', () => {
      jest.useFakeTimers()
      const elem = document.createElement('video')
      Object.defineProperty(elem, 'currentTime', { value: 1, writable: true })
      Object.defineProperty(elem, 'duration', { value: 100, writable: true })
      const dispatcher = jest.fn()
      const fireRProgress = jest.fn()
      const result = videoInitializer(elem, dispatcher, fireRProgress, passThroughData, 'sub', true, widgetData, 'video/mp4' as any)

      elem.dispatchEvent(new Event('play'))
      expect(dispatcher).toHaveBeenCalled()
      jest.advanceTimersByTime(600)

      elem.dispatchEvent(new Event('pause'))
      elem.dispatchEvent(new Event('play'))
      elem.dispatchEvent(new Event('ended'))

      result.dispose()
      jest.useRealTimers()
    })
  })

  describe('youtubeInitializer', () => {
    let ytPlayerInstance: any
    let onStateChangeCb: (event: any) => void

    beforeEach(() => {
      ytPlayerInstance = {
        getCurrentTime: jest.fn().mockReturnValue(10),
        getDuration: jest.fn().mockReturnValue(100),
      };
      (window as any).YT = {
        Player: jest.fn().mockImplementation((_elem: any, opts: any) => {
          onStateChangeCb = opts.events.onStateChange
          return ytPlayerInstance
        }),
        PlayerState: { PLAYING: 1, PAUSED: 2, ENDED: 0 },
      }
    })

    afterEach(() => {
      delete (window as any).YT
    })

    it('creates a YT.Player and returns dispose function', () => {
      const result = youtubeInitializer(
        document.createElement('div'), 'yt123', jest.fn(), jest.fn(), {}, 'sub', false, { identifier: 'id1' } as any, 'video/mp4' as any, '400px',
      )
      expect((window as any).YT.Player).toHaveBeenCalled()
      expect(typeof result.dispose).toBe('function')
    })

    it('handles PLAYING/PAUSED/ENDED state changes with telemetry enabled', () => {
      jest.useFakeTimers()
      const dispatcher = jest.fn()
      const fireRProgress = jest.fn()
      const result = youtubeInitializer(
        document.createElement('div'), 'yt123', dispatcher, fireRProgress, {}, 'sub', true, { identifier: 'id1' } as any, 'video/mp4' as any, '400px',
      )

      onStateChangeCb({ data: (window as any).YT.PlayerState.PLAYING })
      expect(dispatcher).toHaveBeenCalled()
      jest.advanceTimersByTime(600)

      onStateChangeCb({ data: (window as any).YT.PlayerState.PAUSED })
      onStateChangeCb({ data: (window as any).YT.PlayerState.PLAYING })
      onStateChangeCb({ data: (window as any).YT.PlayerState.ENDED })

      result.dispose()
      jest.useRealTimers()
    })

    it('fires progress when currentTime crosses 95% threshold', () => {
      jest.useFakeTimers()
      const fireRProgress = jest.fn()
      ytPlayerInstance.getCurrentTime.mockReturnValue(10)
      youtubeInitializer(
        document.createElement('div'), 'yt123', jest.fn(), fireRProgress, {}, 'sub', true, { identifier: 'id1' } as any, 'video/mp4' as any, '400px',
      )
      onStateChangeCb({ data: (window as any).YT.PlayerState.PLAYING })
      jest.advanceTimersByTime(600)
      ytPlayerInstance.getCurrentTime.mockReturnValue(96)
      jest.advanceTimersByTime(600)
      expect(fireRProgress).toHaveBeenCalled()
      jest.useRealTimers()
    })
  })
})
