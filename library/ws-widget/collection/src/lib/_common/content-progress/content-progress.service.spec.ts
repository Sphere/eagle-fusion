import { of } from 'rxjs'
import { ContentProgressService } from './content-progress.service'

describe('ContentProgressService', () => {
  let service: ContentProgressService
  let mockHttp: any

  beforeEach(() => {
    mockHttp = {
      get: jest.fn(),
      post: jest.fn(),
    }
    service = new ContentProgressService(mockHttp)
  })

  it('should create', () => {
    expect(service).toBeTruthy()
  })

  describe('getProgressFor', () => {
    it('should fetch progress hash and emit the value for the given id', done => {
      mockHttp.get.mockReturnValue(of({ id1: 50 }))
      service.getProgressFor('id1').subscribe(progress => {
        expect(progress).toBe(50)
        done()
      })
    })

    it('should not refetch progress when already fetching', done => {
      mockHttp.get.mockReturnValue(of({ id1: 30 }))
      service.getProgressFor('id1').subscribe(() => { })
      service.getProgressFor('id1').subscribe(progress => {
        expect(progress).toBe(30)
        done()
      })
      expect(mockHttp.get).toHaveBeenCalledTimes(1)
    })
  })

  describe('getProgressHash', () => {
    it('should fetch and return the progress hash observable', done => {
      mockHttp.get.mockReturnValue(of({ id1: 10 }))
      service.getProgressHash().subscribe(hash => {
        expect(hash).toEqual({ id1: 10 })
        done()
      })
    })
  })

  describe('fetchProgressHashContentsId', () => {
    it('should post the contentIds and return response', done => {
      mockHttp.post.mockReturnValue(of({ ok: true }))
      service.fetchProgressHashContentsId(['c1']).subscribe(res => {
        expect(res).toEqual({ ok: true })
        expect(mockHttp.post).toHaveBeenCalledWith(expect.any(String), ['c1'])
        done()
      })
    })
  })

  describe('updateProgressHash', () => {
    it('should do nothing when progressHash is not yet fetched', () => {
      expect(() => service.updateProgressHash({ id1: { new_progress: 60 } })).not.toThrow()
    })

    it('should update matching ids in the existing progressHash and emit', done => {
      mockHttp.get.mockReturnValue(of({ id1: 10, id2: 20 }))
      let updated = false
      service.getProgressHash().subscribe(hash => {
        if (!updated) {
          updated = true
          service.updateProgressHash({ id1: { new_progress: 99 } })
        } else {
          expect(hash.id1).toBe(99)
          done()
        }
      })
    })

    it('should skip ids without new_progress', done => {
      mockHttp.get.mockReturnValue(of({ id1: 10 }))
      let checked = false
      service.getProgressHash().subscribe(hash => {
        if (!checked) {
          checked = true
          service.updateProgressHash({ id1: {} })
          expect(hash.id1).toBe(10)
          done()
        }
      })
    })
  })
})
