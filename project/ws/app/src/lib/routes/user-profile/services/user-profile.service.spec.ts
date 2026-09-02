import { of, throwError } from 'rxjs'
import { UserProfileService } from './user-profile.service'

describe('UserProfileService', () => {
  let service: UserProfileService
  let httpMock: any
  let userDataCacheSvcMock: any
  let loggerMock: any

  beforeEach(() => {
    httpMock = {
      post: jest.fn(),
      get: jest.fn(),
    }
    userDataCacheSvcMock = {
      clearUserData: jest.fn(),
      getCachedUserData: jest.fn(),
      setUserData: jest.fn(),
    }
    loggerMock = {
      log: jest.fn(),
      error: jest.fn(),
    }
    service = new UserProfileService(httpMock, userDataCacheSvcMock, loggerMock)
  })

  it('should create', () => {
    expect(service).toBeTruthy()
  })

  describe('updateProfileDetails', () => {
    it('should clear caches and emit on success', done => {
      const response = { name: 'test' }
      httpMock.post.mockReturnValue(of(response))
      service.updateProfileDetails({ a: 1 }).subscribe(res => {
        expect(res).toEqual(response)
        expect(userDataCacheSvcMock.clearUserData).toHaveBeenCalled()
        done()
      })
      service.updateuser$.subscribe(val => {
        if (val) {
          expect(val).toEqual(response)
        }
      })
    })

    it('should log and rethrow on error', done => {
      const error = new Error('fail')
      httpMock.post.mockReturnValue(throwError(() => error))
      service.updateProfileDetails({ a: 1 }).subscribe({
        error: err => {
          expect(err).toBe(error)
          expect(loggerMock.error).toHaveBeenCalled()
          done()
        },
      })
    })
  })

  it('getUserdetails should post with email', () => {
    httpMock.post.mockReturnValue(of([{}]))
    service.getUserdetails('a@b.com').subscribe()
    expect(httpMock.post).toHaveBeenCalledWith(expect.anything(), { email: 'a@b.com' })
  })

  describe('bnrcRegistration', () => {
    it('should post value', done => {
      httpMock.post.mockReturnValue(of({ ok: true }))
      service.bnrcRegistration({ x: 1 }).subscribe(res => {
        expect(res).toEqual({ ok: true })
        done()
      })
    })
    it('should log and rethrow on error', done => {
      const error = new Error('fail')
      httpMock.post.mockReturnValue(throwError(() => error))
      service.bnrcRegistration({ x: 1 }).subscribe({
        error: err => {
          expect(err).toBe(error)
          done()
        },
      })
    })
  })

  describe('bnrcSendOtp', () => {
    it('should post phone', done => {
      httpMock.post.mockReturnValue(of({ ok: true }))
      service.bnrcSendOtp({ phone: '123' }).subscribe(res => {
        expect(res).toEqual({ ok: true })
        done()
      })
    })
    it('should log and rethrow on error', done => {
      httpMock.post.mockReturnValue(throwError(() => new Error('fail')))
      service.bnrcSendOtp({ phone: '123' }).subscribe({
        error: () => done(),
      })
    })
  })

  it('bnrcResendOtp should post phone', done => {
    httpMock.post.mockReturnValue(of([{}]))
    service.bnrcResendOtp({ phone: '123' }).subscribe(res => {
      expect(res).toBeTruthy()
      done()
    })
  })

  describe('bnrcValidateOtp', () => {
    it('should post value', done => {
      httpMock.post.mockReturnValue(of({ ok: true }))
      service.bnrcValidateOtp({ phone: '123', otp: '111' }).subscribe(res => {
        expect(res).toEqual({ ok: true })
        done()
      })
    })
    it('should log and rethrow on error', done => {
      httpMock.post.mockReturnValue(throwError(() => new Error('fail')))
      service.bnrcValidateOtp({ phone: '123', otp: '111' }).subscribe({
        error: () => done(),
      })
    })
  })

  describe('upsmfRegistration', () => {
    it('should post value', done => {
      httpMock.post.mockReturnValue(of({ ok: true }))
      service.upsmfRegistration({ x: 1 }).subscribe(res => {
        expect(res).toEqual({ ok: true })
        done()
      })
    })
    it('should log and rethrow on error', done => {
      httpMock.post.mockReturnValue(throwError(() => new Error('fail')))
      service.upsmfRegistration({ x: 1 }).subscribe({
        error: () => done(),
      })
    })
  })

  describe('upsmfSendOtp', () => {
    it('should post phone', done => {
      httpMock.post.mockReturnValue(of({ ok: true }))
      service.upsmfSendOtp({ phone: '123' }).subscribe(res => {
        expect(res).toEqual({ ok: true })
        done()
      })
    })
    it('should log and rethrow on error', done => {
      httpMock.post.mockReturnValue(throwError(() => new Error('fail')))
      service.upsmfSendOtp({ phone: '123' }).subscribe({
        error: () => done(),
      })
    })
  })

  describe('upsmfResendOtp', () => {
    it('should post phone', done => {
      httpMock.post.mockReturnValue(of({ ok: true }))
      service.upsmfResendOtp({ phone: '123' }).subscribe(res => {
        expect(res).toEqual({ ok: true })
        done()
      })
    })
    it('should log and rethrow on error', done => {
      httpMock.post.mockReturnValue(throwError(() => new Error('fail')))
      service.upsmfResendOtp({ phone: '123' }).subscribe({
        error: () => done(),
      })
    })
  })

  describe('mpValidateOtp', () => {
    it('should post value', done => {
      httpMock.post.mockReturnValue(of({ ok: true }))
      service.mpValidateOtp({ phone: '123', otp: '111' }).subscribe(res => {
        expect(res).toEqual({ ok: true })
        done()
      })
    })
    it('should log and rethrow on error', done => {
      httpMock.post.mockReturnValue(throwError(() => new Error('fail')))
      service.mpValidateOtp({ phone: '123', otp: '111' }).subscribe({
        error: () => done(),
      })
    })
  })

  describe('mpRegistration', () => {
    it('should post value', done => {
      httpMock.post.mockReturnValue(of({ ok: true }))
      service.mpRegistration({ x: 1 }).subscribe(res => {
        expect(res).toEqual({ ok: true })
        done()
      })
    })
    it('should log and rethrow on error', done => {
      httpMock.post.mockReturnValue(throwError(() => new Error('fail')))
      service.mpRegistration({ x: 1 }).subscribe({
        error: () => done(),
      })
    })
  })

  describe('mpSendOtp', () => {
    it('should post phone', done => {
      httpMock.post.mockReturnValue(of({ ok: true }))
      service.mpSendOtp({ phone: '123' }).subscribe(res => {
        expect(res).toEqual({ ok: true })
        done()
      })
    })
    it('should log and rethrow on error', done => {
      httpMock.post.mockReturnValue(throwError(() => new Error('fail')))
      service.mpSendOtp({ phone: '123' }).subscribe({
        error: () => done(),
      })
    })
  })

  describe('mpResendOtp', () => {
    it('should post phone', done => {
      httpMock.post.mockReturnValue(of({ ok: true }))
      service.mpResendOtp({ phone: '123' }).subscribe(res => {
        expect(res).toEqual({ ok: true })
        done()
      })
    })
    it('should log and rethrow on error', done => {
      httpMock.post.mockReturnValue(throwError(() => new Error('fail')))
      service.mpResendOtp({ phone: '123' }).subscribe({
        error: () => done(),
      })
    })
  })

  describe('upsmfValidateOtp', () => {
    it('should post value', done => {
      httpMock.post.mockReturnValue(of({ ok: true }))
      service.upsmfValidateOtp({ phone: '123', otp: '111' }).subscribe(res => {
        expect(res).toEqual({ ok: true })
        done()
      })
    })
    it('should log and rethrow on error', done => {
      httpMock.post.mockReturnValue(throwError(() => new Error('fail')))
      service.upsmfValidateOtp({ phone: '123', otp: '111' }).subscribe({
        error: () => done(),
      })
    })
  })

  describe('getMasterLanguages', () => {
    it('should get languages', done => {
      httpMock.get.mockReturnValue(of({ languages: [] }))
      service.getMasterLanguages().subscribe(res => {
        expect(res).toEqual({ languages: [] })
        done()
      })
    })
    it('should log and rethrow on error', done => {
      httpMock.get.mockReturnValue(throwError(() => new Error('fail')))
      service.getMasterLanguages().subscribe({
        error: () => done(),
      })
    })
  })

  describe('getMasterNationlity', () => {
    it('should get nationality', done => {
      httpMock.get.mockReturnValue(of({ nationality: [] }))
      service.getMasterNationlity().subscribe(res => {
        expect(res).toEqual({ nationality: [] })
        done()
      })
    })
    it('should log and rethrow on error', done => {
      httpMock.get.mockReturnValue(throwError(() => new Error('fail')))
      service.getMasterNationlity().subscribe({
        error: () => done(),
      })
    })
  })

  describe('getUserdetailsFromRegistry', () => {
    it('should return in-memory cached data if present', done => {
      httpMock.get.mockReturnValue(of({ result: { response: { name: 'first' } } }))
      service.getUserdetailsFromRegistry('wid1').subscribe(() => {
        service.getUserdetailsFromRegistry('wid1').subscribe(res => {
          expect(res).toEqual({ name: 'first' })
          expect(httpMock.get).toHaveBeenCalledTimes(1)
          done()
        })
      })
    })

    it('should use global cache when available and userId present', done => {
      userDataCacheSvcMock.getCachedUserData.mockReturnValue({ userId: 'u1', name: 'global' })
      service.getUserdetailsFromRegistry('wid2').subscribe(res => {
        expect(res).toEqual({ userId: 'u1', name: 'global' })
        expect(httpMock.get).not.toHaveBeenCalled()
        done()
      })
    })

    it('should fetch from API and cache when not cached anywhere', done => {
      userDataCacheSvcMock.getCachedUserData.mockReturnValue(null)
      httpMock.get.mockReturnValue(of({ result: { response: { name: 'fromApi' } } }))
      service.getUserdetailsFromRegistry('wid3').subscribe(res => {
        expect(res).toEqual({ name: 'fromApi' })
        expect(userDataCacheSvcMock.setUserData).toHaveBeenCalledWith({ name: 'fromApi' })
        done()
      })
    })

    it('should throw on invalid API response format', done => {
      userDataCacheSvcMock.getCachedUserData.mockReturnValue(null)
      httpMock.get.mockReturnValue(of({ result: null }))
      service.getUserdetailsFromRegistry('wid4').subscribe({
        error: err => {
          expect(err.message).toBe('Invalid API response format')
          done()
        },
      })
    })

    it('should log and rethrow on http error', done => {
      userDataCacheSvcMock.getCachedUserData.mockReturnValue(null)
      httpMock.get.mockReturnValue(throwError(() => new Error('fail')))
      service.getUserdetailsFromRegistry('wid5').subscribe({
        error: () => done(),
      })
    })
  })

  describe('getAllDepartments', () => {
    it('should get departments', done => {
      httpMock.get.mockReturnValue(of([{ name: 'dept' }]))
      service.getAllDepartments().subscribe(res => {
        expect(res).toEqual([{ name: 'dept' }])
        done()
      })
    })
    it('should log and rethrow on error', done => {
      httpMock.get.mockReturnValue(throwError(() => new Error('fail')))
      service.getAllDepartments().subscribe({
        error: () => done(),
      })
    })
  })

  describe('approveRequest', () => {
    it('should post data', done => {
      httpMock.post.mockReturnValue(of({ ok: true }))
      service.approveRequest({ id: 1 }).subscribe(res => {
        expect(res).toEqual({ ok: true })
        done()
      })
    })
    it('should log and rethrow on error', done => {
      httpMock.post.mockReturnValue(throwError(() => new Error('fail')))
      service.approveRequest({ id: 1 }).subscribe({
        error: () => done(),
      })
    })
  })

  describe('listApprovalPendingFields', () => {
    it('should post request payload', done => {
      httpMock.post.mockReturnValue(of([]))
      service.listApprovalPendingFields().subscribe(res => {
        expect(res).toEqual([])
        expect(httpMock.post).toHaveBeenCalledWith(expect.anything(), {
          serviceName: 'profile',
          applicationStatus: 'SEND_FOR_APPROVAL',
        })
        done()
      })
    })
    it('should log and rethrow on error', done => {
      httpMock.post.mockReturnValue(throwError(() => new Error('fail')))
      service.listApprovalPendingFields().subscribe({
        error: () => done(),
      })
    })
  })

  describe('getLeaderBoardData', () => {
    it('should post request', done => {
      httpMock.post.mockReturnValue(of({ board: [] }))
      service.getLeaderBoardData({ x: 1 }).subscribe(res => {
        expect(res).toEqual({ board: [] })
        done()
      })
    })
    it('should log and rethrow on error', done => {
      httpMock.post.mockReturnValue(throwError(() => new Error('fail')))
      service.getLeaderBoardData({ x: 1 }).subscribe({
        error: () => done(),
      })
    })
  })

  describe('isBackgroundDetailsFilled', () => {
    it('should return false when profileReq missing required parts', () => {
      expect(service.isBackgroundDetailsFilled(undefined)).toBe(false)
      expect(service.isBackgroundDetailsFilled({})).toBe(false)
      expect(service.isBackgroundDetailsFilled({ personalDetails: {} })).toBe(false)
    })

    it('should return false when dob/postalAddress/profession missing', () => {
      const req = {
        personalDetails: {},
        professionalDetails: [{ profession: 'ASHA' }],
      }
      expect(service.isBackgroundDetailsFilled(req)).toBe(false)
    })

    it('should evaluate ASHA branch', () => {
      const req = {
        personalDetails: { dob: '1', postalAddress: '1' },
        professionalDetails: [{ profession: 'ASHA', block: 'b1' }],
      }
      expect(service.isBackgroundDetailsFilled(req)).toBe(true)

      const req2 = {
        personalDetails: { dob: '1', postalAddress: '1' },
        professionalDetails: [{ profession: 'ASHA' }],
      }
      expect(service.isBackgroundDetailsFilled(req2)).toBe(false)
    })

    it('should evaluate Others branch with Asha Facilitator', () => {
      const req = {
        personalDetails: { dob: '1', postalAddress: '1' },
        professionalDetails: [{ profession: 'Others', selectBackground: 'Asha Facilitator', block: 'b1' }],
      }
      expect(service.isBackgroundDetailsFilled(req)).toBe(true)

      const req2 = {
        personalDetails: { dob: '1', postalAddress: '1' },
        professionalDetails: [{ profession: 'Others', selectBackground: 'Asha Facilitator' }],
      }
      expect(service.isBackgroundDetailsFilled(req2)).toBe(false)

      const req3 = {
        personalDetails: { dob: '1', postalAddress: '1' },
        professionalDetails: [{ profession: 'Others' }],
      }
      expect(service.isBackgroundDetailsFilled(req3)).toBe(false)
    })

    it('should evaluate Student/Healthcare Volunteer/Healthcare Worker/Faculty branches', () => {
      ['Student', 'Healthcare Volunteer', 'Healthcare Worker', 'Faculty'].forEach(profession => {
        const filled = {
          personalDetails: { dob: '1', postalAddress: '1' },
          professionalDetails: [{ profession, designation: 'd1' }],
        }
        expect(service.isBackgroundDetailsFilled(filled)).toBe(true)

        const notFilled = {
          personalDetails: { dob: '1', postalAddress: '1' },
          professionalDetails: [{ profession }],
        }
        expect(service.isBackgroundDetailsFilled(notFilled)).toBe(false)
      })
    })
  })

  describe('clearUserDetailsCache', () => {
    it('should clear caches', () => {
      service.clearUserDetailsCache()
      expect(userDataCacheSvcMock.clearUserData).toHaveBeenCalled()
    })
  })

  describe('refreshGlobalUserDataCache', () => {
    it('should clear caches', () => {
      service.refreshGlobalUserDataCache()
      expect(userDataCacheSvcMock.clearUserData).toHaveBeenCalled()
    })
  })
})
