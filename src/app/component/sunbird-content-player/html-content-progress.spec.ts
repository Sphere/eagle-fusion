import {
  initialArchiveProgress, milestonesFor, progressUpdateFor,
  reduceArchiveProgress,
} from './html-content-progress'
import { IPlayerTelemetryEvent } from './content-player.util'

const player = (eid: string, edata: any = {}, ets = 1000): IPlayerTelemetryEvent => ({ source: 'player', eid, edata, ets })
const pkg = (eid: string, edata: any = {}): IPlayerTelemetryEvent => ({ source: 'package', eid, edata, ets: 1000 })
const run = (...events: IPlayerTelemetryEvent[]) => events.reduce(reduceArchiveProgress, initialArchiveProgress())

describe('html-content-progress', () => {
  it('starts empty', () => {
    expect(initialArchiveProgress()).toEqual(expect.objectContaining({ status: 'not-started', playerProgress: 0, scorePct: null }))
  })

  it('START marks a running session at 50%', () => {
    const s = run(player('START', {}, 5000))
    expect(s).toEqual(expect.objectContaining({ status: 'in-progress', playerProgress: 50, sessions: 1, sessionStartedAt: 5000 }))
  })

  it('END with progress 100 completes and adds the duration', () => {
    const s = run(player('START'), player('END', { duration: 12.5, summary: [{ progress: 100 }, { endpageseen: true }] }))
    expect(s).toEqual(expect.objectContaining({ status: 'completed', playerProgress: 100, timeSpentSec: 12.5, sessionStartedAt: null }))
  })

  it('END below 100 marks the session incomplete; a missing summary counts as 100', () => {
    expect(run(player('START'), player('END', { summary: [{ progress: 50 }] })).status).toBe('incomplete')
    expect(run(player('START'), player('END', {})).playerProgress).toBe(100)
  })

  it('counts heartbeats only', () => {
    const s = run(player('INTERACT', { type: 'HEARTBEAT' }), player('INTERACT', { type: 'TOUCH' }), player('IMPRESSION'))
    expect(s.heartbeats).toBe(1)
  })

  it('tracks package videos, answers and the final score', () => {
    const s = run(
      player('START'),
      pkg('VIDEO_START', { section: 's1' }), pkg('VIDEO_START', { section: 's1' }), pkg('VIDEO_START', {}),
      pkg('ASSESS', { correct: true }), pkg('ASSESS', { correct: false }),
      pkg('UNKNOWN'),
    )
    expect(s).toEqual(expect.objectContaining({ videosStarted: ['s1'], answered: 2, correct: 1, scorePct: null }))
    const done = reduceArchiveProgress(s, pkg('ASSESS_END', { correct: 6, asked: 8, pct: 75 }))
    expect(done).toEqual(expect.objectContaining({ answered: 8, correct: 6, scorePct: 75 }))
    const partial = reduceArchiveProgress(s, pkg('ASSESS_END', {}))
    expect(partial).toEqual(expect.objectContaining({ answered: 2, correct: 0, scorePct: null }))
  })

  it('a replay resets package counters but stays completed', () => {
    const s = run(
      player('START'), pkg('ASSESS', { correct: true }), pkg('ASSESS_END', { correct: 1, asked: 1, pct: 100 }),
      player('END', { summary: [{ progress: 100 }] }), player('START'),
    )
    expect(s).toEqual(expect.objectContaining({ status: 'completed', sessions: 2, answered: 0, correct: 0, scorePct: null }))
  })

  describe('package-reported progress', () => {
    const moduleStart = pkg('MODULE_START', { units: 11, sections: [{ id: 's1', questions: 2 }, { id: 's2', questions: 3 }, { bad: 1 }] })

    it('MODULE_START announces units and sections', () => {
      const s = run(player('START'), moduleStart)
      expect(s.units).toBe(11)
      expect(s.status).toBe('in-progress')
      expect(s.sections).toEqual([
        { id: 's1', questions: 2, video: 'pending', watchedPct: 0, correct: 0, asked: 0, done: false },
        { id: 's2', questions: 3, video: 'pending', watchedPct: 0, correct: 0, asked: 0, done: false },
      ])
      expect(run(pkg('MODULE_START', {})).sections).toEqual([])
      expect(run(pkg('MODULE_START', { units: 'x' })).units).toBe(0)
    })

    it('PROGRESS records the percentage and every 10% mark reached, clamped to 0..100', () => {
      const s = run(moduleStart, pkg('PROGRESS', { pct: 27 }), pkg('PROGRESS', { pct: 45 }))
      expect(s.contentProgress).toBe(45)
      expect(s.milestones).toEqual([10, 20, 30, 40])
      expect(run(moduleStart, pkg('PROGRESS', { pct: 140 }))).toEqual(expect.objectContaining({ contentProgress: 100, status: 'completed' }))
      expect(run(moduleStart, pkg('PROGRESS', { pct: 'x' })).contentProgress).toBe(0)
    })

    it('milestones stay reached when progress drops within a session', () => {
      const s = run(moduleStart, pkg('PROGRESS', { pct: 55 }), pkg('PROGRESS', { pct: 18 }))
      expect(s.milestones).toEqual([10, 20, 30, 40, 50])
    })

    it('VIDEO_END and SECTION_END fill the section rows', () => {
      const s = run(
        moduleStart,
        pkg('VIDEO_END', { section: 's1', watchedPct: 100, skipped: false }),
        pkg('VIDEO_END', { section: 's2', skipped: true }),
        pkg('SECTION_END', { section: 's1', correct: 1, asked: 2 }),
        pkg('SECTION_END', { section: 's2' }),
      )
      expect(s.sections[0]).toEqual(expect.objectContaining({ video: 'watched', watchedPct: 100, correct: 1, asked: 2, done: true }))
      expect(s.sections[1]).toEqual(expect.objectContaining({ video: 'skipped', watchedPct: 0, correct: 0, asked: 0, done: true }))
    })

    it('the player END is incomplete when the package stopped short of 100%', () => {
      const s = run(player('START'), moduleStart, pkg('PROGRESS', { pct: 73 }), player('END', { summary: [{ progress: 100 }] }))
      expect(s.status).toBe('incomplete')
      expect(s.playerProgress).toBe(100)
    })

    it('a player START or replay MODULE_START clears package progress but keeps the structure', () => {
      const played = run(moduleStart, pkg('PROGRESS', { pct: 64 }), pkg('VIDEO_END', { section: 's1', watchedPct: 100 }))
      const replay = reduceArchiveProgress(played, player('START'))
      expect(replay).toEqual(expect.objectContaining({ contentProgress: 0, milestones: [] }))
      expect(replay.sections.map(sec => sec.video)).toEqual(['pending', 'pending'])
      const restarted = reduceArchiveProgress(played, moduleStart)
      expect(restarted.contentProgress).toBe(0)
    })

    it('completion is kept once reached', () => {
      const s = run(moduleStart, pkg('PROGRESS', { pct: 100 }), player('END', {}), moduleStart)
      expect(s.status).toBe('completed')
    })

    it('milestonesFor lists each 10% mark at or below the value', () => {
      expect(milestonesFor(9)).toEqual([])
      expect(milestonesFor(27)).toEqual([10, 20])
      expect(milestonesFor(100)).toHaveLength(10)
    })
  })

  it('counts blocked skip-ahead attempts and clears them on restart', () => {
    const s = run(pkg('SEEK_BLOCKED', { section: 's1', from: 3, to: 60 }), pkg('SEEK_BLOCKED', {}))
    expect(s.seeksBlocked).toBe(2)
    expect(reduceArchiveProgress(s, pkg('MODULE_START', { units: 1 })).seeksBlocked).toBe(0)
  })

  describe('player lifecycle fallback (content sends no progress)', () => {
    it('splash:hide starts, content:end completes at 100%', () => {
      const opened = run(player('START'), player('renderer:splash:hide'))
      expect(opened.status).toBe('in-progress')
      const ended = reduceArchiveProgress(opened, player('renderer:content:end'))
      expect(ended).toEqual(expect.objectContaining({ status: 'completed', playerProgress: 100 }))
    })

    it('content:close before the end is incomplete; after completion it stays completed', () => {
      expect(run(player('START'), player('renderer:splash:hide'), player('renderer:content:close'))).toEqual(
        expect.objectContaining({ status: 'incomplete', sessionStartedAt: null }))
      expect(run(player('START'), player('renderer:content:end'), player('renderer:content:close')).status).toBe('completed')
      expect(run(player('START'), player('renderer:content:end'), player('renderer:splash:hide')).status).toBe('completed')
    })

    it('with package progress, content:end completes only at 100% content progress', () => {
      const mod = pkg('MODULE_START', { units: 11, sections: [] })
      expect(run(player('START'), mod, pkg('PROGRESS', { pct: 73 }), player('renderer:content:end')).status).toBe('incomplete')
      expect(run(player('START'), mod, pkg('PROGRESS', { pct: 100 }), player('renderer:content:end')).status).toBe('completed')
    })

    it('ignores the other lifecycle events for progress', () => {
      const s = run(player('START'))
      expect(reduceArchiveProgress(s, player('renderer:telemetry:end'))).toEqual(s)
      expect(reduceArchiveProgress(s, player('renderer:launch:html'))).toEqual(s)
    })
  })

  describe('choosing the progress source', () => {
    it('uses the player until the content reports progress', () => {
      expect(run(player('START')).contentReportsProgress).toBe(false)
      expect(run(player('START'), pkg('MODULE_START', { units: 4 })).contentReportsProgress).toBe(true)
    })

    it('PROGRESS alone (no MODULE_START) is enough to switch to content progress', () => {
      const s = run(player('START'), pkg('PROGRESS', { pct: 40 }))
      expect(s).toEqual(expect.objectContaining({ contentReportsProgress: true, units: 0, contentProgress: 40 }))
      expect(reduceArchiveProgress(s, player('renderer:content:end')).status).toBe('incomplete')
      expect(reduceArchiveProgress(s, player('END', { summary: [{ progress: 100 }] })).status).toBe('incomplete')
    })

    it('other package events do not switch the source', () => {
      expect(run(player('START'), pkg('ASSESS', { correct: true }), pkg('VIDEO_START', {})).contentReportsProgress).toBe(false)
    })
  })

  describe('progressUpdateFor (what to save)', () => {
    const step = (state: any, event: IPlayerTelemetryEvent) => [state, reduceArchiveProgress(state, event)] as const

    it('saves the first start as in progress', () => {
      const [prev, next] = step(initialArchiveProgress(), player('START'))
      expect(progressUpdateFor(prev, next)).toEqual({ current: 0, max_size: 100, completionPercentage: 0, status: 1 })
    })

    it('saves each new 10% milestone once', () => {
      const started = run(player('START'), pkg('MODULE_START', { units: 11 }))
      const [p1, n1] = step(started, pkg('PROGRESS', { pct: 27 }))
      expect(progressUpdateFor(p1, n1)).toEqual({ current: 20, max_size: 100, completionPercentage: 20, status: 1 })
      const [p2, n2] = step(n1, pkg('PROGRESS', { pct: 28 }))
      expect(progressUpdateFor(p2, n2)).toBeNull()
    })

    it('saves completion as status 2 at 100%', () => {
      const started = run(player('START'), pkg('MODULE_START', { units: 11 }), pkg('PROGRESS', { pct: 91 }))
      const [prev, next] = step(started, pkg('PROGRESS', { pct: 100 }))
      expect(progressUpdateFor(prev, next)).toEqual({ current: 100, max_size: 100, completionPercentage: 100, status: 2 })
    })

    it('content without progress events completes on the player end', () => {
      const started = run(player('START'), player('renderer:splash:hide'))
      const [prev, next] = step(started, player('renderer:content:end'))
      expect(progressUpdateFor(prev, next)?.status).toBe(2)
    })

    it('saves nothing for other events or a replay start', () => {
      const started = run(player('START'))
      expect(progressUpdateFor(started, reduceArchiveProgress(started, player('INTERACT', { type: 'HEARTBEAT' })))).toBeNull()
      expect(progressUpdateFor(started, reduceArchiveProgress(started, player('START')))).toBeNull()
    })
  })
})
