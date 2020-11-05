import { NsContent } from '../_services/widget-content.model'

export namespace NsGoal {
  export enum EGoalTypes {
    USER_COMMON = 'common',
    USER = 'user',
    FOR_OTHERS_COMMON = 'commonshared',
    FOR_OTHERS_USER = 'tobeshared',
    FOR_OTHERS_COMMON_SHARED = 'common_shared',
    FOR_OTHERS_USER_SHARED = 'custom_shared',
  }

  export enum EGoalTrackStatus {
    ACCEPTED = 'accepted',
    REJECTED = 'rejected',
    PENDING = 'pending',
  }

  export interface IGoalUpsertRequest {
    id?: string
    type: string
    contentIds?: string[]
    name?: string
    description?: string
    duration?: number
  }

  export interface IGoalUpsertResponse {
    error?: string
  }

  export interface IGoalAcceptConfirmationResponse {
    commonSharedGoal?: boolean
    commonUserGoal?: boolean
    Status?: string
  }

  export interface IGoal {
    id: string
    name: string
    description: string
    duration?: number
    contentIds: string[]
    type: EGoalTypes
    startDate: number
    sharedBy?: IGoalUser
    sharedWith?: IGoalUser[]
    isShared: boolean
    goalFor: 'me' | 'others'
    progress?: number
    endDate?: number
    contentProgress?: IContentProgress[]
    contents?: NsContent.IContentMinimal[]
    createdForSelf?: boolean
    createdForOthers?: boolean
  }

  export interface IContentProgress {
    contentType: string
    duration: number
    hasAccess: boolean
    identifier: string
    mimeType: string
    name: string
    resource_progress: number
    status: string
    timeLeft: number
  }

  export interface IGoalsGroup {
    id: string
    name: string
    goals: IGoal[]
  }

  export interface IUserGoals {
    goalsInProgress: IGoal[]
    completedGoals: IGoal[]
  }

  export interface IGoalsShareRequest {
    users: string[]
    message?: string
  }

  export interface IGoalsShareResponse {
    result: string
    already_shared: IGoalUser[]
    self_shared: boolean
    invalid_users: IGoalUser[]
    unauthorized_users: IGoalUser[]
  }

  export interface IGoalUser {
    email: string
    name: string
    userId: string
  }

  export interface IGoalAddContentResponse {
    result: string
    resource_removal_message: string
  }

  export interface IGoalRemoveContentResponse {
    goal_deleted: boolean
    content_deleted: boolean
    message: string
  }

  export interface IBtnGoal {
    contentId: string
    contentName: string
    contentType: NsContent.EContentTypes
    isDisabled?: false
  }
}
