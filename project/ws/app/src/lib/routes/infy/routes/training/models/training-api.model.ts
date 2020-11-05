// import { ETrainingType } from './training.model'

export interface ITraining {
  content_feedback_form: string
  content_feedback_required: boolean
  content_id: string
  deliveryType: string
  educator: {
    email: string
    name: string
  }
  eligible: boolean
  end_dt: Date
  hasAssessment: boolean
  instructor_feedback_form: string
  instructor_feedback_required: boolean
  isJIT: boolean
  isVisibility: boolean
  location: string | null
  offering_id: number
  reason_not_eligible: string
  registered: boolean
  registration_closure_date: Date
  sessions: ITrainingSession[]
  slots_available: number
  start_dt: Date
  time_zone: string
  ineligibilityReasons?: string[]
}

export interface ITrainingSession {
  building: string
  classroom: string
  educator: {
    email: string
    name: string
  }[]
  end_dt: Date
  end_time: string
  offering_id: number
  session_id: number
  start_dt: Date
  start_time: string
  location?: string | null
  sublocation?: string | null
  course_start_dt?: Date | null
}

export interface ITrainingApiResponse {
  res_code: number
  res_message: string
}

export interface ITrainingCounts {
  [key: string]: number
}

export interface IJITRequest {
  jit_request_id: string
  raised_by: string
  status: string
  track_name: string
  track_anchor: string
  track_lead: string
  content_id: string
  content_name: string
  start_date: Date
  no_of_participants: number
  location_code: string
  participant_profile: string
  training_level: string
  additional_info: string
  training_by_vendor: string
  track_code: string
}

export interface IJITForm {
  contentId?: string
  contentName?: string
  trainingDescription: string
  startDate: Date
  participantCount: number
  track: string
  location: string
  participantProfile: string
  trainingLevel: string
  additionalInfo: string
  trainingByVendor: boolean
  searchedContent?: string
}

export interface ITrainingRequest {
  content_id: string
  content_name: string
  offering_id: string
  start_dt: Date
  end_dt: Date
  location: string
  registration_date: Date
  user: string
  user_name: string
  delivery_type: string
  designation: string
}

export interface ITrainingFeedbackQuestion {
  question_id: number
  question: string
  type: string
}

export interface IFeedbackTraining {
  content_id: string
  offering_id: string
  start_dt: Date
  end_dt: Date
  location: string
  educator: {
    email: string
    name: string
  }
  content_feedback_required: boolean
  instructor_feedback_required: boolean
  content_feedback_form: string
  instructor_feedback_form: string
  content_feedback_given: boolean
  instructor_feedback_given: boolean
  date_range?: string // For UI only
}

export interface ITrainingFeedbackAnswer {
  question_id: number
  type: string
  rating?: number
  rating_reason?: string
}

export interface ITrainingRejection {
  manager_id: string
  reject_reason: string
}

export interface ITrainingLocation {
  name: string
  code: string
}

export interface ITrainingTrack {
  code: string
  name: string
  flgJIT: number
}

export interface ITrainingUserPrivileges {
  canRequestJIT: boolean
  canNominate: boolean
}

export interface IContentWatchlistStatus {
  inWatchlist: boolean
}

export interface ITrainingFilter {
  external: {
    fromDate: Date
    toDate: Date
    location?: string
  }
  internal: {
    assessmentOnly: boolean
    seatsAvailableOnly: boolean
    eligibleOnly: boolean
  }
}

export interface ITrainingFilterDialogData {
  filterObj: ITrainingFilter
  trainingLocations: ITrainingLocation[]
}

export interface ITrainingConfig {
  watchlist?: boolean
  share?: boolean
  trainingLocations?: ITrainingLocation[]
  trainingTracks?: ITrainingTrack[]
}

export enum EJITParticipantProfile {
  Beginner = 'Beginner',
  Intermediate = 'Intermediate',
  Expert = 'Expert',
}

export enum EJITLevel {
  Beginner = 'Beginner',
  Advanced = 'Advanced',
}
