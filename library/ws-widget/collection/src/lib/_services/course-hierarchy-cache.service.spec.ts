import { of, throwError } from 'rxjs'
import { CourseHierarchyCacheService } from './course-hierarchy-cache.service'

describe('CourseHierarchyCacheService', () => {
  let service: CourseHierarchyCacheService
  let httpMock: any
  let logSpy: jest.SpyInstance
  let errorSpy: jest.SpyInstance

  beforeEach(() => {
    httpMock = {
      get: jest.fn(),
    }
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => { })
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => { })
    service = new CourseHierarchyCacheService(httpMock)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should create and log init event', () => {
    expect(service).toBeTruthy()
    expect(logSpy).toHaveBeenCalledWith('[Cache] Service initialized')
  })

  describe('getCourseHierarchy', () => {
    it('should return error observable for undefined courseId', done => {
      service.getCourseHierarchy('').subscribe({
        error: err => {
          expect(err.message).toBe('Course ID is required')
          expect(errorSpy).toHaveBeenCalled()
          done()
        },
      })
    })

    it('should return error observable for courseId string "undefined"', done => {
      service.getCourseHierarchy('undefined').subscribe({
        error: err => {
          expect(err.message).toBe('Course ID is required')
          done()
        },
      })
    })

    it('should fetch from API and cache in memory on first call', done => {
      httpMock.get.mockReturnValue(of({ pkgVersion: '2.0', content: 'data' }))
      service.getCourseHierarchy('course-1').subscribe(response => {
        expect(response).toEqual({ pkgVersion: '2.0', content: 'data' })
        expect(httpMock.get).toHaveBeenCalledTimes(1)
        done()
      })
    })

    it('should return from in-memory cache on second call without hitting API again', done => {
      httpMock.get.mockReturnValue(of({ pkgVersion: '1.0', content: 'data' }))
      service.getCourseHierarchy('course-2').subscribe(() => {
        service.getCourseHierarchy('course-2').subscribe(response => {
          expect(response).toEqual({ pkgVersion: '1.0', content: 'data' })
          expect(httpMock.get).toHaveBeenCalledTimes(1)
          done()
        })
      })
    })

    it('should treat cache entry as expired after CACHE_DURATION', () => {
      httpMock.get.mockReturnValue(of({ content: 'data' }))
      service.getCourseHierarchy('course-3').subscribe()
      const cached = (service as any).courseCache.get('course-3')
      cached.timestamp = Date.now() - (31 * 60 * 1000)
      service.getCourseHierarchy('course-3').subscribe()
      expect(httpMock.get).toHaveBeenCalledTimes(2)
    })

    it('should propagate API errors via catchError', done => {
      httpMock.get.mockReturnValue(throwError(() => new Error('network error')))
      service.getCourseHierarchy('course-err').subscribe({
        error: err => {
          expect(err.message).toBe('network error')
          done()
        },
      })
    })
  })

  describe('invalidateCache', () => {
    it('should remove a specific course from memory cache', done => {
      httpMock.get.mockReturnValue(of({ content: 'data' }))
      service.getCourseHierarchy('course-4').subscribe(() => {
        service.invalidateCache('course-4')
        expect((service as any).courseCache.has('course-4')).toBe(false)
        done()
      })
    })
  })

  describe('invalidateAllCache', () => {
    it('should clear all cached courses', done => {
      httpMock.get.mockReturnValue(of({ content: 'data' }))
      service.getCourseHierarchy('course-5').subscribe(() => {
        service.invalidateAllCache()
        expect((service as any).courseCache.size).toBe(0)
        done()
      })
    })
  })

  describe('getCacheStats', () => {
    it('should return inMemory count and formatted size for empty cache', () => {
      const stats = service.getCacheStats()
      expect(stats.inMemory).toBe(0)
      expect(stats.size).toMatch(/Bytes/)
    })

    it('should return non-zero size when cache has entries', done => {
      httpMock.get.mockReturnValue(of({ content: 'x'.repeat(2000) }))
      service.getCourseHierarchy('course-6').subscribe(() => {
        const stats = service.getCacheStats()
        expect(stats.inMemory).toBe(1)
        expect(stats.size).toMatch(/KB|Bytes|MB/)
        done()
      })
    })
  })
})
