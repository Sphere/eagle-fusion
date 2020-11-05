import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { mergeMap } from 'rxjs/internal/operators/mergeMap'

const apiEndpoints = {
  HANDSON_EXECUTE: `/apis/protected/v8/user/code/execute`,
  HANDSON_VERIFY_FP: `/apis/protected/v8/user/code/fp/verify/`,
  HANDSON_SUBMIT_FP: `/apis/protected/v8/user/code/fp/submit/`,
  HANDSON_VERIFY_FP_JAVA: `/apis/protected/v8/user/code/fp/javaVerify/`,
  HANDSON_SUBMIT_FP_JAVA: `/apis/protected/v8/user/code/fp/javaSubmit/`,
  HANDSON_VERIFY_CE: `/apis/protected/v8/user/code/ce/verify/`,
  HANDSON_SUBMIT_CE: `/apis/protected/v8/user/code/ce/submit/`,
  HANDSON_VIEW_LAST_SUBMISSION: `/apis/protected/v8/user/code/viewLastSubmission/`,
  HANSON_VIEW_LAST_SUBMISSION_DATA: `/apis/protected/v8/user/code/viewLastSubmissionData/`,
}

@Injectable({
  providedIn: 'root',
})
export class HandsOnService {

  constructor(private http: HttpClient) { }

  execute(exerciseData: any) {
    return this.http.post(apiEndpoints.HANDSON_EXECUTE, exerciseData)
  }
  verifyFp(lexId: string, exerciseDataFp: any) {
    return this.http.post(apiEndpoints.HANDSON_VERIFY_FP + lexId, exerciseDataFp)
  }
  submitFp(lexId: string, exerciseDataFp: any) {
    return this.http.post(apiEndpoints.HANDSON_SUBMIT_FP + lexId, exerciseDataFp)
  }
  verifyJavaFp(lexId: string, exerciseDataFp: any) {
    return this.http.post(apiEndpoints.HANDSON_VERIFY_FP_JAVA + lexId, exerciseDataFp)
  }
  submitJavaFp(lexId: string, exerciseDataFp: any) {
    return this.http.post(apiEndpoints.HANDSON_SUBMIT_FP_JAVA + lexId, exerciseDataFp)
  }
  verifyCe(lexId: string, exerciseDataCe: any) {
    return this.http.post(apiEndpoints.HANDSON_VERIFY_CE + lexId, exerciseDataCe)
  }
  submitCe(lexId: string, exerciseDataCe: any) {
    return this.http.post(apiEndpoints.HANDSON_SUBMIT_CE + lexId, exerciseDataCe)
  }
  viewLastSubmission(lexId: string) {
    return this.http.get(apiEndpoints.HANDSON_VIEW_LAST_SUBMISSION + lexId).pipe(
      mergeMap((v: any) => {
        if (v && v.response && v.response.length > 0) {
          const viewUrl = v.response[0].submission_url
          return this.http.get(viewUrl, { responseType: 'text' })
        }
        return ['---no submission found---']

      }),
    )
  }

}
