jest.mock('@ws/author/src/public-api', () => ({
  ApiService: class { post = jest.fn() },
}))

jest.mock('../../../constants/apiConstants', () => ({
  API_END_POINTS: { VALIDATE_CERTIFICATE: '/apis/validate-certificate' },
}))

import { of } from 'rxjs'
import { CertificateService } from './certificate.service'
import { ApiService } from '@ws/author/src/public-api'

describe('CertificateService', () => {
  let service: CertificateService
  let mockApiSvc: any

  beforeEach(() => {
    mockApiSvc = new ApiService()
    mockApiSvc.post = jest.fn().mockReturnValue(of({ responseCode: 'OK', result: {} }))
    service = new CertificateService(mockApiSvc)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should create', () => {
    expect(service).toBeTruthy()
  })

  it('validateCertificate calls apiService.post with VALIDATE_CERTIFICATE endpoint', (done) => {
    const certData = { certId: 'cert-123', userId: 'user-1' }
    service.validateCertificate(certData).subscribe(() => {
      expect(mockApiSvc.post).toHaveBeenCalledWith('/apis/validate-certificate', certData)
      done()
    })
  })

  it('validateCertificate returns the observable from apiService.post', (done) => {
    mockApiSvc.post.mockReturnValue(of({ responseCode: 'OK', result: { isValid: true } }))
    service.validateCertificate({}).subscribe(res => {
      expect((res as any).responseCode).toBe('OK')
      done()
    })
  })
})
