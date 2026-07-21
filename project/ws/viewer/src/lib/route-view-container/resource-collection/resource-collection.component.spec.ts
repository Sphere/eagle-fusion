jest.mock('@ws-widget/collection', () => ({
  NsContent: {},
  NsDiscussionForum: {},
}))
jest.mock('@ws-widget/resolver', () => ({
  NsWidgetResolver: {},
}))
jest.mock('../../../../../../../library/ws-widget/utils/src/public-api', () => ({
  ConfigurationsService: class {},
}))

import { of, Subject } from 'rxjs'
import { ResourceCollectionComponent } from './resource-collection.component'

describe('ResourceCollectionComponent', () => {
  let component: ResourceCollectionComponent
  let playerStateSubject: Subject<any>
  const mockActivatedRoute = {
    snapshot: { queryParams: {} as any },
  } as any
  const mockConfigSvc = { restrictedFeatures: null } as any
  const mockViewerDataSvc = { playerState: of({}) } as any

  beforeEach(() => {
    mockActivatedRoute.snapshot.queryParams = {}
    mockConfigSvc.restrictedFeatures = null
    playerStateSubject = new Subject()
    mockViewerDataSvc.playerState = playerStateSubject
    component = new ResourceCollectionComponent(mockActivatedRoute, mockConfigSvc, mockViewerDataSvc)
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  describe('ngOnInit', () => {
    it('should not set isRestricted when restrictedFeatures is falsy', () => {
      mockConfigSvc.restrictedFeatures = null
      component.ngOnInit()
      expect(component.isRestricted).toBe(false)
    })

    it('should set isRestricted based on restrictedFeatures.has result', () => {
      mockConfigSvc.restrictedFeatures = { has: jest.fn().mockReturnValue(false) }
      component.ngOnInit()
      expect(component.isRestricted).toBe(true)
      expect(mockConfigSvc.restrictedFeatures.has).toHaveBeenCalledWith('disscussionForum')
    })

    it('should set isRestricted false when discussionForum feature is present', () => {
      mockConfigSvc.restrictedFeatures = { has: jest.fn().mockReturnValue(true) }
      component.ngOnInit()
      expect(component.isRestricted).toBe(false)
    })

    it('should not set isTypeOfCollection or collectionId when no collectionType query param', () => {
      mockActivatedRoute.snapshot.queryParams = {}
      component.ngOnInit()
      expect(component.isTypeOfCollection).toBe(false)
      expect(component.collectionId).toBeNull()
    })

    it('should set isTypeOfCollection and collectionId when collectionType query param present', () => {
      mockActivatedRoute.snapshot.queryParams = { collectionType: 'course', collectionId: 'coll-1' }
      component.ngOnInit()
      expect(component.isTypeOfCollection).toBe(true)
      expect(component.collectionId).toBe('coll-1')
    })

    it('should subscribe to playerState and update navigation fields', () => {
      component.ngOnInit()
      playerStateSubject.next({
        previousTitle: 'prev-title',
        nextResTitle: 'next-title',
        prevResource: 'prev-url',
        nextResource: 'next-url',
      })
      expect(component.prevTitle).toBe('prev-title')
      expect(component.nextTitle).toBe('next-title')
      expect(component.prevResourceUrl).toBe('prev-url')
      expect(component.nextResourceUrl).toBe('next-url')
    })
  })
})
