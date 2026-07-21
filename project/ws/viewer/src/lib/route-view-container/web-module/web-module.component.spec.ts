jest.mock('../../../../../../../library/ws-widget/utils/src/public-api', () => ({
  ConfigurationsService: class { },
  ValueService: class { },
}))
jest.mock('@ws-widget/collection', () => ({}))
jest.mock('@ws-widget/resolver', () => ({}))

import { WebModuleComponent } from './web-module.component'
import { of } from 'rxjs'

describe('WebModuleComponent (route-view-container)', () => {
  let component: WebModuleComponent
  let mockActivatedRoute: any
  let mockConfigSvc: any
  let mockViewerDataSvc: any
  let mockValueSvc: any

  beforeEach(() => {
    mockActivatedRoute = {
      snapshot: {
        queryParams: {
          collectionType: 'course',
          collectionId: 'coll-1',
        },
      },
    }
    mockConfigSvc = {
      restrictedFeatures: new Set(['someOtherFeature']),
    }
    mockViewerDataSvc = {
      playerState: of({
        previousTitle: 'prev-title',
        nextResTitle: 'next-title',
        prevResource: 'prev-url',
        nextResource: 'next-url',
      }),
    }
    mockValueSvc = { isXSmall$: of(true) }

    component = new WebModuleComponent(
      mockActivatedRoute,
      mockConfigSvc,
      mockViewerDataSvc,
      mockValueSvc,
    )
  })

  it('should create and subscribe to isXSmall$ in constructor', () => {
    expect(component).toBeTruthy()
    expect(component.isSmall).toBe(true)
  })

  describe('ngOnInit', () => {
    it('sets isRestricted true when discussionForum not in restrictedFeatures', () => {
      component.ngOnInit()
      expect(component.isRestricted).toBe(true)
    })

    it('sets isRestricted false when discussionForum is restricted', () => {
      mockConfigSvc.restrictedFeatures = new Set(['disscussionForum'])
      component.ngOnInit()
      expect(component.isRestricted).toBe(false)
    })

    it('skips restriction check when restrictedFeatures is falsy', () => {
      mockConfigSvc.restrictedFeatures = null
      component.ngOnInit()
      expect(component.isRestricted).toBe(false)
    })

    it('sets isTypeOfCollection and collectionId when collectionType present', () => {
      component.ngOnInit()
      expect(component.isTypeOfCollection).toBe(true)
      expect(component.collectionId).toBe('coll-1')
      expect(component.collectionIdentifier).toBe('coll-1')
    })

    it('does not set collectionId when collectionType absent', () => {
      mockActivatedRoute.snapshot.queryParams = {}
      component.ngOnInit()
      expect(component.isTypeOfCollection).toBe(false)
      expect(component.collectionId).toBeNull()
    })

    it('subscribes to playerState and sets prev/next data', () => {
      component.ngOnInit()
      expect(component.prevTitle).toBe('prev-title')
      expect(component.nextTitle).toBe('next-title')
      expect(component.prevResourceUrl).toBe('prev-url')
      expect(component.nextResourceUrl).toBe('next-url')
    })
  })
})
