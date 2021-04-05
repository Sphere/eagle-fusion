import { map, catchError } from 'rxjs/operators'
import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable, of } from 'rxjs'
import { environment } from './../../../../../../../src/environments/environment'

let instanceConfigPath: string | null = window.location.host

const API_ENDPOINTS = {
  searchByOrgID: '/apis/protected/V8/content/searchByOrgID',
}

if (!environment.production && Boolean(environment.sitePath)) {
  instanceConfigPath = environment.sitePath
}

@Injectable({
  providedIn: 'root',
})
export class OrgServiceService {
  sitePath = `assets/configurations/${(instanceConfigPath || window.location.host).replace(
    ':',
    '_',
  )}`

  constructor(private http: HttpClient) { }

  resolve(): Observable<any> {
    return this.getOrgMetadata().pipe(
      map((data: any) => ({ data, error: null })),
      catchError((error: any) => of({ error, data: null })),
    )
  }

  getOrgMetadata() {
    const orgMeta = this.http
      .get(`${this.sitePath}/orgmeta.config.json`)

    return orgMeta
  }

  getDatabyOrgId(data: any) {
    return this.http.post(API_ENDPOINTS.searchByOrgID, data)
  }
}
