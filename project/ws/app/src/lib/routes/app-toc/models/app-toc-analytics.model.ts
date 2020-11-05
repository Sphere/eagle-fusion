export namespace NsAnalytics {
  export interface IAnalyticsResponse {
    total: number
    indexedOn: string
    updatedOn: string
    devices: IObjPair[]
    trainingHours: number
    uniqueParticipants: IActivityObj[]
    lex_course: ICourseObj
    lex_collection: ICourseObj
    lex_program: ICourseObj
    lex_resource: ICourseObj
    searchResult: ISearchObj
    uniqueParticipantsStaging: IActivityObj[]
    activityType: IActivityObj[]
    participants: IParticipantResponse
    refiners: [
      {
        serviceLine: IObjPair[];
      },
      {
        modulesCompleted: IObjPair[];
      },
      {
        stacks: IObjPair[];
      },
      {
        topics: IObjPair[];
      },
      {
        offeringMode: IObjPair[];
      },
      {
        interface: IObjPair[];
      },
      {
        newServiceLine: IObjPair[];
      },
      {
        abcd: IObjPair[];
      },
      {
        stacksCompleted: IObjPair[];
      },
      {
        skillName: IObjPair[];
      },
      {
        horizon: IObjPair[];
      },
      {
        track: IObjPair[];
      }
    ]
  }

  export interface IObjPair {
    key: string
    value: number
  }

  export interface IObjCount {
    key: string
    count: number
  }
  export interface IParticipantObj {
    key: string
    value: IObjPair[]
    count: number
  }

  export interface IActivityObj {
    key: string
    uniqueCount: number
    otherCounts: IObjCount[]
  }

  export interface ISearchObj {
    result: ISearchResultObj[]
  }
  export interface IResultObj {
    title: string
    participants: number
  }
  export interface ISearchResultObj {
    source: string[]
    title: string
    courseCode: string
    status: string
    offeringMode: string[]
    lex_collection: string
    lex_course: string
    lex_program: string
    lex_resource: string
    offerings: number
    participants: number
    instructors: IInstructorObj[]
  }

  export interface ICourseObj {
    result: IResultObj[]
  }
  export interface IOnsiteOffshoreObj {
    key: string
    trainingHours: number
    value: IObjPair[]
    count: number
  }

  export interface IInstructorObj {
    key: string
    doc_count: number
  }

  export interface IParticipantResponse {
    country: IParticipantObj[]
    du: IParticipantObj[]
    cu: IParticipantObj[]
    jl: IParticipantObj[]
    overallParticipants: IObjPair[]
    cuType: IParticipantObj[]
    pu: IParticipantObj[]
    onsiteOffshoreIndicator: IOnsiteOffshoreObj[]
    location: IParticipantObj[]
    puSALS: IParticipantObj[]
    ibu: IParticipantObj[]
    account: IParticipantObj[]
    [key: string]: any
  }

  export interface IAnalytics {
    enabled: boolean
    available: boolean
    courseAnalyticsClient: boolean
    courseAnalytics: boolean
  }
}
export namespace NsCourseAnalytics {
  export interface ICourseAnalyticsData {
    day_wise_users: IBarChartData[]
    avg_time_spent: number
    hits: number
    userCount: number
    city: IChartData[]
    department: IChartData[]
    device: IChartData[]
    [key: string]: any
  }

  export interface IChartData {
    key: string
    doc_count: number
    total_hits: number
  }

  export interface IBarChartData {
    key_as_string: string
    key: number
    doc_count: number
    hits_count: number
  }
}
