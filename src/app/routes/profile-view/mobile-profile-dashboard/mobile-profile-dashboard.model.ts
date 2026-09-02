/**
 * Models for Mobile Profile Dashboard Component
 * Consolidates all types previously using 'any' in the component
 */

export interface MenuItemConfig {
  id: string
  name: string
  text: string
  data: any
}

export interface MenuConfiguration {
  mobOrderList: string[]
  webOrderList: string[]
  menuItems: MenuItemConfig[]
}

export interface LayoutBody {
  sections: {
    accountTab: MenuConfiguration
  }
}

export interface PlaylistBodyConfig {
  LAYOUT_BODY: LayoutBody
}

export interface Certificate {
  identifier: string
  name: string
  rcCertiface?: boolean
  image?: any
  printUri?: string
  downloadUrl?: string
  rcCerticate?: boolean
  certificateName?: string
  thumbnail?: string
}

export interface CertificateImage {
  identifier: string
}

export interface Academic {
  nameOfQualification: string
  type: string
  nameOfInstitute: string
  yearOfPassing: string
}

export interface PersonalDetails {
  firstname: string
  surname: string
  photo?: string
  about?: string
  profileLocation?: string
}

export interface ProfessionalDetail {
  designation: string
  profession: string
  instituteName: string
}

export interface UserProfileRequest {
  id: string
  personalDetails: PersonalDetails
  professionalDetails: ProfessionalDetail[]
  academics: Academic[]
  userId?: string
}

export interface ProfileDetailsResponse {
  profileReq: UserProfileRequest
  preferences?: {
    language: string
  }
  userSource?: string
}

export interface UserRegistryData {
  userId: string
  identifier: string
  profileDetails: ProfileDetailsResponse
}

export interface WorkMessage {
  type: string
  back?: boolean
  edit?: string
  name?: string
  text?: string
  data?: any
}

export interface GeneralCertificates {
  issuedCertificates: any[]
}

export interface SunbirdRcCertificate {
  certificateName: string
  certificateDownloadUrl: string
  thumbnail: string
}

export interface CertificateData {
  generalCertificates: GeneralCertificates[]
  sunbirdRcCertificates?: SunbirdRcCertificate[]
}

export interface LeaderboardRequest {
  userId: string
  filters: {
    profession: string
    rootOrgId: string
    professional_institute_name: string
    background: string
  }
  limit: number
  offset: number
}

export interface LeaderboardUser {
  userId: string
  name: string
  rank: number
  points: number
}

export interface ActiveUserDetails {
  userId: string
  name: string
  rank: number
  points: number
}

export interface LeaderboardContent {
  leaderboardList: LeaderboardUser[]
  activeUserDetails: ActiveUserDetails
}

export interface LeaderboardResult {
  count: number
  content: LeaderboardContent
}

export interface LeaderboardResponse {
  result: LeaderboardResult
}

export interface OrgDetails {
  id: string
  name: string
}

export interface LanguagePreference {
  language: string
  userSource?: string
}

export interface UpdateProfileRequest {
  request: {
    userId: string
    profileDetails: any
  }
}
