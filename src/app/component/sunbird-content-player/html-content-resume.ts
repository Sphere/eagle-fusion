/**
 * Save and resume for HTML content: where the learner left off is the package's last STATE snapshot.
 * Content in a course keeps it on the server, in the content's progress record (progressdetails.htmlState),
 * like the SCORM adapter keeps cmi.suspend_data. Local copies (demo page, packages not uploaded yet) have no
 * server record, so they keep it in this browser, under a key per user and content.
 */

export const LOCAL_RESUME_PREFIX = 'html-content-state:'
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
 * Browser key for a local copy's position: per user AND per content, so two people sharing a browser
 * never resume each other's place. Without a known user nothing is stored.
 */
export function localResumeKey(userId: string | null | undefined, contentId: string): string | null {
  return userId && contentId ? `${LOCAL_RESUME_PREFIX}${userId}:${contentId}` : null
}

export function readLocalResume(userId: string | null | undefined, contentId: string): unknown {
  const key = localResumeKey(userId, contentId)
  if (!key) {
    return null
  }
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function saveLocalResume(userId: string | null | undefined, contentId: string, state: unknown) {
  const key = localResumeKey(userId, contentId)
  if (!key) {
    return
  }
  try {
    localStorage.setItem(key, JSON.stringify(state))
  } catch {
    // storage full or blocked (private mode): resume is a convenience, playing carries on
  }
}

export function clearLocalResume(userId: string | null | undefined, contentId: string) {
  const key = localResumeKey(userId, contentId)
  if (!key) {
    return
  }
  try {
    localStorage.removeItem(key)
  } catch {
    // ignore, as above
  }
}

/** The signed-in user: the loaded profile, else the session id kept at login (profile still loading). */
export function currentUserId(profileUserId: string | null | undefined): string | null {
  if (profileUserId) {
    return profileUserId
  }
  try {
    return localStorage.getItem('userUUID')
  } catch {
    return null
  }
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
