import { getTestBed } from '@angular/core/testing'
import * as AuthorPublicApi from './public-api'

describe('author public-api', () => {
  afterEach(() => {
    jest.spyOn(getTestBed(), 'resetTestingModule').mockImplementation(() => undefined as any)
  })

  it('should export the expected modules and services', () => {
    expect(AuthorPublicApi.WsAuthorRootModule).toBeDefined()
    expect(AuthorPublicApi.WsAuthorRootRoutingModule).toBeDefined()
    expect(AuthorPublicApi.LoaderService).toBeDefined()
    expect(AuthorPublicApi.AccessControlService).toBeDefined()
    expect(AuthorPublicApi.ApiService).toBeDefined()
  })
})
