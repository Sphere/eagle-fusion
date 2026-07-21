jest.mock('@ws-widget/utils', () => ({
  ConfigurationsService: class {},
  ValueService: class {},
}))
jest.mock('@ws-widget/collection', () => ({
  NsContent: {},
  NsDiscussionForum: {},
}))
jest.mock('../../player-state.service', () => ({
  PlayerStateService: class {},
}))

import { PdfComponent } from './pdf.component'
import { of } from 'rxjs'

describe('PdfComponent (route-view-container/pdf)', () => {
  let component: PdfComponent
  let mockActivatedRoute: any
  let mockConfigSvc: any
  let mockViewerDataSvc: any
  let mockValueSvc: any

  beforeEach(() => {
    mockActivatedRoute = { snapshot: { queryParams: { collectionType: 'course', collectionId: 'col1' } } }
    mockConfigSvc = { restrictedFeatures: new Set(['other']) }
    mockViewerDataSvc = { playerState: of({ currentCompletionPercentage: 100 }) }
    mockValueSvc = { isXSmall$: of(false) }

    component = new PdfComponent(mockActivatedRoute, mockConfigSvc, mockViewerDataSvc, mockValueSvc)
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('subscribes to isXSmall$ in constructor and sets isSmall', () => {
    mockValueSvc.isXSmall$ = of(true)
    const c = new PdfComponent(mockActivatedRoute, mockConfigSvc, mockViewerDataSvc, mockValueSvc)
    expect(c.isSmall).toBe(true)
  })

  describe('ngOnInit', () => {
    it('sets isTypeOfCollection/collectionType/collectionIdentifier from route params', () => {
      component.ngOnInit()
      expect(component.isTypeOfCollection).toBe(true)
      expect(component.collectionType).toBe('course')
      expect(component.collectionIdentifier).toBe('col1')
    })

    it('subscribes to playerState and updates currentCompletionPercentage', () => {
      component.ngOnInit()
      expect(component.currentCompletionPercentage).toBe(100)
    })

    it('sets isRestricted true when discussionForum not restricted', () => {
      component.ngOnInit()
      expect(component.isRestricted).toBe(true)
    })

    it('sets isRestricted false when discussionForum is restricted', () => {
      mockConfigSvc.restrictedFeatures = new Set(['disscussionForum'])
      component.ngOnInit()
      expect(component.isRestricted).toBe(false)
    })

    it('handles absent restrictedFeatures gracefully', () => {
      mockConfigSvc.restrictedFeatures = undefined
      expect(() => component.ngOnInit()).not.toThrow()
      expect(component.isRestricted).toBe(false)
    })

    it('sets isTypeOfCollection false when no collectionType query param', () => {
      mockActivatedRoute.snapshot.queryParams.collectionType = undefined
      component.ngOnInit()
      expect(component.isTypeOfCollection).toBe(false)
    })
  })

  describe('isProgressCheck', () => {
    it('returns true when currentCompletionPercentage is 100', () => {
      component.currentCompletionPercentage = 100
      expect(component.isProgressCheck()).toBe(true)
    })

    it('returns false when currentCompletionPercentage is undefined', () => {
      component.currentCompletionPercentage = undefined as any
      expect(component.isProgressCheck()).toBe(false)
    })

    it('returns false when currentCompletionPercentage is a partial value', () => {
      component.currentCompletionPercentage = 50
      expect(component.isProgressCheck()).toBe(false)
    })
  })
})
