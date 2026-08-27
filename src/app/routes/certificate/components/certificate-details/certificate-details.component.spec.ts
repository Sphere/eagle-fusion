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
    mockCertSvc = { validateCertificate: jest.fn().mockReturnValue(of({})) }
    mockConfigSvc = { rootOrg: 'aastrika' }
    mockSanitizer = {
      trust: jest.fn().mockImplementation(url => ({ safe: url })),
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
})
