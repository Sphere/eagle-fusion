import { IWidgetGraphData, NsContent } from '@ws-widget/collection'

export namespace NSAnalyticsData {
  export interface ITimeSpentResponse {
    JL_wise: IProfileData[]
    badges_details: IBadgeDetails[]
    category_wise: IProfileData[]
    date_wise: IProfileData[]
    last_updated_on: Date
    org_wide_avg_time_spent: number
    org_wide_category_time_spent: IProfileData[]
    points_and_ranks: IPointsAndRanks
    time_spent_by_user: number
    timespent_user_vs_org_wide: {
      time_spent_by_user: number
      usage_percent: number
    }
    total_badges_earned: number
    track_wise_user_timespent: ITrackWiseData
    unit_wise: IProfileData
  }

  export interface IProfileData {
    key: number
    key_as_string?: string
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

  export interface IGraphWidget {
    widgetType: string
    widgetSubType: string
    widgetData: IWidgetGraphData
  }

  export interface IAssessmentResponse {
    assessment: IAssessment[]
    certifications_count: number
    user_assessment_count_vs_org_wide: number
    certification_list: ICertificationList[]
  }
  export interface ICertificationList {
    assessment_date: Date
    content_name: string
    lex_id: string
    max_score: number
    min_score: number
    percentile: number
    type: string
  }

  export interface IAssessment {
    assessment_date: Date
    assessment_score: number
    content_name: string
    lex_id: string
    max_score: number
    min_score: number
    percentile: number
    type: string
  }

  export interface IFollowing {
    'Knowledge Board': NsContent.IContentMinimal[]
    Channel: NsContent.IContentMinimal[]
  }
  export interface IProgressRange {
    key: number
    doc_count: number
  }
  export interface ITopContent {
    lex_id: string
    count: number
    content_name: string
    progress_range: IProgressRange[]
  }
  export interface ILearningHistory {
    lex_id: string
    content_name: string
    progress: number
    last_progress_date: string
  }
  export interface ILearningHistoryProgress {
    [key: string]: IProgressRange[]
  }

  export interface IGoalsShared {
    goal_id: string
    goal_title: string
    email_id: string
    last_updated_on: string
    progress: number
    goal_type: string
    goal_end_date: null
    goal_start_date: null
    shared_on: string
    created_on: string
    shared_by: string
    status: string
  }
  export interface IPlayListProgress {
    last_updated_on: string
    email_id: string
    play_list_id: string
    progress: number
    visibility: string
    shared_by: string
    play_list_title: string
    created_on: string
  }
  export interface IPlayListShared {
    type: string
    shared_by: string
    play_list_title: string
    email_id: string
    play_list_id: string
    resource_id: string
    created_on: string
    progress: number
  }
  export interface IUserProgressResponse {
    last_updated_on: string
    top_content_jl: ITopContent[]
    top_content_unit: ITopContent[]
    learning_history: ILearningHistory[]
    learning_history_progress_range: ILearningHistoryProgress
    goal_progress: never[]
    goal_shared_by_me: IGoalsShared[]
    goal_shared_to_me: IGoalsShared[]
    playlist_progress: IPlayListProgress[]
    playlist_shared_by_me: IPlayListShared[]
    playlist_shared_to_me: IPlayListShared[]
  }
}
