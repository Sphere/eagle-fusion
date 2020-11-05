import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { NSRdbmsHandsOn } from './rdbms-hands-on.model'

const API_END_POINTS = {
  INITIALIZE_DB: `/apis/protected/v8/user/rdbms/initializeDb`,
  EXECUTE: `/apis/protected/v8/user/rdbms/executeQuery`,
  CONCEPT_DATA: `/apis/protected/v8/user/rdbms/conceptData`,
  COMPOSITE: `/apis/protected/v8/user/rdbms/compositeQuery`,
  EXPECTED_OUTPUT: `/apis/protected/v8/user/rdbms/expectedOutput`,
  VERIFY: `/apis/protected/v8/user/rdbms/verifyExercise`,
  SUBMIT: `/apis/protected/v8/user/rdbms/submitExercise`,
  DB_STRUCTURE: `/apis/protected/v8/user/rdbms/dbStructure`,
  TABLE_REFRESH: `/apis/protected/v8/user/rdbms/tableRefresh`,
  PLAYGROUND: `/apis/protected/v8/user/rdbms/playground`,
  COMPARE_QUERY: `/apis/protected/v8/user/rdbms/compareQuery`,
}

@Injectable({
  providedIn: 'root',
})
export class RdbmsHandsOnService {

  constructor(
    private http: HttpClient,
  ) { }

  verifyQuery(req: any, id: any): Observable<any> {
    return this.http.post<any>(`${API_END_POINTS.VERIFY}/${id}`, req)
      .pipe(map(response => response))
  }

  submitQuery(req: any, id: any): Observable<any> {
    return this.http.post<any>(`${API_END_POINTS.SUBMIT}/${id}`, req)
      .pipe(map(response => response))
  }

  runQuery(req: any): Observable<NSRdbmsHandsOn.IRdbmsApiResponse> {
    const reqBody = {
      input_data: req,
    }
    return this.http.post<NSRdbmsHandsOn.IRdbmsApiResponse>(API_END_POINTS.EXECUTE, reqBody)
      .pipe(map(response => response))
  }

  compareQuery(originQuery: any, userQuery: any): Observable<NSRdbmsHandsOn.IRdbmsApiResponse> {
    const reqBody = {
      original_query: originQuery,
      user_query: userQuery,
    }
    return this.http.post<NSRdbmsHandsOn.IRdbmsApiResponse>(API_END_POINTS.COMPARE_QUERY, reqBody)
      .pipe(map(response => response))
  }

  playground(req: any): Observable<NSRdbmsHandsOn.IRdbmsApiResponse> {
    const reqBody = {
      input_data: req,
    }
    return this.http.post<NSRdbmsHandsOn.IRdbmsApiResponse>(API_END_POINTS.PLAYGROUND, reqBody)
      .pipe(map(response => response))
  }

  compositeQuery(req: any, type: any): Observable<NSRdbmsHandsOn.IRdbmsApiResponse> {
    const reqBody = {
      input_data: req,
    }
    return this.http.post<NSRdbmsHandsOn.IRdbmsApiResponse>(`${API_END_POINTS.COMPOSITE}/${type}`, reqBody)
      .pipe(map(response => response))
  }

  initializeDatabase(id: any): Observable<NSRdbmsHandsOn.IRdbmsApiResponse[]> {
    return this.http.get<NSRdbmsHandsOn.IRdbmsApiResponse[]>(`${API_END_POINTS.INITIALIZE_DB}/${id}`)
  }

  fetchDBStructure(id: any): Observable<NSRdbmsHandsOn.IRdbmsApiResponse> {
    return this.http.get<NSRdbmsHandsOn.IRdbmsApiResponse>(`${API_END_POINTS.DB_STRUCTURE}/${id}`)
  }

  tableRefresh(id: any): Observable<NSRdbmsHandsOn.IRdbmsApiResponse[]> {
    return this.http.get<NSRdbmsHandsOn.IRdbmsApiResponse[]>(`${API_END_POINTS.TABLE_REFRESH}/${id}`)
  }

  fetchConceptData(id: any): Observable<NSRdbmsHandsOn.IRdbmsApiResponse> {
    return this.http.get<NSRdbmsHandsOn.IRdbmsApiResponse>(`${API_END_POINTS.CONCEPT_DATA}/${id}`)
  }

  fetchExpectedOutput(id: any): Observable<NSRdbmsHandsOn.IRdbmsApiResponse> {
    return this.http.get<NSRdbmsHandsOn.IRdbmsApiResponse>(`${API_END_POINTS.EXPECTED_OUTPUT}/${id}`)
  }

}
