import { Injectable } from '@angular/core'
import { Observable } from 'rxjs'
import { ServerResponse } from 'http'
import { ApiService } from '@ws/author/src/public-api'
import { API_END_POINTS } from '../../../constants/apiConstants'

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
