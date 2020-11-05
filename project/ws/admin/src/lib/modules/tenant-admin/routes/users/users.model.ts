export interface IUserForm {
  org: string
  firstName: string
  middleName?: string
  lastName: string
  email: string
  username?: string
  enabled?: boolean
  emailVerified?: boolean
  password?: string
  noPasswordChange?: boolean
  groupIds?: any[]
}

export interface IUserRoleDetail {
  about: string
  hasRole: boolean
  isSelected: boolean
}
