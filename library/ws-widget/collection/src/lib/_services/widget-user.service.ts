import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable, throwError } from 'rxjs'
import { catchError, map } from 'rxjs/operators'
import { IUserGroupDetails } from './widget-user.model'
import { NsContent } from './widget-content.model'
import { API_END_POINTS } from '../../../../../../src/app/constants/apiConstants'

@Injectable({
  providedIn: 'root',
})
export class WidgetUserService {
  constructor(private http: HttpClient) { }

  handleError(error: ErrorEvent) {
    let errorMessage = ''
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`
    }
    return throwError(errorMessage)
  }

  fetchUserGroupDetails(userId: string): Observable<IUserGroupDetails[]> {
    return this.http
      .get<IUserGroupDetails[]>(API_END_POINTS.FETCH_USER_GROUPS(userId))
      .pipe(catchError(this.handleError))
  }

  fetchUserBatchList(userId: string | undefined, queryParams?: { orgdetails: any, licenseDetails: any, fields: any, batchDetails: any }): Observable<NsContent.ICourse[]> {
    let path = ''
    if (queryParams) {

      // tslint:disable-next-line: max-line-length
      path = API_END_POINTS.FETCH_USER_ENROLLMENT_LIST_V2(userId, queryParams.orgdetails, queryParams.licenseDetails, queryParams.fields, queryParams.batchDetails)
      if (window.location.origin.indexOf('http://localhost:') === -1) {
        path = `${window['env']['azureHost']}/${path}`
      }

    } else {
      path = API_END_POINTS.FETCH_USER_ENROLLMENT_LIST_CERT(userId)
    }

    return this.http
      .get(path)
      .pipe(
        catchError(this.handleError),
        map(
          (data: any) => data.result.courses
        )
      )
  }
}
