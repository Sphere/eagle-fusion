jest.mock('../../../constants/apiConstants', () => ({
  API_END_POINTS: {
    EMAIL_TEXT: '/apis/email-text',
    EMAIL_TO_USERID: '/apis/email-to-userid',
    USER_FOLLOW_DATA: '/apis/user-follow-data',
    USER_FOLLOW: '/apis/user-follow',
    USER_UNFOLLOW: '/apis/user-unfollow',
  },
}))

jest.mock('../model/leadership-email.model', () => ({}))

import { of } from 'rxjs'
import { LeadershipService } from './leadership.service'

describe('LeadershipService', () => {
  let service: LeadershipService
  let mockHttp: any

  beforeEach(() => {
    mockHttp = {
      get: jest.fn().mockReturnValue(of({ userId: 'u-1' })),
      post: jest.fn().mockReturnValue(of({ result: { sent: true } })),
    }
    service = new LeadershipService(mockHttp)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should create', () => {
    expect(service).toBeTruthy()
  })

  it('randomId returns 1', () => {
    expect(service.randomId).toBe(1)
  })

  it('shareTextMail calls http.post with EMAIL_TEXT endpoint', done => {
    service.shareTextMail({ subject: 'Hello', body: 'World', to: [] } as any).subscribe(() => {
      expect(mockHttp.post).toHaveBeenCalledWith('/apis/email-text', expect.any(Object))
      done()
    })
  })

  it('emailToUserId calls http.get with full email URL', done => {
    service.emailToUserId('user@example.com').subscribe(() => {
      expect(mockHttp.get).toHaveBeenCalledWith('/apis/email-to-userid/user@example.com')
      done()
    })
  })

  it('fetchUserFollow calls http.post with userId in body', done => {
    service.fetchUserFollow('user-123').subscribe(() => {
      expect(mockHttp.post).toHaveBeenCalledWith('/apis/user-follow-data', { userid: 'user-123' })
      done()
    })
  })

  it('followUser calls http.post with USER_FOLLOW endpoint', done => {
    service.followUser({ followId: 'u-2' }).subscribe(() => {
      expect(mockHttp.post).toHaveBeenCalledWith('/apis/user-follow', { followId: 'u-2' })
      done()
    })
  })

  it('unFollowUser calls http.post with USER_UNFOLLOW endpoint', done => {
    service.unFollowUser({ followId: 'u-2' }).subscribe(() => {
      expect(mockHttp.post).toHaveBeenCalledWith('/apis/user-unfollow', { followId: 'u-2' })
      done()
    })
  })
})
