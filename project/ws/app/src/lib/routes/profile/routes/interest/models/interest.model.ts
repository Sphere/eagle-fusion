export interface ITopic {
  id: string
  date_created: string
  date_modified: string
  name: string
  source: string
  source_id: 0
  source_source: string
  source_status: string
  status: string
}

export interface ITopicRecommended {
  id: string
  name: string
  count: number
}

// export interface IInterestUserResponse {
//   rootOrg: string
//   org: string
//   language: string
//   interestId: string
//   interest: string
// }
