import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
// import { map } from 'rxjs/operators'

@Injectable()
export class CertificationService {
  API_ENDPOINTS = {
    USER_CERTIFICATION: ``,
  }
  constructor(private http: HttpClient) { }

  fetchCertifications(request: { tracks: never[]; sortOrder: string; }) {
    return this.http
      .post(this.API_ENDPOINTS.USER_CERTIFICATION, { request })
    // .pipe(map(u => u.result && u.result.resultList))
  }
}
