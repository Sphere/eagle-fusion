export interface IUserFetchMySubmissionsResponse {
  submission_url: string
  testcases_failed: number
  total_testcases: number
  feedback_time: string
  feedback_by: string
  submission_id: string
  feedback_url: string
  submission_type: string
  submission_time: string
  testcases_passed: number
  result_percent: number
  feedback_type: string
  currentRowNumber?: number
}
