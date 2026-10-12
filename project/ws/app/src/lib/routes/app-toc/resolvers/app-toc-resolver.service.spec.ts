import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router'
import { of, throwError } from 'rxjs'

jest.mock('@ws-widget/collection', () => ({
  WidgetContentService: class MockWidgetContentService {},
  PipeContentRoutePipe: class MockPipeContentRoutePipe {},
  NsContent: {
    EContentTypes: {
      COURSE: 'Course',
      CHANNEL: 'Channel',
      KNOWLEDGE_BOARD: 'Knowledge Board',
    },
  },
}))

import { AppTocResolverService } from './app-toc-resolver.service'
import { WidgetContentService, PipeContentRoutePipe, NsContent } from '@ws-widget/collection'

const mockContentSvc: Partial<WidgetContentService> = {
  fetchContent: jest.fn(),
  fetchAuthoringContent: jest.fn(),
}

const mockRoutePipe: Partial<PipeContentRoutePipe> = {
  transform: jest.fn().mockReturnValue({ url: '/some/url', queryParams: {} }),
}

const mockRouter: Partial<Router> = {
  navigate: jest.fn(),
}

function createService(): AppTocResolverService {
  return new AppTocResolverService(
    mockContentSvc as WidgetContentService,
    mockRoutePipe as PipeContentRoutePipe,
    mockRouter as Router,
  )
}

function createSnapshot(id: string | null, primaryCategory = ''): ActivatedRouteSnapshot {
  return {
    paramMap: { get: () => id },
    queryParamMap: { get: () => primaryCategory },
  } as unknown as ActivatedRouteSnapshot
}

describe('AppTocResolverService', () => {
  let service: AppTocResolverService

  beforeEach(() => {
    jest.clearAllMocks()
    service = createService()
  })

  it('should create', () => {
    expect(service).toBeTruthy()
  })

  it('should return NO_ID error when contentId is missing', done => {
    service.resolve(createSnapshot(null), {} as RouterStateSnapshot).subscribe(result => {
      expect(result).toEqual({ error: 'NO_ID', data: null })
      done()
    })
  })

  it('should fetch content and set data when contentId present', done => {
    ;(mockContentSvc.fetchContent as jest.Mock).mockReturnValue(of({
      result: {
        content: {
          identifier: 'id1',
          children: [{ id: 'c1' }],
          primaryCategory: 'Course',
          contentType: NsContent.EContentTypes.COURSE,
        },
      },
    }))
    service.resolve(createSnapshot('id1'), {} as RouterStateSnapshot).subscribe(result => {
      expect(mockContentSvc.fetchContent).toHaveBeenCalled()
      expect(result.data).toEqual({
        identifier: 'id1',
        children: [{ id: 'c1' }],
        primaryCategory: 'Course',
        contentType: NsContent.EContentTypes.COURSE,
      })
      done()
    })
  })

  it('should use fetchAuthoringContent when in author preview', done => {
    const originalHref = window.location.href
    Object.defineProperty(window, 'location', {
      value: { href: 'http://localhost/author/toc/id1/overview' },
      writable: true,
    })
    ;(mockContentSvc.fetchAuthoringContent as jest.Mock).mockReturnValue(of({
      result: {
        content: {
          identifier: 'id1',
          children: [],
          primaryCategory: 'Course',
        },
      },
    }))
    service.resolve(createSnapshot('id1'), {} as RouterStateSnapshot).subscribe(() => {
      expect(mockContentSvc.fetchAuthoringContent).toHaveBeenCalledWith('id1')
      Object.defineProperty(window, 'location', { value: { href: originalHref }, writable: true })
      done()
    })
  })

  it('should navigate to channel route when contentType is CHANNEL', done => {
    ;(mockContentSvc.fetchContent as jest.Mock).mockReturnValue(of({
      result: {
        content: {
          identifier: 'id1',
          children: [],
          primaryCategory: 'Channel',
          contentType: NsContent.EContentTypes.CHANNEL,
        },
      },
    }))
    service.resolve(createSnapshot('id1'), {} as RouterStateSnapshot).subscribe(() => {
      expect(mockRoutePipe.transform).toHaveBeenCalled()
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/some/url'], { queryParams: {} })
      done()
    })
  })

  it('should return error on catchError', done => {
    ;(mockContentSvc.fetchContent as jest.Mock).mockReturnValue(throwError(() => 'error occurred'))
    service.resolve(createSnapshot('id1'), {} as RouterStateSnapshot).subscribe(result => {
      expect(result.error).toBe('error occurred')
      expect(result.data).toBeNull()
      done()
    })
  })
})
