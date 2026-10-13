import { Injectable } from '@angular/core'
import { Observable } from 'rxjs'
import { ServerResponse } from 'http'
import { ApiService } from '@ws/author/src/public-api'
import { API_END_POINTS } from '../../../constants/apiConstants'

/** Public view of a Sunbird RC certificate, as ui-proxies returns it for a QR scan. */
export interface IVerifiedCertificate {
  certificateId: string
  courseName: string
  entity: string
  issuedOn: string
  issuerName: string
  recipientName: string
  revoked: boolean
}

export interface ICertificateVerifyResponse {
  found: boolean
  certificate?: IVerifiedCertificate
  printUri?: string
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

  /**
   * Looks the QR's id up in Sunbird RC: by RC id first, then as the oldId of a migrated
   * certificate. `entity` is the QR's entity param (event certificates); `image` also
   * returns the rendered certificate.
   */
  verifyCertificate(id: string, entity?: string | null): Observable<ICertificateVerifyResponse> {
    const params: Record<string, string> = { image: 'true' }
    if (entity) {
      params.entity = entity
    }
    return this.apiService.get(`${API_END_POINTS.VERIFY_CERTIFICATE}/${encodeURIComponent(id)}`, { params })
  }

}
