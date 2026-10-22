import { IPlayerTelemetryEvent } from './content-player.util'

/** `incomplete`: the player ended before the package reported 100%. */
export type TArchiveProgressStatus = 'not-started' | 'in-progress' | 'completed' | 'incomplete'
export type TVideoState = 'pending' | 'watched' | 'skipped'

/** One section of the package, as announced by MODULE_START and filled in as the learner goes. */
export interface IArchiveSection {
  id: string
  questions: number
  video: TVideoState
  watchedPct: number
  correct: number
  asked: number
  done: boolean
}

/** Progress summary built from the content-player and package telemetry, for the demo panel. */
export interface IArchiveProgress {
  status: TArchiveProgressStatus
  /** Player-reported progress: the html launcher only knows 50 (playing) and 100 (ended). */
  playerProgress: number
  /** Package-reported progress (PROGRESS.pct): units completed out of `units`. */
  contentProgress: number
  /** Units the package announced in MODULE_START; 0 when the package does not report its structure. */
  units: number
  /**
   * True once the content sent MODULE_START or PROGRESS. Then progress and completion follow the content;
   * otherwise they fall back to the player's own events (start, END, renderer:content:end).
   */
  contentReportsProgress: boolean
  /** 10% marks the content progress has reached, ascending */
  milestones: number[]
  sections: IArchiveSection[]
  /** Seconds, from the END events of finished sessions */
  timeSpentSec: number
  /** ets of the running session's START, or null between sessions */
  sessionStartedAt: number | null
  sessions: number
  heartbeats: number
  /** Attempts to jump past the furthest point played in a video (SEEK_BLOCKED) */
  seeksBlocked: number
  /** Package sections whose video started (VIDEO_START) */
  videosStarted: string[]
  answered: number
  correct: number
  /** From the package's ASSESS_END */
  scorePct: number | null
}

export const MAX_EVENT_LOG = 100
export const MILESTONE_STEP = 10
export const MILESTONES = Array.from({ length: 100 / MILESTONE_STEP }, (_, i) => (i + 1) * MILESTONE_STEP)

/** Package-side counters, cleared whenever the package (re)starts. */
function freshPackageProgress(): Pick<IArchiveProgress,
  'contentProgress' | 'milestones' | 'videosStarted' | 'answered' | 'correct' | 'scorePct' | 'seeksBlocked'> {
  return { contentProgress: 0, milestones: [], videosStarted: [], answered: 0, correct: 0, scorePct: null, seeksBlocked: 0 }
}

export function initialArchiveProgress(): IArchiveProgress {
  return {
    status: 'not-started',
    playerProgress: 0,
    units: 0,
    contentReportsProgress: false,
    sections: [],
    timeSpentSec: 0,
    sessionStartedAt: null,
    sessions: 0,
    heartbeats: 0,
    ...freshPackageProgress(),
  }
}

/** Every 10% mark at or below pct, e.g. 27 -> [10, 20]. */
export function milestonesFor(pct: number): number[] {
  return MILESTONES.filter(m => m <= pct)
}

function endProgress(edata: { [key: string]: any }): number {
  const fromSummary = Array.isArray(edata.summary) ? edata.summary.find((s: any) => typeof s?.progress === 'number') : undefined
  return fromSummary?.progress ?? 100
}

function newSection(id: string, questions: number): IArchiveSection {
  return { id, questions, video: 'pending', watchedPct: 0, correct: 0, asked: 0, done: false }
}

function resetSections(sections: IArchiveSection[]): IArchiveSection[] {
  return sections.map(s => newSection(s.id, s.questions))
}

function updateSection(state: IArchiveProgress, id: string, patch: Partial<IArchiveSection>): IArchiveSection[] {
  return state.sections.map(s => (s.id === id ? { ...s, ...patch } : s))
}

function reducePlayerEvent(state: IArchiveProgress, event: IPlayerTelemetryEvent): IArchiveProgress {
  switch (event.eid) {
    case 'START':
      // A replay opens a new session; the package restarts, so its counters restart too.
      return {
        ...state,
        ...freshPackageProgress(),
        status: state.status === 'completed' ? 'completed' : 'in-progress',
        playerProgress: Math.max(state.playerProgress, 50),
        sections: resetSections(state.sections),
        sessionStartedAt: event.ets,
        sessions: state.sessions + 1,
      }
    case 'END': {
      const progress = endProgress(event.edata)
      // When the package reports its own progress, that decides completion, not the player's 100.
      const finished = state.contentReportsProgress ? state.contentProgress >= 100 : progress >= 100
      return {
        ...state,
        status: state.status === 'completed' || finished ? 'completed' : 'incomplete',
        playerProgress: Math.max(state.playerProgress, progress),
        timeSpentSec: state.timeSpentSec + (Number(event.edata.duration) || 0),
        sessionStartedAt: null,
      }
    }
    case 'INTERACT':
      return event.edata.type === 'HEARTBEAT' ? { ...state, heartbeats: state.heartbeats + 1 } : state
    // Player lifecycle: the progress signal for content that sends no progress of its own.
    case 'renderer:splash:hide':
      return { ...state, status: state.status === 'completed' ? 'completed' : 'in-progress' }
    case 'renderer:content:end': {
      const finished = state.contentReportsProgress ? state.contentProgress >= 100 : true
      return {
        ...state,
        status: state.status === 'completed' || finished ? 'completed' : 'incomplete',
        playerProgress: 100,
      }
    }
    case 'renderer:content:close':
      return {
        ...state,
        status: state.status === 'completed' ? 'completed' : 'incomplete',
        sessionStartedAt: null,
      }
    default:
      return state
  }
}

function reducePackageEvent(state: IArchiveProgress, event: IPlayerTelemetryEvent): IArchiveProgress {
  const { edata } = event
  switch (event.eid) {
    case 'MODULE_START': {
      const sections: IArchiveSection[] = (Array.isArray(edata.sections) ? edata.sections : [])
        .filter((s: any) => typeof s?.id === 'string')
        .map((s: any) => newSection(s.id, Number(s.questions) || 0))
      return {
        ...state,
        ...freshPackageProgress(),
        status: state.status === 'completed' ? 'completed' : 'in-progress',
        units: Number(edata.units) || 0,
        contentReportsProgress: true,
        sections,
      }
    }
    case 'PROGRESS': {
      const pct = Math.min(100, Math.max(0, Number(edata.pct) || 0))
      const reached = new Set([...state.milestones, ...milestonesFor(pct)])
      return {
        ...state,
        contentProgress: pct,
        contentReportsProgress: true,
        milestones: MILESTONES.filter(m => reached.has(m)),
        status: pct >= 100 ? 'completed' : state.status,
      }
    }
    case 'VIDEO_START':
      return edata.section && !state.videosStarted.includes(edata.section)
        ? { ...state, videosStarted: [...state.videosStarted, edata.section] }
        : state
    case 'VIDEO_END':
      return {
        ...state,
        sections: updateSection(state, edata.section, {
          video: edata.skipped ? 'skipped' : 'watched',
          watchedPct: Number(edata.watchedPct) || 0,
        }),
      }
    case 'SEEK_BLOCKED':
      return { ...state, seeksBlocked: state.seeksBlocked + 1 }
    case 'ASSESS':
      return { ...state, answered: state.answered + 1, correct: state.correct + (edata.correct ? 1 : 0) }
    case 'SECTION_END':
      return {
        ...state,
        sections: updateSection(state, edata.section, {
          correct: Number(edata.correct) || 0,
          asked: Number(edata.asked) || 0,
          done: true,
        }),
      }
    case 'ASSESS_END':
      return {
        ...state,
        answered: Number(edata.asked) || state.answered,
        correct: Number(edata.correct) || 0,
        scorePct: typeof edata.pct === 'number' ? edata.pct : state.scorePct,
      }
    default:
      return state
  }
}

export function reduceArchiveProgress(state: IArchiveProgress, event: IPlayerTelemetryEvent): IArchiveProgress {
  return event.source === 'player' ? reducePlayerEvent(state, event) : reducePackageEvent(state, event)
}

/** Seconds spent so far, including the running session. */
export function elapsedSeconds(state: IArchiveProgress, now: number): number {
  const running = state.sessionStartedAt === null ? 0 : Math.max(0, (now - state.sessionStartedAt) / 1000)
  return Math.round(state.timeSpentSec + running)
}

/** One-line label for the event log: INTERACT shows its type (HEARTBEAT, TOUCH). */
export function eventLabel(event: IPlayerTelemetryEvent): string {
  return event.eid === 'INTERACT' && event.edata.type ? `INTERACT · ${event.edata.type}` : event.eid
}

/** Compact detail for the event log. */
export function eventDetail(event: IPlayerTelemetryEvent): string {
  const { edata } = event
  if (event.source === 'player' && event.eid === 'END') {
    return `progress ${endProgress(edata)}%, ${Number(edata.duration || 0).toFixed(1)}s`
  }
  if (event.source === 'player' && event.eid === 'START') {
    return `load ${Number(edata.duration || 0).toFixed(1)}s`
  }
  // id and type are already shown by the label; empty strings are noise (HEARTBEAT carries several)
  const rest = Object.fromEntries(
    Object.entries(edata).filter(([key, value]) => key !== 'id' && key !== 'type' && value !== '' && value !== undefined),
  )
  const text = Object.keys(rest).length ? JSON.stringify(rest) : ''
  return text.length > 120 ? `${text.slice(0, 117)}...` : text
}

/** 75 -> "1:15", 3725 -> "1:02:05" */
export function formatDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = String(s % 60).padStart(2, '0')
  return h ? `${h}:${String(m).padStart(2, '0')}:${sec}` : `${m}:${sec}`
}

/** Body for the standard progress update (ViewerUtilService.realTimeProgressUpdateV3). */
export interface IHtmlContentProgressUpdate {
  current: number
  max_size: number
  completionPercentage: number
  /** 1 = in progress, 2 = completed */
  status: 1 | 2
}

/**
 * Decides whether a progress change is worth saving: on the first start, at each new 10% milestone and
 * on completion. Returns null otherwise, so the server gets about ten updates per content, not one per event.
 */
export function progressUpdateFor(prev: IArchiveProgress, next: IArchiveProgress): IHtmlContentProgressUpdate | null {
  const update = (pct: number, status: 1 | 2): IHtmlContentProgressUpdate =>
    ({ current: pct, max_size: 100, completionPercentage: pct, status })
  if (next.status === 'completed' && prev.status !== 'completed') {
    return update(100, 2)
  }
  if (next.contentReportsProgress && next.milestones.length > prev.milestones.length) {
    return update(next.milestones.at(-1) ?? next.contentProgress, 1)
  }
  if (!prev.sessions && next.sessions) {
    return update(next.contentReportsProgress ? next.contentProgress : 0, 1)
  }
  return null
}
