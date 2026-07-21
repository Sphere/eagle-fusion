import { ResourceCollectionService } from './resource-collection.service'

describe('ResourceCollectionService', () => {
  let service: ResourceCollectionService
  const mockHttp = {
    get: jest.fn(),
    post: jest.fn(),
  } as any

  beforeEach(() => {
    jest.clearAllMocks()
    service = new ResourceCollectionService(mockHttp)
  })

  it('should create', () => {
    expect(service).toBeTruthy()
  })

  it('getAllSubmission should call http.get with correct url', () => {
    mockHttp.get.mockReturnValue('obs')
    const result = service.getAllSubmission('all', 'content-1')
    expect(mockHttp.get).toHaveBeenCalledWith(expect.stringContaining('content-1'))
    expect(result).toBe('obs')
  })

  it('createContentDirectory should call http.post with null body', () => {
    mockHttp.post.mockReturnValue('obs')
    const result = service.createContentDirectory('content-1')
    expect(mockHttp.post).toHaveBeenCalledWith(expect.stringContaining('content-1'), null)
    expect(result).toBe('obs')
  })

  it('uploadFile should call http.post with formData', () => {
    mockHttp.post.mockReturnValue('obs')
    const formData = new FormData()
    const result = service.uploadFile(formData, 'content-1')
    expect(mockHttp.post).toHaveBeenCalledWith(expect.stringContaining('content-1'), formData)
    expect(result).toBe('obs')
  })

  it('postSubmission should call http.post with request data', () => {
    mockHttp.post.mockReturnValue('obs')
    const requestData = { submission_type: 'input', url: 'some-url' }
    const result = service.postSubmission(requestData, 'content-1')
    expect(mockHttp.post).toHaveBeenCalledWith(expect.stringContaining('content-1'), requestData)
    expect(result).toBe('obs')
  })

  it('readContentTextFile should call http.get with text responseType', () => {
    mockHttp.get.mockReturnValue('obs')
    const result = service.readContentTextFile('some-url')
    expect(mockHttp.get).toHaveBeenCalledWith('some-url', { responseType: 'text' })
    expect(result).toBe('obs')
  })
})
