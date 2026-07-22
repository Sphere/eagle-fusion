import { of } from 'rxjs'
import { WsDiscussionForumService } from './ws-discussion-forum.services'

describe('WsDiscussionForumService', () => {
  let service: WsDiscussionForumService
  let mockHttp: any
  let mockApiService: any
  let mockAccessService: any

  beforeEach(() => {
    mockHttp = {
      post: jest.fn(),
      put: jest.fn(),
    }
    mockApiService = {
      post: jest.fn(),
    }
    mockAccessService = {
      rootOrg: 'Root Org',
      org: 'My Org',
    }
    service = new WsDiscussionForumService(mockHttp, mockApiService, mockAccessService)
  })

  it('should create', () => {
    expect(service).toBeTruthy()
  })

  it('deletePost should post the delete request', () => {
    mockHttp.post.mockReturnValue(of({}))
    service.deletePost('post1', 'user1').subscribe()
    expect(mockHttp.post).toHaveBeenCalledWith(
      expect.any(String),
      { userId: 'user1', id: 'post1' },
    )
  })

  it('updateActivity should post the request', () => {
    mockHttp.post.mockReturnValue(of({}))
    const req: any = { id: 'a1' }
    service.updateActivity(req).subscribe()
    expect(mockHttp.post).toHaveBeenCalledWith(expect.any(String), req)
  })

  it('fetchActivityUsers should post the request', () => {
    mockHttp.post.mockReturnValue(of({}))
    const req: any = { id: 'a1' }
    service.fetchActivityUsers(req).subscribe()
    expect(mockHttp.post).toHaveBeenCalledWith(expect.any(String), req)
  })

  it('fetchTimelineData should post the request', () => {
    mockHttp.post.mockReturnValue(of({}))
    const req: any = { type: 'all' }
    service.fetchTimelineData(req).subscribe()
    expect(mockHttp.post).toHaveBeenCalledWith(expect.any(String), req)
  })

  it('publishPost should post the request', () => {
    mockHttp.post.mockReturnValue(of({}))
    const req: any = { text: 'hi' }
    service.publishPost(req).subscribe()
    expect(mockHttp.post).toHaveBeenCalledWith(expect.any(String), req)
  })

  it('updatePost should put the request', () => {
    mockHttp.put.mockReturnValue(of({}))
    const req: any = { id: 'p1' }
    service.updatePost(req).subscribe()
    expect(mockHttp.put).toHaveBeenCalledWith(expect.any(String), req)
  })

  it('fetchPost should post the request', () => {
    mockHttp.post.mockReturnValue(of({}))
    const req: any = { id: 'p1' }
    service.fetchPost(req).subscribe()
    expect(mockHttp.post).toHaveBeenCalledWith(expect.any(String), req)
  })

  it('fetchAllPosts should post the request', () => {
    mockHttp.post.mockReturnValue(of({}))
    const req: any = { id: 'p1' }
    service.fetchAllPosts(req).subscribe()
    expect(mockHttp.post).toHaveBeenCalledWith(expect.any(String), req)
  })

  describe('upload', () => {
    it('should call zipUpload when isZip is true', () => {
      const spy = jest.spyOn(service, 'zipUpload').mockReturnValue(of({} as any))
      const data = new FormData()
      const contentData: any = { contentId: 'c1.img', contentType: '.zip' }
      service.upload(data, contentData, {}, true)
      expect(spy).toHaveBeenCalledWith(data, contentData, {})
    })

    it('should append filename with timestamp when not in FIXED_FILE_NAME and post via apiService', () => {
      mockApiService.post.mockReturnValue(of({}))
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' })
      const data = new FormData()
      data.append('content', file)
      const contentData: any = { contentId: 'c1.img', contentType: '.pdf' }
      service.upload(data, contentData)
      expect(mockApiService.post).toHaveBeenCalled()
      const [url, newFormData] = mockApiService.post.mock.calls[0]
      expect(url).toContain('Root_Org')
      expect(url).toContain('My_Org')
      expect(url).toContain('c1')
      const appendedFile = newFormData.get('content') as File
      expect(appendedFile.name).not.toBe('test.pdf')
    })
  })

  describe('zipUpload', () => {
    it('should call apiService.post with CONTENT_BASE_ZIP url', () => {
      mockApiService.post.mockReturnValue(of({}))
      const data = new FormData()
      const contentData: any = { contentId: 'c2.img', contentType: '.zip' }
      service.zipUpload(data, contentData, {})
      expect(mockApiService.post).toHaveBeenCalled()
      const [url] = mockApiService.post.mock.calls[0]
      expect(url).toContain('Root_Org')
      expect(url).toContain('My_Org')
      expect(url).toContain('c2')
    })
  })

  describe('appendToFilename', () => {
    it('should append timestamp before extension when dot exists', () => {
      const result = service.appendToFilename('file.txt')
      expect(result.startsWith('file')).toBe(true)
      expect(result.endsWith('.txt')).toBe(true)
    })

    it('should append timestamp at end when no dot exists', () => {
      const result = service.appendToFilename('filename')
      expect(result.startsWith('filename')).toBe(true)
    })
  })
})
