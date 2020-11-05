import { NsContent } from '@ws-widget/collection'

export namespace NSLearningGraph {
  export interface ITrackWiseData {
    [key: string]: IMonthWiseData[]
  }
  export interface IMonthWiseData {
    month_year: string
    number_of_content_accessed: number
    timespent_in_mins: number
    track: string
  }
}

export interface ITimeSpent {
  user: ITimeSpentDayWise[]
  org: ITimeSpentDayWise[]
  userAvg: number
  orgAvg: number
  lastUpdatedDate?: any
}

export interface ITimeSpentDayWise {
  day: string
  duration: number
}

export namespace NSLearningHistory {
  // Please check this enum
  export enum ELearningHistoryContentTypeMessage {
    Program = 'Learning Path',
    Course = 'Course',
    LearningModule = 'Collection',
    Resource = 'Resource',
  }

  export enum ELearningHistoryContentType {
    Program = 'learning path',
    Course = 'course',
    LearningModule = 'learning module',
    Resource = 'resource,',
  }

  export enum ELearningHistoryProgressType {
    InProgress = 'inProgress',
    Completed = 'completed',
  }

  export interface ILearningHistoryResponse {
    result: IResult[]
    page_state: string
    count: number
  }

  export interface IResult {
    identifier: string
    children: string[]
    name: string
    progress: number
    last_ts: number
  }
  export interface ILearningHistoryItem {
    identifier: string
    name: string
    contentType: string
    displayContentType?: NsContent.EDisplayContentTypes
    progress?: number
    totalDuration: number
    children: string[]
    pending?: number
    timeLeft?: number
    last_ts?: number
    thumbnail?: string
    lastUpdated?: string
  }

  export interface ILearningHistory {
    count: number
    page_state: string
    result: ILearningHistoryItem[]
  }

  export interface ICertification {
    passedList: NsContent.IContent[]
    canAttemptList: NsContent.IContent[]
    cannotAttemptList: NsContent.IContent[]
    ongoingList: NsContent.IContent[]
    sortedList: NsContent.IContent[]
  }
}
