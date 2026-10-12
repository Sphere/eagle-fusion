// The jest moduleNameMapper points '@ws-widget/utils' at configurations.service only,
// so the query-param helper has to be provided explicitly here.
jest.mock('@ws-widget/utils', () => ({
  getStringifiedQueryParams: (obj: { [key: string]: any }) =>
    Object.entries(obj)
      .filter(u => u[1])
      .map(u => `${u[0]}=${u[1]}`)
      .join('&'),
}))

import { of } from 'rxjs'
import { ContentStripMultipleService } from './content-strip-multiple.service'

describe('ContentStripMultipleService', () => {
  let service: ContentStripMultipleService
  let mockHttp: any

  beforeEach(() => {
    mockHttp = { get: jest.fn().mockReturnValue(of({ result: {} })) }
    service = new ContentStripMultipleService(mockHttp)
  })

  afterEach(() => jest.clearAllMocks())

  it('should create', () => {
    expect(service).toBeTruthy()
  })

  describe('getContentStripResponseApi', () => {
    it('should call the bare path when there are no query params', done => {
      service.getContentStripResponseApi({ path: '/api/strip' } as any).subscribe(() => {
        expect(mockHttp.get).toHaveBeenCalledWith('/api/strip')
        done()
      })
    })

    it('should append the paging query params', done => {
      const request = {
        path: '/api/strip',
        queryParams: { pageNo: 2, pageSize: 10, pageState: 'next', sourceFields: 'name,id' },
      }
      service.getContentStripResponseApi(request as any).subscribe(() => {
        expect(mockHttp.get).toHaveBeenCalledWith(
          '/api/strip?pageNo=2&pageSize=10&pageState=next&sourceFields=name,id',
        )
        done()
      })
    })

    it('should drop query params that are unset', done => {
      service.getContentStripResponseApi({ path: '/api/strip', queryParams: { pageSize: 5 } } as any).subscribe(() => {
        expect(mockHttp.get).toHaveBeenCalledWith('/api/strip?pageSize=5')
        done()
      })
    })

    it('should url-encode the filters payload', done => {
      service.getContentStripResponseApi({ path: '/api/strip' } as any, { topic: 'Health' }).subscribe(() => {
        const url = mockHttp.get.mock.calls[0][0]
        expect(url).toContain('filters=')
        expect(url).toContain(encodeURIComponent(JSON.stringify({ topic: 'Health' })))
        done()
      })
    })

    it('should combine paging params and filters', done => {
      const request = { path: '/api/strip', queryParams: { pageNo: 1 } }
      service.getContentStripResponseApi(request as any, { topic: 'Health' }).subscribe(() => {
        const url = mockHttp.get.mock.calls[0][0]
        expect(url).toContain('pageNo=1')
        expect(url).toContain('filters=')
        done()
      })
    })
  })
})
