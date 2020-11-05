export namespace NSRdbmsHandsOn {
  export interface IRdbmsApiResponse {
    data: string
    validationStatus: boolean
    status: IStatusObject
    tellTextMsg: string
  }

  export interface ISubmissionResult {
    message: string
    status: boolean
  }

  export interface IDbStructureResponse {
    tablename: string
    columnname: string
  }

  export interface IDbStructureResponse {
    tablename: string
    columnname: string
  }

  export interface IInitializeDBTable {
    tableData: any[]
    tableName: string
    tableColumns: any[]
  }
  export interface IDropdownDetails {
    dropdownTitle: string
    concept: string
    query: any
    telltext: string
  }

  interface IStatusObject {
    code: number
    message: string
    rowCount: number
    warnings: string
  }
}
