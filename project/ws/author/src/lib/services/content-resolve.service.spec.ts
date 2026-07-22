import { of, throwError } from 'rxjs'
import { ContentTOCResolver } from './content-resolve.service'
import { CONTENT_READ } from '../constants/apiEndpoints'

describe('ContentTOCResolver', () => {
  let resolver: ContentTOCResolver
  let apiService: any
  let accessService: any
  let router: any

  beforeEach(() => {
    apiService = { get: jest.fn() }
    accessService = { orgRootOrgAsQuery: '&orgId=org1' }
    router = { navigateByUrl: jest.fn() }
    resolver = new ContentTOCResolver(apiService, accessService, router)
  })

  it('should create', () => {
    expect(resolver).toBeTruthy()
  })

  it('should call apiService.get with content id and orgRootOrgAsQuery and emit content', done => {
    const content = { identifier: 'id1' }
    apiService.get.mockReturnValue(of(content))
    const route: any = { params: { id: 'id1' } }

    resolver.resolve(route).subscribe(result => {
      expect(result).toBe(content)
      expect(apiService.get).toHaveBeenCalledWith(`${CONTENT_READ}id1&orgId=org1`)
      done()
    })
  })

  it('should navigate to error page and emit error value on failure', done => {
    const error = { message: 'failed' }
    apiService.get.mockReturnValue(throwError(() => error))
    const route: any = { params: { id: 'id2' } }

    resolver.resolve(route).subscribe(result => {
      expect(result).toBe(error)
      expect(router.navigateByUrl).toHaveBeenCalledWith('/error-somethings-wrong')
      done()
    })
  })
})
