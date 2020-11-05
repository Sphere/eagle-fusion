export interface IUserRoleDetail {
  department_name: string
  email: string
  first_name: string
  last_name: string
  root_org: string
  wid: string
  hasRole: boolean
}

export interface IManageUser {
  users: string[]
  operation: 'add' | 'remove'
  roles: string[]
}
