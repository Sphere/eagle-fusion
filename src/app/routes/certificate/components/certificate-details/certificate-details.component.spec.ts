jest.mock('lodash', () => ({
  trim: (s: string) => (s || '').trim(),
  upperCase: (s: string) => {
    // replicate lodash upperCase: 'aastrika' → 'AASTRIKA', 'nhsrc' → 'NHSRC'
    return (s || '').replaceAll(/([a-z])([A-Z])/g, '$1 $2').trim().toUpperCase()
  },
  get: (obj: any, path: string | string[], defaultValue?: any) => {
    const keys = Array.isArray(path) ? path : (path as string).split('.')
    let result: any = obj
    for (const key of keys) {
      if (result == null) return defaultValue
      result = result[key]
    }
    return result !== undefined ? result : defaultValue
  },
}))

jest.mock('@ws-widget/utils', () => ({
  ConfigurationsService: class {
    rootOrg = 'aastrika'
  },
}))

jest.mock('../../services/certificate.service', () => ({
  CertificateService: class {
    validateCertificate = jest.fn()
  },
}))

jest.mock('@ws/author/src/public-api', () => ({
  ApiService: class {
    get = jest.fn()
  },
}))

import { of, throwError } from 'rxjs'
import { CertificateDetailsComponent } from './certificate-details.component'

describe('CertificateDetailsComponent', () => {
  let component: CertificateDetailsComponent
  let mockRoute: any
  let mockCertSvc: any
  let mockConfigSvc: any
  let mockSanitizer: any
  let mockApiService: any
  let mockRouter: any
  let mockCdr: any

  beforeEach(() => {
    mockRoute = { snapshot: { params: { uuid: 'cert-uuid-123' } } }
    mockCertSvc = {
      validateCertificate: jest.fn().mockReturnValue(of({})),
      verifyCertificate: jest.fn().mockReturnValue(of({ found: false })),
    }
    mockConfigSvc = { rootOrg: 'aastrika' }
    mockSanitizer = {
      trust: jest.fn().mockImplementation(url => ({ safe: url })),
      toImageSource: jest.fn().mockReturnValue('blob:rendered'),
      trustImageSrc: jest.fn().mockImplementation(src => ({ safeImg: src })),
    }
    mockApiService = { get: jest.fn().mockReturnValue(of({})) }
    mockRouter = { navigate: jest.fn() }
    mockCdr = { detectChanges: jest.fn() }

    component = new CertificateDetailsComponent(
      mockRoute,
      mockCertSvc,
      mockConfigSvc,
      mockSanitizer,
      mockApiService,
      mockRouter,
      mockCdr,
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should default error to false', () => {
    expect(component.error).toBe(false)
  })

  it('should default enableVerifyButton to false', () => {
    expect(component.enableVerifyButton).toBe(false)
  })

  it('should default wrongCertificateCode to false', () => {
    expect(component.wrongCertificateCode).toBe(false)
  })

  it('should set instance in uppercase on ngOnInit', () => {
    component.ngOnInit()
    expect(component.instance).toBe('AASTRIKA')
  })

  it('should set appIcon on ngOnInit', () => {
    component.ngOnInit()
    expect(mockSanitizer.trust).toHaveBeenCalledWith(
      'fusion-assets/images/Sphere_Logo_4.svg',
    )
    expect(component.appIcon).toBeTruthy()
  })

  it('should use rootOrg from configService for instance', () => {
    mockConfigSvc.rootOrg = 'nhsrc'
    component.ngOnInit()
    expect(component.instance).toBe('NHSRC')
  })

  describe('getCodeLength', () => {
    it('should enable verify button when code length is 6', () => {
      component.getCodeLength({ target: { value: 'ABC123' } })
      expect(component.enableVerifyButton).toBe(true)
    })

    it('should disable verify button when code length is less than 6', () => {
      component.enableVerifyButton = true
      component.getCodeLength({ target: { value: 'ABC' } })
      expect(component.enableVerifyButton).toBe(false)
    })

    it('should reset wrongCertificateCode on any input', () => {
      component.wrongCertificateCode = true
      component.getCodeLength({ target: { value: 'X' } })
      expect(component.wrongCertificateCode).toBe(false)
    })
  })

  describe('contactDisplay getter', () => {
    it('should return maskedPhone when available', () => {
      component.maskedPhone = '+91-9876543210'
      component.maskedEmail = 'test@example.com'
      expect(component.contactDisplay).toBe('+91-9876543210')
    })

    it('should return maskedEmail when maskedPhone is empty', () => {
      component.maskedPhone = ''
      component.maskedEmail = 'test@example.com'
      expect(component.contactDisplay).toBe('test@example.com')
    })

    it('should return empty string when neither phone nor email available', () => {
      component.maskedPhone = ''
      component.maskedEmail = ''
      expect(component.contactDisplay).toBe('')
    })
  })

  describe('certificateVerify', () => {
    it('should call validateCertificate with uuid from route', () => {
      component.codeInputField = { nativeElement: { value: '', focus: jest.fn() } } as any
      component.certificateCode = 'ABC123'
      component.certificateVerify()
      expect(mockCertSvc.validateCertificate).toHaveBeenCalledWith(
        expect.objectContaining({ certId: 'cert-uuid-123', accessCode: 'ABC123' }),
      )
    })

    it('should set viewCertificate, recipient, courseName, maskedEmail and maskedPhone on success', () => {
      const certData = {
        recipient: { name: 'John Doe' },
        badge: { name: 'Test Course' },
        issuedOn: '2023-01-15T00:00:00.000Z',
      }
      const response = {
        response: { json: certData },
        maskedEmail: 'j***@example.com',
        maskedPhone: '+91-98***',
      }
      mockCertSvc.validateCertificate = jest.fn().mockReturnValue(of(response))
      component.codeInputField = { nativeElement: { value: '', focus: jest.fn() } } as any
      component.certificateCode = 'ABC123'
      component.certificateVerify()
      expect(component.viewCertificate).toBe(true)
      expect(component.loader).toBe(false)
      expect(component.recipient).toBe('John Doe')
      expect(component.courseName).toBe('Test Course')
      expect(component.maskedEmail).toBe('j***@example.com')
      expect(component.maskedPhone).toBe('+91-98***')
    })

    it('should set wrongCertificateCode on API error', () => {
      component.codeInputField = { nativeElement: { value: '', focus: jest.fn() } } as any
      mockCertSvc.validateCertificate.mockReturnValue(throwError(() => new Error('API error')))
      component.certificateVerify()
      expect(component.wrongCertificateCode).toBe(true)
      expect(component.loader).toBe(false)
      expect(component.enableVerifyButton).toBe(false)
    })
  })

  describe('getCourseVideoUrl', () => {
    it('should set watchVideoLink and extract contentId from URL', () => {
      const response = { result: { content: { certVideoUrl: 'https://example.com/do_12345/video.mp4' } } }
      mockApiService.get = jest.fn().mockReturnValue(of(response))
      component.getCourseVideoUrl('course_123')
      expect(component.watchVideoLink).toBe('https://example.com/do_12345/video.mp4')
      expect(component.contentId).toBe('do_12345')
    })

    it('should not set contentId when certVideoUrl is absent', () => {
      const response = { result: { content: {} } }
      mockApiService.get = jest.fn().mockReturnValue(of(response))
      component.getCourseVideoUrl('course_123')
      expect(component.watchVideoLink).toBeFalsy()
    })

    it('should handle error silently', () => {
      mockApiService.get = jest.fn().mockReturnValue(throwError(() => new Error('err')))
      expect(() => component.getCourseVideoUrl('course_123')).not.toThrow()
    })
  })

  describe('getCollectionHierarchy', () => {
    it('should return observable that sets collectionData', done => {
      const response = { result: { content: { id: 'c1' } } }
      mockApiService.get = jest.fn().mockReturnValue(of(response))
      component.getCollectionHierarchy('course_123').subscribe(res => {
        expect(res).toEqual(response)
        expect(component.collectionData).toEqual({ id: 'c1' })
        done()
      })
    })

    it('should build request URL from identifier', () => {
      mockApiService.get = jest.fn().mockReturnValue(of({ result: { content: {} } }))
      component.getCollectionHierarchy('abc_789')
      expect(mockApiService.get).toHaveBeenCalledWith('course/v1/hierarchy/abc_789', {})
    })
  })

  describe('verifyFromQr', () => {
    const rcCertificate = {
      certificateId: 'rc-1',
      courseName: 'Newborn Care',
      entity: 'TrainingCertificate',
      issuedOn: '2026-03-05',
      issuerName: 'in',
      recipientName: 'Asha Devi',
      revoked: false,
    }

    it('passes the uuid and the entity query param to verifyCertificate', () => {
      mockRoute.snapshot.queryParamMap = { get: jest.fn().mockReturnValue('TrainingCertificate') }
      component.verifyFromQr()
      expect(mockRoute.snapshot.queryParamMap.get).toHaveBeenCalledWith('entity')
      expect(mockCertSvc.verifyCertificate).toHaveBeenCalledWith('cert-uuid-123', 'TrainingCertificate')
    })

    it('passes an undefined entity when the route has no query params', () => {
      component.verifyFromQr()
      expect(mockCertSvc.verifyCertificate).toHaveBeenCalledWith('cert-uuid-123', undefined)
    })

    it('shows a valid RC certificate with its rendered image', () => {
      mockCertSvc.verifyCertificate.mockReturnValue(of({ found: true, certificate: rcCertificate, printUri: '<svg/>' }))
      component.maskedEmail = 'old@example.com'
      component.maskedPhone = '+91-98***'
      component.verifyFromQr()
      expect(component.stage).toBe('verified')
      expect(component.viewCertificate).toBe(true)
      expect(component.loader).toBe(false)
      expect(component.recipient).toBe('Asha Devi')
      expect(component.courseName).toBe('Newborn Care')
      expect(component.issuedOn).toBe('05 Mar 2026')
      expect(component.contactDisplay).toBe('')
      expect(mockSanitizer.toImageSource).toHaveBeenCalledWith('<svg/>', expect.any(Array))
      expect(mockSanitizer.trustImageSrc).toHaveBeenCalledWith('blob:rendered')
      expect(component.certificateImage).toEqual({ safeImg: 'blob:rendered' })
      expect(mockCdr.detectChanges).toHaveBeenCalled()
    })

    it('leaves the image empty when RC returns no printUri', () => {
      mockCertSvc.verifyCertificate.mockReturnValue(of({ found: true, certificate: rcCertificate }))
      component.verifyFromQr()
      expect(component.stage).toBe('verified')
      expect(component.certificateImage).toBeNull()
      expect(mockSanitizer.toImageSource).not.toHaveBeenCalled()
    })

    it('keeps a non-date issuedOn as it is', () => {
      const certificate = { ...rcCertificate, issuedOn: '1712345678' }
      mockCertSvc.verifyCertificate.mockReturnValue(of({ found: true, certificate }))
      component.verifyFromQr()
      expect(component.issuedOn).toBe('1712345678')
    })

    it('shows an empty issuedOn when RC sends none', () => {
      const certificate = { ...rcCertificate, issuedOn: undefined as any }
      mockCertSvc.verifyCertificate.mockReturnValue(of({ found: true, certificate }))
      component.verifyFromQr()
      expect(component.issuedOn).toBe('')
    })

    it('marks a revoked certificate as invalid', () => {
      mockCertSvc.verifyCertificate.mockReturnValue(of({ found: true, certificate: { ...rcCertificate, revoked: true } }))
      component.verifyFromQr()
      expect(component.stage).toBe('invalid')
      expect(component.viewCertificate).toBeFalsy()
      expect(component.loader).toBe(false)
    })

    it('falls back to the access code when not found and migration is not complete', () => {
      mockCertSvc.verifyCertificate.mockReturnValue(of({ found: false }))
      component.verifyFromQr()
      expect(component.migrationCompleted).toBe(false)
      expect(component.stage).toBe('code')
      expect(component.loader).toBe(false)
    })

    it('reports invalid when not found and migration is complete', () => {
      mockConfigSvc.instanceConfig = { certificateMigrationCompleted: true }
      mockCertSvc.verifyCertificate.mockReturnValue(of({ found: false }))
      component.verifyFromQr()
      expect(component.migrationCompleted).toBe(true)
      expect(component.stage).toBe('invalid')
    })

    it('treats a found response without a certificate as not found', () => {
      mockCertSvc.verifyCertificate.mockReturnValue(of({ found: true }))
      component.verifyFromQr()
      expect(component.stage).toBe('code')
    })

    it('treats a null response as not found', () => {
      mockCertSvc.verifyCertificate.mockReturnValue(of(null))
      component.verifyFromQr()
      expect(component.stage).toBe('code')
    })

    it('reports invalid on a 400 error', () => {
      mockCertSvc.verifyCertificate.mockReturnValue(throwError(() => ({ status: 400 })))
      component.verifyFromQr()
      expect(component.stage).toBe('invalid')
      expect(component.loader).toBe(false)
      expect(mockCdr.detectChanges).toHaveBeenCalled()
    })

    it('falls back to the access code when RC is unreachable', () => {
      mockCertSvc.verifyCertificate.mockReturnValue(throwError(() => ({ status: 502 })))
      component.verifyFromQr()
      expect(component.stage).toBe('code')
      expect(component.loader).toBe(false)
    })

    it('runs on ngOnInit', () => {
      component.ngOnInit()
      expect(mockCertSvc.verifyCertificate).toHaveBeenCalledWith('cert-uuid-123', undefined)
    })
  })

  describe('ngOnDestroy', () => {
    it('revokes the blob URLs created for the certificate image', () => {
      const revoke = jest.fn()
      const originalRevoke = URL.revokeObjectURL
      URL.revokeObjectURL = revoke
      mockSanitizer.toImageSource.mockImplementation((_uri: string, urls: string[]) => {
        urls.push('blob:one')
        return 'blob:one'
      })
      mockCertSvc.verifyCertificate.mockReturnValue(of({
        found: true,
        printUri: '<svg/>',
        certificate: { recipientName: 'A', courseName: 'B', issuedOn: '2026-01-01', revoked: false },
      }))
      component.verifyFromQr()
      component.ngOnDestroy()
      expect(revoke).toHaveBeenCalledWith('blob:one')
      URL.revokeObjectURL = originalRevoke
    })

    it('does nothing when no image was rendered', () => {
      expect(() => component.ngOnDestroy()).not.toThrow()
    })
  })

  describe('certificateVerify stage', () => {
    it('moves to the verified stage on a valid access code', () => {
      mockCertSvc.validateCertificate.mockReturnValue(of({ response: { json: { issuedOn: '2023-01-15' } } }))
      component.codeInputField = { nativeElement: { value: '', focus: jest.fn() } } as any
      component.certificateVerify()
      expect(component.stage).toBe('verified')
      expect(component.maskedEmail).toBe('')
      expect(component.maskedPhone).toBe('')
    })
  })
})
