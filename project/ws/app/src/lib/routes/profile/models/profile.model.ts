import { IWidgetGraphData, NsContent } from '@ws-widget/collection'

export namespace NSProfileData {
  export interface IProfileJsonData {
      dashboard: {
        enabled: boolean
        available: boolean
        displayName: string
        subFeatures: {
          pendingCourses: boolean
          knowledgeBoard: boolean
          calendar: boolean
          skill: boolean
          interests: boolean
          latest: boolean
        }
      }
      learning: {
        enabled: boolean
        available: boolean
        displayName: string
        subTabs: {
            learningHistory: {
            enabled: boolean
            available: boolean
            isClient: boolean
            isFilter: boolean
            tabs: {
              courses: boolean
              programs: boolean
              modules: boolean
              resources: boolean
            }
          }
          learningTime: {
            enabled: boolean
            available: boolean
            charts: {
              learningBarChart: boolean
              trackWiseChart: boolean
              calendarChart: boolean
              dimensionsChart: boolean
              timeSpentByMe: boolean
              timeSpentByPeers: boolean
              timeSpentByEmployees: boolean
            }
          }
        }
      }
      achievements: {
        enabled: boolean
        available: boolean
        displayName: string
        subTabs: {
          badges: {
            enabled: boolean
            available: boolean
          }
          assessments: {
            enabled: boolean
            available: boolean
          }
          certifications: {
            enabled: boolean
            available: boolean
          }
        }
      }
      skills: {
        enabled: boolean
        available: boolean
        displayName: string
        subTabs: {
          skills: {
            enabled: boolean
            available: boolean
            client: boolean
            subFeatures: {
              addSkill: boolean
              editSkill: boolean
            }
          }
          roles: {
            enabled: boolean
            available: boolean
            client: boolean
            subFeatures: {
              addRole: boolean
              editRole: boolean
              deleteRole: boolean
              shareRole: boolean
            }
          }
          allSkills: {
            enabled: boolean
            available: boolean
            client: boolean
            subFeatures: {
              filters: boolean
            }
          }
          projectEndorsements: {
            enabled: boolean
            available: boolean
            client: boolean
            subFeatures: {
              createEndorsement: boolean
            }
          }
          approveEndorsements: {
            enabled: boolean
            available: boolean
          }
        }
      }
      interests: {
        enabled: boolean
        available: boolean
        displayName: string
      }
      plans: {
        enabled: boolean
        available: boolean
        displayName: string
        subTabs: {
          goals: {
            enabled: boolean
            available: boolean
          }
          playlists: {
            enabled: boolean
            available: boolean
          }
        }
      }
      refactoring: {
        enabled: boolean
        available: boolean
        displayName: string
      }
      collaborators: {
        enabled: boolean
        available: boolean
        displayName: string
        subTabs: {
          goalsSharedByMe: {
            enabled: boolean
            available: boolean
          }
          goalsSharedToMe: {
            enabled: boolean
            available: boolean
          }
          ArtifactsShared: {
            enabled: boolean
            available: boolean
          }
          playlistSharedByMe: {
            enabled: boolean
            available: boolean
          }
          playlistSharedToMe: {
            enabled: boolean
            available: boolean
          }
          playground: {
            enabled: boolean
            available: boolean
          }
          expertsContacted: {
            enabled: boolean
            available: boolean
          }
          contentCreated: {
            enabled: boolean
            available: boolean
          }
        }
      }
      featureUsage: {
        enabled: boolean
        available: boolean
        displayName: string
        subSections: {
          learningTime: boolean
          assessments: boolean
          refactoring: boolean
          plans: boolean
          collaborators: boolean
          other: boolean
        }
      }
      settings: {
        enabled: boolean
        available: boolean
        displayName: string
      }
  }
  export interface IJson {
    enabledTabs: IProfileJsonData
  }

  export interface ITimeSpentResponse {
    JL_wise: IPieCharts[]
    badges_details: IBadgeDetails[]
    category_wise: IPieCharts[]
    date_wise: IProfileData[]
    last_updated_on: Date
    org_wide_avg_time_spent: number
    org_wide_category_time_spent: IPieCharts[]
    points_and_ranks: IPointsAndRanks
    time_spent_by_user: number
    timespent_user_vs_org_wide: {
      time_spent_by_user: number
      usage_percent: number
    }
    total_badges_earned: number
    track_wise_user_timespent: ITrackWiseData
    unit_wise: IPieCharts[]
  }

  export interface IProfileData {
    key: number
    key_as_string?: string
    value: number
  }

  export interface IPieCharts {
    key: string
    value: number
  }

  export interface IBadgeDetails {
    badge_id: string
    badge_name: string
    badge_type: string
    content_name: string | null
    description: string
    email_id: string
    first_received_date: Date
    last_received_date: Date
    progress: string
  }
  export interface ICardSkill {
    category?: string
    certificationCount?: number
    courseCount?: number
    horizon?: string
    group?: string
    level?: string
    user_level?: string
    id: string
    imageUrl: string
    navigationUrl: string
    title: string
    recommendedBy?: string
    progress?: string
    skills?: string[]
  }
  export interface IPointsAndRanks {
    monthly_points_earned: number
    org_wide_avg_points_earned: number
    points_user_vs_org_wide: IPointsANdRanksOrgWide
    rank: number
    user_points_earned: number
  }

  export interface IPointsANdRanksOrgWide {
    points_earned_by_user: number
    points_percent: number
  }

  export interface ITrackWiseData {
    [key: string]: IMonthWiseData[]
  }

  export interface IMonthWiseData {
    month_year: string
    number_of_content_accessed: number
    timespent_in_mins: number
    track: string
  }

  export interface INsoResponse {
    artifacts_shared: IArtifactsShared[]
    content_created: IContentCreated[]
    experts_contacted: IExpertsContacted[]
    feature_usage_stats: IFeatureUsageStatistics
    likes_detail: IArtifactsShared[]
    nso_content_progress: INsoContentProgress
    nso_roles: INsoRoles[]
    playground_details: IPlayGroundDetails[]
    total_nso_program_taken: number
  }

  export interface INsoContentProgress {
    role_name: string
  }
  export interface INsoRoles {
    lex_id: string
    role_id: string
    role_name: string
  }
  export interface IPlayGroundDetails {
    activity: string
    contest_Name: string
    date_of_use: string
    email_id: string
    marks_Obtained: string
    sub_activity: string
    type: string
    video_Proctoring: boolean
  }

  export interface IContentCreated {
    app_icon: string
    content_name: string
    content_type: string
    email_id: string
    last_updated_on: string
    lex_id: string
  }

  export interface IArtifactsShared {
    content_id: string
    content_name: string
    date_of_use: string
    email_id: string
    type: string
  }
  export interface IExpertsContacted {
    contact_medium: string
    contacted: string
    content_id: string
    content_name: string
    date_of_use: string
    email_id: string
    type: string
  }
  export interface IFeatureUsageStatistics {
    feedback_count: number
    from_leaders_count: number
    live_count: number
    marketing_count: number
    navigator_count: number
    onboarding_count: number
    radio_count: number
    search_count: number
    tour_count: number
    tv_count: number
  }
 export interface IBubbleChart {
   x: string
   y: number
   r: number
   actual: number
   text: string
 }
  export interface IGraphWidget {
    widgetType: string
    widgetSubType: string
    widgetData: IWidgetGraphData
  }

  // type TContentTypes =
  //   | 'Learning Path'
  //   | 'Course'
  //   | 'Collection'
  //   | 'Resource'
  //   | 'Knowledge Artifact'
  //   | 'Knowledge Board'
  //   | 'Channel'
  //   | 'Learning Journeys'
  //   | 'Playlist'
  //   | 'person'
  //   | 'tags'

  // const SERVICES: Record<string string> = {
  //   doorToDoor: 'delivery at door'
  //   airDelivery: 'flying in'
  //   specialDelivery: 'special delivery'
  //   inStore: 'in-store pickup'
  // }
  export interface IFollowing {
    'Knowledge Board': NsContent.IContentMinimal[]
    Channel: NsContent.IContentMinimal[]
  }
}
