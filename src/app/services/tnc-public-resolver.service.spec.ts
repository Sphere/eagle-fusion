import { TestBed } from '@angular/core/testing'
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing'
import { TncPublicResolverService } from './tnc-public-resolver.service'
import { ConfigurationsService } from '@ws-widget/utils'
import { HttpClient } from '@angular/common/http'
// import { of } from 'rxjs'

describe('TncPublicResolverService', () => {
  let service: TncPublicResolverService
  let httpMock: HttpTestingController
  let configurationsServiceStub: Partial<ConfigurationsService>

  beforeEach(() => {
    configurationsServiceStub = {
      sitePath: 'http://example.com',
      unMappedUser: {
        profileDetails: {
          preferences: {
            language: 'en'
          }
        }
      }
    }

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        TncPublicResolverService,
        { provide: ConfigurationsService, useValue: configurationsServiceStub },
        HttpClient
      ]
    })

    service = TestBed.get(TncPublicResolverService)
    httpMock = TestBed.get(HttpTestingController)
  })

  afterEach(() => {
    httpMock.verify()
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  it('should resolve the terms and conditions', () => {
    const mockResponse = { term: 'mocked term' }

    service.resolve().subscribe(response => {
      expect(response.data).toEqual(mockResponse)
    })

    const req = httpMock.expectOne('http://example.com/tnc.config.json')
    expect(req.request.method).toBe('GET')

    req.flush(mockResponse)
  })

  it('should handle error when resolving terms and conditions', () => {
    const errorMessage = 'Error retrieving terms and conditions'

    service.resolve().subscribe(response => {
      expect(response.error).toEqual(errorMessage)
    })

    const req = httpMock.expectOne('http://example.com/tnc.config.json')
    expect(req.request.method).toBe('GET')

    req.error(new ErrorEvent(errorMessage))
  })

  // it('should get public terms and conditions in Hindi', () => {
  //   configurationsServiceStub.unMappedUser.profileDetails.preferences.language = 'hi'

  //   service.resolve().subscribe()

  //   const req = httpMock.expectOne('http://example.com/tnc.config.hi.json')
  //   expect(req.request.method).toBe('GET')
  // })

  it('should assign admin to department', () => {
    const mockData = { departmentId: 'mock-id', adminId: 'mock-admin-id' }

    service.assignAdminToDepartment(mockData).subscribe(response => {
      expect(response).toBeTruthy()
    })

    const req = httpMock.expectOne('/apis/proxies/v8/user/private/v1/assign/role')
    expect(req.request.method).toBe('POST')

    req.flush({})
  })

  // it('should sign up user', () => {
  //   const mockData = { email: 'test@example.com', password: 'password' }

  //   service.signup(mockData).subscribe(response => {
  //     expect(response).toBeTruthy()
  //   })

  //   const req = httpMock.expectOne('/apis/protected/v8/user/profileDetails/createUser')
  //   expect(req.request.method).toBe('POST')

  //   req.flush({})
  // })

  it('should register with mobile', () => {
    const mockData = { mobile: '1234567890', otp: '123456' }

    service.registerWithMobile(mockData).subscribe(response => {
      expect(response).toBeTruthy()
    })

    const req = httpMock.expectOne('/apis/public/v8/register/registerUserWithMobile')
    expect(req.request.method).toBe('POST')

    req.flush({})
  })

  it('should verify user mobile', () => {
    const mockData = { mobile: '1234567890', otp: '123456' }

    service.verifyUserMobile(mockData).subscribe(response => {
      expect(response).toBeTruthy()
    })

    const req = httpMock.expectOne('/apis/public/v8/register/verifyUserWithMobileNumber')
    expect(req.request.method).toBe('POST')

    req.flush({})
  })

  it('should return default language when no language preference is set', () => {
    delete configurationsServiceStub.unMappedUser.profileDetails.preferences.language

    service.resolve().subscribe()

    const req = httpMock.expectOne('http://example.com/tnc.config.json')
    expect(req.request.method).toBe('GET')
  })

  it('should return default language when language preference is invalid', () => {
    configurationsServiceStub.unMappedUser.profileDetails.preferences.language = 'invalid'

    service.resolve().subscribe()

    const req = httpMock.expectOne('http://example.com/tnc.config.json')
    expect(req.request.method).toBe('GET')
  })
})
