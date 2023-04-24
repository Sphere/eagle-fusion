import { Injectable } from '@angular/core'
import { Observable } from 'rxjs'
// import * as _ from 'lodash'
import { ServerResponse } from 'http'
import { ApiService } from '@ws/author/src/public-api'

const API_END_POINTS = {
  VALIDATE_CERTIFICATE: '/apis/public/v8/certificate/validate',
}

@Injectable({
  providedIn: 'root',
})
export class CertificateService {

  constructor(public apiService: ApiService) { }

  validateCertificate(data: any): Observable<ServerResponse> {
    const option = {
      data,
      url: API_END_POINTS.VALIDATE_CERTIFICATE,
    }
    return this.apiService.post(option.url, option.data)
  }

}
