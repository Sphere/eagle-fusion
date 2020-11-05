export namespace NsAutoComplete {
  export enum EUserAutoCompleteCategory {
    EMAIL = 'email',
    FIRST_NAME = 'first_name',
    LAST_NAME = 'last_name',
    ROOT_ORG = 'root_org',
    DEPARTMENT_NAME = 'department_name',
  }
  export interface IUserAutoComplete {
    department_name: string
    email: string
    first_name: string
    last_name: string
    root_org: string
    wid: string
  }
}
