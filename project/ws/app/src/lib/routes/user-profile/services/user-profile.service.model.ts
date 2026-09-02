/**
 * Type definitions for UserProfileService
 * Replaces loose 'any' types with proper interfaces
 */

export interface IUpdateProfileRequest {
  [key: string]: any
}

export interface IApprovalRequest {
  [key: string]: any
}

export interface ILeaderboardRequest {
  [key: string]: any
}

export interface IProfileRequest {
  personalDetails?: {
    dob?: string
    postalAddress?: string
  }
  professionalDetails?: IProfileProfessionalDetails[]
}

export interface IProfileProfessionalDetails {
  profession?: string
  block?: string
  selectBackground?: string
  designation?: string
}

export interface IUserDetailsCache {
  [userId: string]: any
}

export type UpdateUserObservable<T = any> = T
