import { VIEWER_ROUTE_FROM_MIME, viewerRouteGenerator } from './viewer-route-util'
import { NsContent } from './widget-content.model'

describe('viewer-route-util', () => {
  describe('VIEWER_ROUTE_FROM_MIME', () => {
    const cases: [NsContent.EMimeTypes, string][] = [
      [NsContent.EMimeTypes.MP3, 'audio'],
      [NsContent.EMimeTypes.M4A, 'audio-native'],
      [NsContent.EMimeTypes.COLLECTION, 'html'],
      [NsContent.EMimeTypes.CHANNEL, 'certification'],
      [NsContent.EMimeTypes.CERTIFICATION, 'certification'],
      [NsContent.EMimeTypes.HTML, 'html'],
      [NsContent.EMimeTypes.ZIP, 'html'],
      [NsContent.EMimeTypes.TEXT_WEB, 'html'],
      [NsContent.EMimeTypes.IAP, 'iap'],
      [NsContent.EMimeTypes.ILP_FP, 'ilp-fp'],
      [NsContent.EMimeTypes.PDF, 'pdf'],
      [NsContent.EMimeTypes.MP4, 'video'],
      [NsContent.EMimeTypes.M3U8, 'video'],
      [NsContent.EMimeTypes.YOUTUBE, 'youtube'],
      [NsContent.EMimeTypes.WEB_MODULE, 'web-module'],
      [NsContent.EMimeTypes.WEB_MODULE_EXERCISE, 'web-module'],
      [NsContent.EMimeTypes.CLASS_DIAGRAM, 'class-diagram'],
      [NsContent.EMimeTypes.HANDS_ON, 'hands-on'],
      [NsContent.EMimeTypes.RDBMS_HANDS_ON, 'rdbms-hands-on'],
      [NsContent.EMimeTypes.HTML_PICKER, 'html-picker'],
      [NsContent.EMimeTypes.QUIZ, 'quiz'],
      [NsContent.EMimeTypes.COLLECTION_RESOURCE, 'resource-collection'],
    ]

    cases.forEach(([mime, route]) => {
      it(`should map ${mime} to "${route}"`, () => {
        expect(VIEWER_ROUTE_FROM_MIME(mime)).toBe(route)
      })
    })

    it('should return an empty string for an unmapped mime type', () => {
      expect(VIEWER_ROUTE_FROM_MIME(NsContent.EMimeTypes.UNKNOWN)).toBe('')
      expect(VIEWER_ROUTE_FROM_MIME('made/up' as NsContent.EMimeTypes)).toBe('')
    })
  })

  describe('viewerRouteGenerator', () => {
    it('should build a plain viewer url with no query params', () => {
      expect(viewerRouteGenerator('c1', NsContent.EMimeTypes.PDF)).toEqual({
        url: '/viewer/pdf/c1',
        queryParams: {},
      })
    })

    it('should prefix the url with /author in preview mode', () => {
      const { url } = viewerRouteGenerator('c1', NsContent.EMimeTypes.PDF, undefined, undefined, true)
      expect(url).toBe('/author/viewer/pdf/c1')
    })

    it('should attach the primary category when supplied', () => {
      const { queryParams } = viewerRouteGenerator(
        'c1', NsContent.EMimeTypes.PDF, undefined, undefined, false, 'Learning Resource',
      )
      expect(queryParams).toEqual({ primaryCategory: 'Learning Resource' })
    })

    it('should attach a supported collection id and type', () => {
      const { queryParams } = viewerRouteGenerator(
        'c1', NsContent.EMimeTypes.PDF, 'coll-1', NsContent.EContentTypes.COURSE,
      )
      expect(queryParams).toEqual({ collectionId: 'coll-1', collectionType: NsContent.EContentTypes.COURSE })
    })

    it('should blank out an unsupported collection type while keeping the keys', () => {
      const { queryParams } = viewerRouteGenerator(
        'c1', NsContent.EMimeTypes.PDF, 'coll-1', NsContent.EContentTypes.RESOURCE,
      )
      expect(queryParams).toEqual({ collectionId: undefined, collectionType: undefined })
    })

    it('should ignore the collection when only the id is supplied', () => {
      const { queryParams } = viewerRouteGenerator('c1', NsContent.EMimeTypes.PDF, 'coll-1')
      expect(queryParams).toEqual({})
    })

    it('should attach the batch id when supplied', () => {
      const { queryParams } = viewerRouteGenerator(
        'c1', NsContent.EMimeTypes.PDF, undefined, undefined, false, undefined, 'batch-1',
      )
      expect(queryParams).toEqual({ batchId: 'batch-1' })
    })

    it('should combine primary category, collection and batch params', () => {
      const { url, queryParams } = viewerRouteGenerator(
        'c1', NsContent.EMimeTypes.MP4, 'coll-1', NsContent.EContentTypes.MODULE, false, 'Course', 'batch-1',
      )
      expect(url).toBe('/viewer/video/c1')
      expect(queryParams).toEqual({
        primaryCategory: 'Course',
        collectionId: 'coll-1',
        collectionType: NsContent.EContentTypes.MODULE,
        batchId: 'batch-1',
      })
    })
  })
})
