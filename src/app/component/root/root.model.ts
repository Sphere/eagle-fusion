/**
 * Models for Root Component
 * Consolidates all types previously using 'any' in the component
 */

export interface CourseEnrollment {
  batchId: string
  courseId: string
  contentId?: string
}

export interface FeaturedCourse {
  id: string
  name: string
  identifier: string
}

export interface PreferedLanguage {
  id: string
  lang: string
}

export interface ConfigData {
  [key: string]: any
}

export interface OrgDetails {
  id?: string
  name?: string
  hashTagId?: string
  themeConfig?: ThemeConfig
}

export interface ThemeConfig {
  isDark?: boolean
  theme?: string
}

export interface VideoData {
  [key: string]: any
}

export interface BodyConfig {
  [key: string]: any
}

export interface FooterConfig {
  [key: string]: any
}

export interface ProgramConfig {
  [key: string]: any
}

export interface ContentHistory {
  request: {
    userId: string
    batchId: string
    courseId: string
    contentIds: string[]
    fields: string[]
  }
}

export interface ContentData {
  contentId: string
  status?: string
  progressdetails?: any
  completionPercentage?: number
}

export interface ProgressDetails {
  [key: string]: any
}

export interface UpdateProgressRequest {
  request: {
    userId: string
    contents: Array<{
      contentId: string
      batchId: string
      courseId: string
      status: string
      lastAccessTime: string
      progressdetails: ProgressDetails
      completionPercentage: number
    }>
    url: string
  }
}

export interface UserDetailsResponse {
  profileDetails: any
}
