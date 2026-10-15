jest.mock('@ws/author/src/public-api', () => ({
  ApiService: class { post = jest.fn(); get = jest.fn() },
}))

jest.mock('../../../constants/apiConstants', () => ({
  API_END_POINTS: {
    VALIDATE_CERTIFICATE: '/apis/validate-certificate',
    VERIFY_CERTIFICATE: '/apis/verify-certificate',
  },
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

  it('validateCertificate calls apiService.post with VALIDATE_CERTIFICATE endpoint', done => {
    const certData = { certId: 'cert-123', userId: 'user-1' }
    service.validateCertificate(certData).subscribe(() => {
      expect(mockApiSvc.post).toHaveBeenCalledWith('/apis/validate-certificate', certData)
      done()
    })
  })

  it('validateCertificate returns the observable from apiService.post', done => {
    mockApiSvc.post.mockReturnValue(of({ responseCode: 'OK', result: { isValid: true } }))
    service.validateCertificate({}).subscribe(res => {
      expect((res as any).responseCode).toBe('OK')
      done()
    })
  })

  describe('verifyCertificate', () => {
    beforeEach(() => {
      mockApiSvc.get = jest.fn().mockReturnValue(of({ found: false }))
    })

    it('requests the rendered image for the encoded id', () => {
      service.verifyCertificate('cert/1 2')
      expect(mockApiSvc.get).toHaveBeenCalledWith('/apis/verify-certificate/cert%2F1%202', { params: { image: 'true' } })
    })

    it('adds the entity param when the QR carries one', () => {
      service.verifyCertificate('cert-1', 'TrainingCertificate')
      expect(mockApiSvc.get).toHaveBeenCalledWith('/apis/verify-certificate/cert-1', {
        params: { image: 'true', entity: 'TrainingCertificate' },
      })
    })

    it('omits the entity param when it is null', () => {
      service.verifyCertificate('cert-1', null)
      expect(mockApiSvc.get).toHaveBeenCalledWith('/apis/verify-certificate/cert-1', { params: { image: 'true' } })
    })

    it('returns the observable from apiService.get', done => {
      mockApiSvc.get.mockReturnValue(of({ found: true, printUri: 'data:image/svg+xml,x' }))
      service.verifyCertificate('cert-1').subscribe(res => {
        expect(res).toEqual({ found: true, printUri: 'data:image/svg+xml,x' })
        done()
      })
    })
  })
})
