/**
 * Save and resume for HTML content: where the learner left off is the package's last STATE snapshot.
 * It is kept on the server in the content's progress record (progressdetails.htmlState) for the logged-in
 * user, the course and the batch, like the SCORM adapter keeps cmi.suspend_data.
 */
/** At most one server save per this interval for position-only changes (milestones save at once). */
export const SAVE_STATE_EVERY_MS = 15000

export interface IResumeFromHistory {
  state: unknown
  completionPercentage: number
}

/**
 * Reads the saved snapshot from a fetchContentHistoryV2 response. progressdetails (and htmlState inside it)
 * can arrive as a JSON string or as an object depending on the environment, so both are accepted.
 */
export function resumeFromHistory(history: any, contentId: string): IResumeFromHistory | null {
  const list = history?.result?.contentList
  const entry = Array.isArray(list) ? list.find((c: any) => c?.contentId === contentId) : undefined
  if (!entry) {
    return null
  }
  const details = parseMaybeJson(entry.progressdetails)
  const state = parseMaybeJson(details?.htmlState)
  return { state: state ?? null, completionPercentage: Number(entry.completionPercentage) || 0 }
}

function parseMaybeJson(value: unknown): any {
  if (typeof value !== 'string') {
    return value ?? null
  }
  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

/**
 * True when the learner moved to a new step since the last saved snapshot: another section, screen
 * (video/question), question, or one more answer or watched video. Such a snapshot is saved at once;
 * a snapshot that only moved the video time waits for the throttle. Saves made while the page unloads
 * are often cancelled by the browser, so each step is saved when it happens rather than at the end.
 */
export function isStepChange(previous: unknown, next: unknown): boolean {
  const a = previous as any
  const b = next as any
  if (!b || typeof b !== 'object') {
    return false
  }
  if (!a || typeof a !== 'object') {
    return true
  }
  const size = (m: unknown) => (m && typeof m === 'object' ? Object.keys(m as object).length : 0)
  return a.si !== b.si || a.qi !== b.qi || a.phase !== b.phase
    || size(a.answeredQs) !== size(b.answeredQs) || size(a.watched) !== size(b.watched)
}

/** Throttles position-only saves; `force` (milestone, completion, leaving) always saves. */
export class ResumeSaveThrottle {
  private lastSavedAt = 0

  constructor(private readonly everyMs = SAVE_STATE_EVERY_MS) { }

  due(now: number, force = false): boolean {
    if (!force && now - this.lastSavedAt < this.everyMs) {
      return false
    }
    this.lastSavedAt = now
    return true
  }
}
