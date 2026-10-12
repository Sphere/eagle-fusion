/**
 * Models for Mobile Dashboard Service
 * Consolidates all types previously using 'any' in the service
 */

export interface CompetencyLevelDescription {
  name?: string
  levelName?: string
  level: number
  description?: string
  'lang-hi-name'?: string
  'lang-hi-description'?: string
  course: Course[]
}

// V2 payload shape: levels sit directly on the competency object, one course id per level
// (no additionalProperties wrapper, no per-language course array).
export interface CompetencyLevelDescriptionV2 {
  name?: string
  level: number
  description?: string
  courseId?: string
}

export interface CompetencyData {
  id: string
  name: string
  additionalProperties?: {
    competencyLevelDescription: CompetencyLevelDescription[]
  }
  levels?: CompetencyLevelDescriptionV2[]
}

export interface CompetencyLevel {
  competencyId: string
  name: string
  competencyName: string
  level: number
  levelName: string
  description?: string
  langHiName?: string
  langHiDescription?: string
  course: any
}

export interface Role {
  playlistId: string
  role: string[],
  language: string,
  dataSource?: {
    payload: any[]
  }
  payload?: any[]
}

export interface CompetencyInfo {
  competencyIds: string[]
  competencyLevels: CompetencyLevel[]
  isUserDesignationInRoles: boolean
}

export interface Course {
  id: string
  name?: string
  identifier?: string
  contentType?: string
  subTitle?: string
  description?: string
  creator?: string
  duration?: number
  posterImage?: string
  appIcon?: string
  childNodes?: any[]
  children?: any[]
  lang?: string
  language?: string
  batches?: Batch[]
  competencies_v1?: string
  batchId?: string
}

export interface Batch {
  batchId: string
}

export interface SearchPayload {
  request: {
    filters: {
      primaryCategory: string[]
      contentType: string[]
      status: string[]
      competency: boolean[]
      lang: string
    }
  }
  sort: Array<{ [key: string]: string }>
}

export interface SearchResult {
  result?: {
    content: Course[]
  }
  content?: Course[]
}

export interface ProgressRecord {
  levelId?: number
  competencylevel?: number
  competencyId?: string
  competencyid?: string
  competencyID?: string
  passFailStatus?: string
  contentType?: string
  completionpercentage?: number
  attemptcount?: number
  courseid?: string
}

export interface CompetencyCourse {
  title: string
  competencyID: string
  contentId: string
  batchId: string
  isAsha: string
  levels: CompetencyLevel[]
  contentType?: string
  subTitle?: string
  description?: string
  creator?: string
  duration?: number
  thumbnail?: string
  childContent?: number
  lang?: string
  completedLevels?: number
  totalPercentage?: number
  progress?: ProgressRecord[]
  expand?: boolean
}

export interface AshaProgress {
  levelId: number
  competencyId: string
  completionpercentage: number
  contentType: string
  passFailStatus: string
  attemptcount: number
}

export interface AshaDataResponse {
  ashaData: CompetencyCourse[]
  completedCourses: CompetencyCourse[]
  inProgressCourses: CompetencyCourse[]
}
