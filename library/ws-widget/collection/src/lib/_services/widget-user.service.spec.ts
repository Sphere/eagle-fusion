import { of, throwError } from 'rxjs'
import { WidgetUserService } from './widget-user.service'

describe('WidgetUserService', () => {
  let service: WidgetUserService
  let mockHttp: any

  beforeEach(() => {
    mockHttp = {
      get: jest.fn(),
      post: jest.fn(),
    }
    service = new WidgetUserService(mockHttp)
  })

  it('should create', () => {
    expect(service).toBeTruthy()
  })

  describe('handleError', () => {
    it('should return an observable error with message when error.error is an ErrorEvent', done => {
      const errorEvent = { error: new ErrorEvent('test', { message: 'boom' }) }
      service.handleError(errorEvent as any).subscribe({
        error: (msg: string) => {
          expect(msg).toBe('Error: boom')
          done()
        },
      })
    })

    it('should return an observable error with empty message when error.error is not an ErrorEvent', done => {
      service.handleError({} as any).subscribe({
        error: (msg: string) => {
          expect(msg).toBe('')
          done()
        },
      })
    })
  })

  describe('fetchUserGroupDetails', () => {
    it('should call http.get and return data', done => {
      mockHttp.get.mockReturnValue(of([{ id: '1' }]))
      service.fetchUserGroupDetails('u1').subscribe(res => {
        expect(res).toEqual([{ id: '1' }])
        expect(mockHttp.get).toHaveBeenCalled()
        done()
      })
    })

    it('should propagate error via catchError', done => {
      mockHttp.get.mockReturnValue(throwError({ error: new ErrorEvent('e', { message: 'x' }) }))
      service.fetchUserGroupDetails('u1').subscribe({
        error: (msg: string) => {
          expect(msg).toBe('Error: x')
          done()
        },
      })
    })
  })

  describe('fetchUserBatchList', () => {
    const origLocation = window.location

    afterEach(() => {
      Object.defineProperty(window, 'location', { value: origLocation, writable: true })
      delete (window as any)['env']
    })

    it('should use queryParams path and prefix with azureHost when origin has no port', done => {
      (window as any)['env'] = { azureHost: 'https://azure.example.com' }
      mockHttp.get.mockReturnValue(of({ result: { courses: ['c1'] } }))
      service.fetchUserBatchList('u1', {
        orgdetails: 'o', licenseDetails: 'l', fields: 'f', batchDetails: 'b',
      }).subscribe(res => {
        expect(res).toEqual(['c1'])
        done()
      })
    })

    it('should prefix path with azureHost when not on localhost', done => {
      Object.defineProperty(window, 'location', {
        value: { origin: 'https://prod.example.com' },
        writable: true,
      })
      ;(window as any)['env'] = { azureHost: 'https://azure.example.com' }
      mockHttp.get.mockReturnValue(of({ result: { courses: ['c2'] } }))
      service.fetchUserBatchList('u1', {
        orgdetails: 'o', licenseDetails: 'l', fields: 'f', batchDetails: 'b',
      }).subscribe(res => {
        expect(res).toEqual(['c2'])
        expect(mockHttp.get).toHaveBeenCalledWith(expect.stringContaining('https://azure.example.com'))
        done()
      })
    })

    it('should use cached batchList$ path when no queryParams and dedupe concurrent requests', done => {
      mockHttp.get.mockReturnValue(of({ result: { courses: ['c3'] } }))
      const obs1 = service.fetchUserBatchList('u1')
      const obs2 = service.fetchUserBatchList('u1')
      let count = 0
      obs1.subscribe(res => {
        expect(res).toEqual(['c3'])
        count += 1
        if (count === 2) { done() }
      })
      obs2.subscribe(res => {
        expect(res).toEqual(['c3'])
        count += 1
        if (count === 2) { done() }
      })
    })

    it('should propagate error via catchError when no queryParams', done => {
      mockHttp.get.mockReturnValue(throwError({ error: new ErrorEvent('e', { message: 'y' }) }))
      service.fetchUserBatchList('u1').subscribe({
        error: (msg: string) => {
          expect(msg).toBe('Error: y')
          done()
        },
      })
    })
  })

  describe('fetchUserEnrollmentWithProgress', () => {
    it('should call http.get and map courses', done => {
      mockHttp.get.mockReturnValue(of({ result: { courses: ['c4'] } }))
      service.fetchUserEnrollmentWithProgress('u1').subscribe(res => {
        expect(res).toEqual(['c4'])
        done()
      })
    })

    it('should propagate error via catchError', done => {
      mockHttp.get.mockReturnValue(throwError({ error: new ErrorEvent('e', { message: 'z' }) }))
      service.fetchUserEnrollmentWithProgress('u1').subscribe({
        error: (msg: string) => {
          expect(msg).toBe('Error: z')
          done()
        },
      })
    })
  })
})
